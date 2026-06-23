#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const puppeteer = require('puppeteer');

let browser = null;

async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

async function extractPageContent(url) {
  const b = await initBrowser();
  let page = null;
  try {
    page = await b.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const content = await page.evaluate(() => ({
      title: document.title,
      html: document.documentElement.outerHTML,
      text: document.body.innerText,
      url: window.location.href,
      metadata: {
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
        author: document.querySelector('meta[name="author"]')?.getAttribute('content') || '',
      },
    }));
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (page) await page.close();
  }
}

async function extractTableData(url, tableSelector) {
  const b = await initBrowser();
  let page = null;
  try {
    page = await b.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const tables = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector || 'table');
      return Array.from(elements).map((table) => {
        const rows = [];
        table.querySelectorAll('tr').forEach((row) => {
          const cells = Array.from(row.querySelectorAll('th, td')).map((c) => c.innerText);
          if (cells.length > 0) rows.push(cells);
        });
        return rows;
      });
    }, tableSelector);
    return { success: true, data: tables };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (page) await page.close();
  }
}

async function takeScreenshot(url, fullPage = false) {
  const b = await initBrowser();
  let page = null;
  try {
    page = await b.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const screenshot = await page.screenshot({ fullPage, type: 'png' });
    return { success: true, data: screenshot.toString('base64'), encoding: 'base64' };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (page) await page.close();
  }
}

async function clickAndExtract(url, selector) {
  const b = await initBrowser();
  let page = null;
  try {
    page = await b.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });
    const content = await page.evaluate(() => ({
      title: document.title,
      html: document.documentElement.outerHTML,
      text: document.body.innerText,
      url: window.location.href,
    }));
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: `Error al hacer clic en '${selector}': ${error.message}` };
  } finally {
    if (page) await page.close();
  }
}

const TOOLS = [
  {
    name: 'extract_page_content',
    description: 'Extrae el contenido completo de una página web incluyendo HTML, texto, título y metadatos',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'La URL de la página a extraer' } },
      required: ['url'],
    },
  },
  {
    name: 'extract_table_data',
    description: 'Extrae datos de tablas HTML de una página web',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'La URL de la página' },
        tableSelector: { type: 'string', description: 'Selector CSS para identificar las tablas (default: "table")' },
      },
      required: ['url'],
    },
  },
  {
    name: 'take_screenshot',
    description: 'Toma una captura de pantalla de una página web',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'La URL de la página' },
        fullPage: { type: 'boolean', description: 'Si capturar la página completa (default: false)', default: false },
      },
      required: ['url'],
    },
  },
  {
    name: 'click_and_extract',
    description: 'Hace clic en un elemento de la página usando un selector CSS y luego extrae el contenido de la página resultante.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'La URL de la página inicial' },
        selector: { type: 'string', description: 'El selector CSS del elemento en el que hacer clic' },
      },
      required: ['url', 'selector'],
    },
  },
];

const server = new Server(
  { name: 'puppeteer-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  let result;
  switch (name) {
    case 'extract_page_content':
      result = await extractPageContent(args.url);
      break;
    case 'extract_table_data':
      result = await extractTableData(args.url, args.tableSelector);
      break;
    case 'take_screenshot':
      result = await takeScreenshot(args.url, args.fullPage);
      break;
    case 'click_and_extract':
      result = await clickAndExtract(args.url, args.selector);
      break;
    default:
      result = { success: false, error: `Herramienta desconocida: ${name}` };
  }
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
});

process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit(0);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
