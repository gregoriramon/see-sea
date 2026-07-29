#!/usr/bin/env node
/**
 * Reescribe www/index.html para que los <link rel="modulepreload">, <script src>
 * y <link rel="stylesheet"> apunten a rutas absolutas (prefijadas con /).
 *
 * Motivo: cuando el usuario carga una ruta profunda (ej. /tabs/calendario) y
 * el HTML tiene <script src="chunk-XXX.js"> sin barra, algunos navegadores
 * (especialmente mobile Lighthouse) no aplican <base href> a modulepreload,
 * y resuelven contra la URL actual → piden /tabs/chunk-XXX.js → Cloudflare
 * hace SPA fallback y devuelve index.html como si fuese JS. Con rutas
 * absolutas evitamos ese problema.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Angular SSR usa www/browser/index.html. Fallback a www/index.html si no existe (setup no-SSR).
import { existsSync } from 'node:fs';
const WWW_BROWSER_INDEX = resolve(__dirname, '..', 'www', 'browser', 'index.html');
const WWW_INDEX = resolve(__dirname, '..', 'www', 'index.html');
const INDEX = existsSync(WWW_BROWSER_INDEX) ? WWW_BROWSER_INDEX : WWW_INDEX;

const html = readFileSync(INDEX, 'utf8');

// Reescribe href="X" / src="X" cuando X no empiece por /, http, data:, mailto:, #
const rewritten = html
  .replace(/(<link\s+[^>]*rel=(?:"|')modulepreload(?:"|')[^>]*href=(?:"|'))(?!\/|https?:|data:|#)([^"']+)(?=(?:"|'))/g,
    (_, pre, path) => `${pre}/${path}`)
  .replace(/(<link\s+[^>]*rel=(?:"|')stylesheet(?:"|')[^>]*href=(?:"|'))(?!\/|https?:|data:|#)([^"']+)(?=(?:"|'))/g,
    (_, pre, path) => `${pre}/${path}`)
  .replace(/(<script\s+[^>]*src=(?:"|'))(?!\/|https?:|data:)([^"']+)(?=(?:"|'))/g,
    (_, pre, path) => `${pre}/${path}`);

if (rewritten === html) {
  console.log('[absolutize-index] Nada que reescribir.');
} else {
  writeFileSync(INDEX, rewritten, 'utf8');
  const preloads = (rewritten.match(/rel=(?:"|')modulepreload/g) || []).length;
  const scripts = (rewritten.match(/<script\s+[^>]*src=(?:"|')\//g) || []).length;
  const styles = (rewritten.match(/rel=(?:"|')stylesheet(?:"|')[^>]*href=(?:"|')\//g) || []).length;
  console.log(`[absolutize-index] OK · modulepreloads=${preloads} scripts=${scripts} stylesheets=${styles}`);
}
