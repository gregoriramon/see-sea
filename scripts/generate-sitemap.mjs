#!/usr/bin/env node
/**
 * Genera public/sitemap.xml con:
 *   - Rutas estáticas (tabs).
 *   - Rutas dinámicas /tabs/playa/:codPlaya y /tabs/evento/:id (si hay Supabase disponible).
 *
 * Uso:
 *   SITE_URL=https://consisi.com \
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... \
 *   node scripts/generate-sitemap.mjs
 *
 * Si no hay credenciales de Supabase, se genera solo con rutas estáticas.
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
  },
  cons: {
    SITE_URL: 'https://sisi-cons.pages.dev',
    SUPABASE_URL: 'https://peojsedikxvmbirvlgmi.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_cQUPa0x3FF5UIL6_S9xngg_20E9fLfi',
  },
};

const envArg = (process.argv.find((a) => a.startsWith('--env=')) || '').split('=')[1];
const ENV = envArg || process.env.BUILD_ENV || 'prod';
const defaults = DEFAULTS[ENV] ?? DEFAULTS.prod;

const SITE_URL = (process.env.SITE_URL || defaults.SITE_URL).replace(/\/$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || defaults.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || defaults.SUPABASE_ANON_KEY;

const STATIC_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/tabs/calendario', changefreq: 'daily', priority: '0.9' },
  { path: '/tabs/eventos', changefreq: 'daily', priority: '0.9' },
  { path: '/tabs/buscar', changefreq: 'weekly', priority: '0.8' },
  { path: '/tabs/favoritas', changefreq: 'weekly', priority: '0.5' },
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
    .from('travesias')
    .select('id,slug')
    .limit(10000);
  if (eEventos) console.warn('[sitemap] error travesias:', eEventos.message);

  return { playas: playas ?? [], eventos: eventos ?? [] };
}

function urlEntry(path, changefreq = 'weekly', priority = '0.6') {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  const { playas, eventos } = await fetchDynamic();

  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...STATIC_PATHS.map((s) => urlEntry(s.path, s.changefreq, s.priority)),
    ...playas.map((p) => urlEntry(`/tabs/playa/${p.slug ?? p.cod_playa}`, 'daily', '0.7')),
    ...eventos.map((e) => urlEntry(e.slug ? `/tabs/travesia/${e.slug}` : `/tabs/evento/${e.id}`, 'weekly', '0.7')),
    '</urlset>',
    '',
  ];

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, parts.join('\n'), 'utf8');
  console.log(`[sitemap] ${OUTPUT} · estáticas=${STATIC_PATHS.length} playas=${playas.length} eventos=${eventos.length}`);
}

main().catch((err) => {
  console.error('[sitemap] error inesperado:', err);
  process.exit(1);
});
