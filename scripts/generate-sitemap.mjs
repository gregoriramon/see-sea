#!/usr/bin/env node
/**
 * Genera public/sitemap.xml con:
 *   - Rutas estáticas (tabs).
 *   - Rutas dinámicas /tabs/playa/:codPlaya y /tabs/evento/:id (si hay Supabase disponible).
 *
 * Uso:
 *   SITE_URL=https://consisi.com \
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... \
 *   node scripts/generate-sitemap.mjs [--env=prod|cons] [--ping-indexnow]
 *
 * Si no hay credenciales de Supabase, se genera solo con rutas estáticas.
 * Con --ping-indexnow (o PING_INDEXNOW=1) notifica todas las URLs a Bing/Yandex vía IndexNow.
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'public', 'sitemap.xml');

const DEFAULTS = {
  prod: {
    SITE_URL: 'https://consisi.com',
    SUPABASE_URL: 'https://alchktnrwblnwnwrnxim.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_vVuk_xQYxXpNBTbNLorC-Q_g3QhpoDJ',
    INDEXNOW_KEY: 'e12e7c545fd14f1eae07851367dfc313',
  },
  cons: {
    SITE_URL: 'https://sisi-cons.pages.dev',
    SUPABASE_URL: 'https://peojsedikxvmbirvlgmi.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_cQUPa0x3FF5UIL6_S9xngg_20E9fLfi',
    INDEXNOW_KEY: null,
  },
};

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const envArg = (process.argv.find((a) => a.startsWith('--env=')) || '').split('=')[1];
const ENV = envArg || process.env.BUILD_ENV || 'prod';
const defaults = DEFAULTS[ENV] ?? DEFAULTS.prod;

const SITE_URL = (process.env.SITE_URL || defaults.SITE_URL).replace(/\/$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || defaults.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || defaults.SUPABASE_ANON_KEY;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || defaults.INDEXNOW_KEY;
const PING_INDEXNOW = process.argv.includes('--ping-indexnow') || process.env.PING_INDEXNOW === '1';

const STATIC_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/tabs/eventos', changefreq: 'daily', priority: '0.9' },
  { path: '/tabs/buscar', changefreq: 'weekly', priority: '0.8' },
];

async function fetchDynamic() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[sitemap] SUPABASE_URL/SUPABASE_ANON_KEY no definidos — solo rutas estáticas.');
    return { playas: [], eventos: [] };
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: playas, error: ePlayas } = await supabase
    .from('playa')
    .select('cod_playa,slug')
    .limit(10000);
  if (ePlayas) console.warn('[sitemap] error playa:', ePlayas.message);

  const { data: eventos, error: eEventos } = await supabase
    .from('tb_travesias')
    .select('id,slug,created_at')
    .limit(10000);
  if (eEventos) console.warn('[sitemap] error tb_travesias:', eEventos.message);

  return { playas: playas ?? [], eventos: eventos ?? [] };
}

function urlEntry(path, changefreq = 'weekly', priority = '0.6', lastmod) {
  const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>
    <loc>${SITE_URL}${path}</loc>${lastmodLine}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function toIsoDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

async function pingIndexNow(urls) {
  if (!PING_INDEXNOW) return;
  if (!INDEXNOW_KEY) {
    console.warn('[indexnow] omitido: INDEXNOW_KEY no definida para este entorno.');
    return;
  }
  const host = new URL(SITE_URL).host;
  const body = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };
  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`[indexnow] host=${host} urls=${urls.length} status=${res.status}`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[indexnow] respuesta no OK: ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.warn('[indexnow] error de red (no bloqueante):', err.message);
  }
}

async function main() {
  const { playas, eventos } = await fetchDynamic();

  const staticUrls = STATIC_PATHS.map((s) => `${SITE_URL}${s.path}`);
  const playaUrls = playas.map((p) => `${SITE_URL}/tabs/playa/${p.slug ?? p.cod_playa}`);
  const eventoUrls = eventos.map((e) => `${SITE_URL}${e.slug ? `/tabs/travesia/${e.slug}` : `/tabs/evento/${e.id}`}`);
  const allUrls = [...staticUrls, ...playaUrls, ...eventoUrls];

  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...STATIC_PATHS.map((s) => urlEntry(s.path, s.changefreq, s.priority)),
    ...playas.map((p) => urlEntry(`/tabs/playa/${p.slug ?? p.cod_playa}`, 'never', '0.7', '2025-01-01')),
    ...eventos.map((e) => urlEntry(e.slug ? `/tabs/travesia/${e.slug}` : `/tabs/evento/${e.id}`, 'weekly', '0.7', toIsoDate(e.created_at))),
    '</urlset>',
    '',
  ];

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, parts.join('\n'), 'utf8');
  console.log(`[sitemap] ${OUTPUT} · estáticas=${STATIC_PATHS.length} playas=${playas.length} eventos=${eventos.length}`);

  await pingIndexNow(allUrls);
}

main().catch((err) => {
  console.error('[sitemap] error inesperado:', err);
  process.exit(1);
});
