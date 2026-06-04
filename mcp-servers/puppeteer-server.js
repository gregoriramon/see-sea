#!/usr/bin/env node

const puppeteer = require('puppeteer');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let browser = null;

async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

async function extractPageContent(url) {
  const browser = await initBrowser();
  let page = null;
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.evaluate(() => {
      return {
        title: document.title,
        html: document.documentElement.outerHTML,
        text: document.body.innerText,
        url: window.location.href,
        metadata: {
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
          author: document.querySelector('meta[name="author"]')?.getAttribute('content') || ''
        }
      };
    });

    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (page) await page.close();
  }
}

async function extractTableData(url, tableSelector) {
  const browser = await initBrowser();
  let page = null;
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const tables = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector || 'table');
      return Array.from(elements).map(table => {
        const rows = [];
        table.querySelectorAll('tr').forEach(row => {
          const cells = Array.from(row.querySelectorAll('th, td')).map(cell => cell.innerText);
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
  const browser = await initBrowser();
  let page = null;
  try {
    page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const screenshot = await page.screenshot({
      fullPage,
      type: 'png'
    });

    return {
      success: true,
      data: screenshot.toString('base64'),
      encoding: 'base64'
    };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (page) await page.close();
  }
}

async function handleMessage(message) {
  try {
    const request = JSON.parse(message);

    let response;
    switch (request.method) {
      case 'initialize':
        response = {
          result: {
            name: 'puppeteer-mcp',
            version: '1.0.0'
          }
        };
        break;

      case 'tools/list':
        response = {
          result: {
            tools: [
              {
                name: 'extract_page_content',
                description: 'Extrae el contenido completo de una página web incluyendo HTML, texto, título y metadatos',
                inputSchema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'La URL de la página a extraer'
                    }
                  },
                  required: ['url']
                }
              },
              {
                name: 'extract_table_data',
                description: 'Extrae datos de tablas HTML de una página web',
                inputSchema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'La URL de la página'
                    },
                    tableSelector: {
                      type: 'string',
                      description: 'Selector CSS para identificar las tablas (default: "table")'
                    }
                  },
                  required: ['url']
                }
              },
              {
                name: 'take_screenshot',
                description: 'Toma una captura de pantalla de una página web',
                inputSchema: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'La URL de la página'
                    },
                    fullPage: {
                      type: 'boolean',
                      description: 'Si capturar la página completa (default: false)',
                      default: false
                    }
                  },
                  required: ['url']
                }
              }
            ]
          }
        };
        break;

      case 'tools/call':
        const toolName = request.params?.name;
        const toolInput = request.params?.arguments || {};

        let toolResult;
        switch (toolName) {
          case 'extract_page_content':
            toolResult = await extractPageContent(toolInput.url);
            break;
          case 'extract_table_data':
            toolResult = await extractTableData(toolInput.url, toolInput.tableSelector);
            break;
          case 'take_screenshot':
            toolResult = await takeScreenshot(toolInput.url, toolInput.fullPage);
            break;
          default:
            toolResult = { success: false, error: `Herramienta desconocida: ${toolName}` };
        }

        response = { result: toolResult };
        break;

      default:
        response = { error: `Método desconocido: ${request.method}` };
    }

    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  }
}

async function main() {
  let buffer = '';

  rl.on('line', async (line) => {
    buffer += line + '\n';

    try {
      if (buffer.includes('\n')) {
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          if (lines[i].trim()) {
            await handleMessage(lines[i]);
          }
        }
        buffer = lines[lines.length - 1];
      }
    } catch (error) {
      console.log(JSON.stringify({ error: error.message }));
    }
  });

  rl.on('close', async () => {
    if (browser) {
      await browser.close();
    }
    process.exit(0);
  });
}

main().catch(console.error);
