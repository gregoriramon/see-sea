#!/usr/bin/env node
/**
 * Genera HTMLs prerenderizados con meta tags y JSON-LD específicos por URL.
 *
 * Toma `www/browser/index.html` como plantilla, y para cada playa/evento
 * crea `www/browser/tabs/playa/<slug>/index.html` (o `.../travesia/<slug>/...`)
 * con:
 *   - <title> único
 *   - <meta name="description"> único
 *   - <link rel="canonical"> apuntando a esa URL
 *   - meta OG y Twitter específicos
 *   - JSON-LD Beach (playas) o SportsEvent (eventos)
 *
 * El resto del HTML (splash, service worker, chunks) queda igual → Angular
 * toma control en el navegador y sobreescribe los tags con los mismos valores.
 *
 * Uso:
 *   node scripts/prerender-meta.mjs [--env=prod|cons]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BROWSER_DIR = resolve(ROOT, 'www', 'browser');
const TEMPLATE = resolve(BROWSER_DIR, 'index.html');

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
const d = DEFAULTS[ENV] ?? DEFAULTS.prod;
const SITE_URL = (process.env.SITE_URL || d.SITE_URL).replace(/\/$/, '');
const SUPABASE_URL = process.env.SUPABASE_URL || d.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || d.SUPABASE_ANON_KEY;

const SITE_NAME = 'SiSi (SeeSea)';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/og-image.png`;

// ---------- Helpers ----------

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function clampDescription(text, max = 155) {
  if (!text) return '';
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[\s.,;:·—-]+$/, '')}…`;
}

/** Convierte DMS ("42º 26' 53\"") o string decimal a número decimal. */
function toDecimalDegrees(value) {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const raw = String(value).trim();
  const asFloat = parseFloat(raw.replace(',', '.'));
  if (!isNaN(asFloat) && /^-?\d+(\.\d+)?$/.test(raw.replace(',', '.'))) return asFloat;
  const match = raw.match(/^\s*(-?)\s*(\d+)\s*[º°]\s*(\d+)\s*['′]\s*(\d+(?:\.\d+)?)\s*["″]?\s*$/);
  if (!match) return undefined;
  const [, sign, deg, min, sec] = match;
  const decimal = parseInt(deg, 10) + parseInt(min, 10) / 60 + parseFloat(sec) / 3600;
  const signed = sign === '-' ? -decimal : decimal;
  return Number.isFinite(signed) ? Number(signed.toFixed(6)) : undefined;
}

function replaceTitle(html, newTitle) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(newTitle)}</title>`);
}

function replaceMetaName(html, name, content) {
  const re = new RegExp(`<meta\\s+name="${name}"\\s+content="[^"]*"\\s*/?>`, 'i');
  const replacement = `<meta name="${name}" content="${escapeHtml(content)}"/>`;
  if (re.test(html)) return html.replace(re, replacement);
  // Inserta antes de </head>
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function replaceMetaProperty(html, property, content) {
  const re = new RegExp(`<meta\\s+property="${property}"\\s+content="[^"]*"\\s*/?>`, 'i');
  const replacement = `<meta property="${property}" content="${escapeHtml(content)}"/>`;
  if (re.test(html)) return html.replace(re, replacement);
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function replaceCanonical(html, url) {
  const re = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const replacement = `<link rel="canonical" href="${escapeHtml(url)}"/>`;
  if (re.test(html)) return html.replace(re, replacement);
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function insertJsonLd(html, id, data) {
  // Elimina bloque previo con mismo id (por si acaso)
  html = html.replace(new RegExp(`<script[^>]*id="${id}"[^>]*>[\\s\\S]*?<\\/script>`, 'i'), '');
  const json = JSON.stringify(data, (_, v) => (v === undefined ? undefined : v));
  const block = `<script type="application/ld+json" id="${id}">${json}</script>`;
  return html.replace('</head>', `  ${block}\n</head>`);
}

function writeHtml(routePath, html) {
  const outFile = resolve(BROWSER_DIR, routePath.replace(/^\/+/, ''), 'index.html');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html, 'utf8');
}

// ---------- Builders por tipo ----------

function buildPageHead(template, { title, description, canonicalPath, ogType = 'website' }) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const desc = clampDescription(description);
  const url = `${SITE_URL}${canonicalPath}`;
  let html = template;
  html = replaceTitle(html, fullTitle);
  html = replaceMetaName(html, 'description', desc);
  html = replaceCanonical(html, url);
  html = replaceMetaProperty(html, 'og:title', fullTitle);
  html = replaceMetaProperty(html, 'og:description', desc);
  html = replaceMetaProperty(html, 'og:url', url);
  html = replaceMetaProperty(html, 'og:type', ogType);
  html = replaceMetaProperty(html, 'og:image', DEFAULT_OG_IMAGE);
  html = replaceMetaName(html, 'twitter:title', fullTitle);
  html = replaceMetaName(html, 'twitter:description', desc);
  html = replaceMetaName(html, 'twitter:image', DEFAULT_OG_IMAGE);
  return html;
}

function buildBeachJsonLd(playa, canonicalPath) {
  const lat = toDecimalDegrees(playa.lat);
  const lon = toDecimalDegrees(playa.lon);
  return {
    '@context': 'https://schema.org',
    '@type': 'Beach',
    name: playa.playa,
    url: `${SITE_URL}${canonicalPath}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: playa.municipio || undefined,
      addressRegion: playa.provincia || undefined,
      addressCountry: 'ES',
    },
    geo: (lat !== undefined && lon !== undefined)
      ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lon }
      : undefined,
    containedInPlace: playa.ccaa
      ? { '@type': 'AdministrativeArea', name: playa.ccaa }
      : undefined,
  };
}

function buildSportsEventJsonLd(evento, canonicalPath) {
  const descripcion = [
    `Travesía a nado ${evento.descripcion || ''}`.trim(),
    evento.distancia ? `Distancia: ${evento.distancia}` : '',
    (evento.lugar_evento || evento.municipio) ? `Lugar: ${evento.lugar_evento || evento.municipio}` : '',
  ].filter(Boolean).join('. ');
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: evento.descripcion || 'Travesía a nado',
    description: descripcion || undefined,
    sport: 'Open Water Swimming',
    url: `${SITE_URL}${canonicalPath}`,
    startDate: evento.fecha_evento || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: evento.lugar_evento || evento.municipio || 'España',
      address: {
        '@type': 'PostalAddress',
        addressLocality: evento.municipio || undefined,
        addressRegion: evento.provincia || undefined,
        addressCountry: 'ES',
      },
    },
    organizer: evento.organizador ? { '@type': 'Organization', name: evento.organizador } : undefined,
    offers: evento.url_inscripcion ? {
      '@type': 'Offer',
      url: evento.url_inscripcion,
      price: evento.precio ?? undefined,
      priceCurrency: 'EUR',
      availability: evento.inscripciones_abiertas ? 'https://schema.org/InStock' : undefined,
      validThrough: evento.fecha_fin_inscripcion || undefined,
    } : undefined,
  };
}

// ---------- Main ----------

async function main() {
  const template = readFileSync(TEMPLATE, 'utf8');

  // Estáticas públicas (además de /)
  const staticPages = [
    {
      path: '/tabs/eventos',
      title: 'Próximas travesías a nado en aguas abiertas',
      description: 'Calendario de travesías a nado en aguas abiertas por España: distancias, fechas y localidades. Encuentra tu próxima carrera.',
    },
    {
      path: '/tabs/buscar',
      title: 'Buscar playas de España',
      description: 'Explora las playas de España con previsión marítima detallada: viento, oleaje, temperatura del agua, UV y sensación térmica.',
    },
  ];

  for (const p of staticPages) {
    const html = buildPageHead(template, {
      title: p.title,
      description: p.description,
      canonicalPath: p.path,
    });
    writeHtml(p.path, html);
  }

  // Datos dinámicos
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: playas, error: ePlayas } = await supabase
    .from('playa')
    .select('cod_playa,slug,playa,municipio,provincia,ccaa,lat,lon')
    .limit(10000);
  if (ePlayas) throw new Error(`Supabase playa error: ${ePlayas.message}`);

  const { data: eventos, error: eEventos } = await supabase
    .from('tb_travesias')
    .select('id,slug,descripcion,fecha_evento,lugar_evento,municipio,provincia,distancia,organizador,precio,url_inscripcion,fecha_fin_inscripcion')
    .limit(10000);
  if (eEventos) throw new Error(`Supabase tb_travesias error: ${eEventos.message}`);

  let playaCount = 0;
  for (const playa of playas ?? []) {
    const slug = playa.slug || playa.cod_playa;
    if (!slug) continue;
    const path = `/tabs/playa/${slug}`;
    let html = buildPageHead(template, {
      title: `Previsión marítima de ${playa.playa}`,
      description: `Estado del mar y previsión meteorológica de la playa ${playa.playa}${playa.municipio ? ' (' + playa.municipio + ')' : ''}: viento, oleaje, temperatura del agua y UV.`,
      canonicalPath: path,
      ogType: 'article',
    });
    html = insertJsonLd(html, 'playa-jsonld', buildBeachJsonLd(playa, path));
    writeHtml(path, html);
    playaCount++;
  }

  let eventoCount = 0;
  for (const evento of eventos ?? []) {
    if (!evento.slug) continue;
    const path = `/tabs/travesia/${evento.slug}`;
    const nombre = evento.descripcion || 'Travesía a nado';
    const localidad = evento.lugar_evento || evento.municipio || '';
    const fecha = evento.fecha_evento || '';
    let html = buildPageHead(template, {
      title: `Travesía a nado ${nombre}${localidad ? ' · ' + localidad : ''}`,
      description: `Información de la travesía a nado ${nombre}${localidad ? ' en ' + localidad : ''}${fecha ? ' (' + fecha + ')' : ''}. Distancia, categorías e inscripción.`,
      canonicalPath: path,
      ogType: 'article',
    });
    html = insertJsonLd(html, 'evento-jsonld', buildSportsEventJsonLd(evento, path));
    writeHtml(path, html);
    eventoCount++;
  }

  console.log(`[prerender] estáticas=${staticPages.length} playas=${playaCount} eventos=${eventoCount} → ${BROWSER_DIR}`);
}

main().catch((err) => {
  console.error('[prerender] error:', err);
  process.exit(1);
});
