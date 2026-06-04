#!/usr/bin/env node

/**
 * Script de prueba: Automatización de eventos deportivos
 * Demuestra el flujo completo: Brave Search → Puppeteer → Supabase
 *
 * Uso:
 *   node scripts/test-eventos-automation.js [deporte] [ubicacion] [dias]
 *
 * Ejemplos:
 *   node scripts/test-eventos-automation.js
 *   node scripts/test-eventos-automation.js surf Valencia
 *   node scripts/test-eventos-automation.js ciclismo "Castilla y León" 60
 */

const args = process.argv.slice(2);

const deporte = args[0] || 'deportivos';
const ubicacion = args[1] || 'Valencia';
const dias = parseInt(args[2]) || 30;

console.log('='.repeat(70));
console.log('📊 AUTOMATIZACIÓN DE EVENTOS DEPORTIVOS');
console.log('='.repeat(70));
console.log(`\nParámetros:`);
console.log(`  • Deporte: ${deporte}`);
console.log(`  • Ubicación: ${ubicacion}`);
console.log(`  • Rango: últimos ${dias} días`);
console.log('\n' + '='.repeat(70));

console.log('\n🔍 FASE 1: BÚSQUEDA CON BRAVE SEARCH');
console.log('-'.repeat(70));
console.log(`Ejecutando: brave_web_search`);
console.log(`  query: "${deporte} eventos ${ubicacion} 2026"`);
console.log(`  country: "es"`);
console.log(`  language: "es"`);
console.log(`  freshness: "pastmonth"`);
console.log(`\n✅ Esta fase usa la herramienta MCP: brave_web_search`);
console.log(`   Resultado esperado: 5-8 URLs de eventos relevantes`);

console.log('\n📄 FASE 2: EXTRACCIÓN CON PUPPETEER');
console.log('-'.repeat(70));
console.log(`Para cada URL encontrada:`);
console.log(`  1. Ejecutar: extract_page_content(url)`);
console.log(`  2. Parsear del contenido:`);
console.log(`     - fecha_evento (DATE)`);
console.log(`     - descripcion (varchar, max 500)`);
console.log(`     - lugar_evento (varchar)`);
console.log(`     - organizador (varchar)`);
console.log(`     - precio (int€, NULL si gratuito)`);
console.log(`     - distancia (int metros, si aplica)`);
console.log(`     - url_inscripcion (si existe)`);
console.log(`     - lat, lon (coordenadas decimales)`);
console.log(`     - url_info (URL original - clave dedup)`);
console.log(`  3. Validar (fecha >= hoy, url_info no vacía)`);
console.log(`\n✅ Esta fase usa la herramienta MCP: extract_page_content`);
console.log(`   Resultado esperado: N eventos validados`);

console.log('\n💾 FASE 3: PERSISTENCIA EN SUPABASE');
console.log('-'.repeat(70));
console.log(`Para cada evento validado:`);
console.log(`  1. Buscar: SELECT id FROM tb_eventos WHERE url_info = '...'`);
console.log(`  2a. Si NOT exists → INSERT en tb_eventos`);
console.log(`  2b. Si exists → UPDATE tb_eventos (COALESCE)`);
console.log(`\nEstructura INSERT:`);
console.log(`  fecha_evento, descripcion, lugar_evento, organizador,`);
console.log(`  url_info, url_inscripcion, precio, distancia, lat, lon, location`);
console.log(`\nEstructura location (PostGIS):`);
console.log(`  ST_MakePoint(lon, lat)::geography  ← Orden: LONGITUD PRIMERO`);
console.log(`\n✅ Esta fase usa la herramienta MCP: execute_sql (Supabase)`);
console.log(`   Resultado esperado: N insertados, M actualizados`);

console.log('\n📊 FASE 4: RESUMEN');
console.log('-'.repeat(70));
console.log(`Mostrar al usuario:`);
console.log(`  - URLs encontradas`);
console.log(`  - Eventos extraídos`);
console.log(`  - Eventos validados`);
console.log(`  - Insertados (nuevos)`);
console.log(`  - Actualizados`);
console.log(`  - Errores`);
console.log(`  - Tiempo total`);

console.log('\n' + '='.repeat(70));
console.log('📋 CÓMO USAR ESTA AUTOMATIZACIÓN');
console.log('='.repeat(70));
console.log(`\n1️⃣  DESDE CLAUDE CODE (Recomendado):`);
console.log(`   /eventos`);
console.log(`   /eventos deporte=surf ubicacion=Valencia`);
console.log(`   /eventos deporte=ciclismo ubicacion="Castilla y León" dias=60`);

console.log(`\n2️⃣  DESDE TERMINAL (Este script):`);
console.log(`   npm run test:eventos`);
console.log(`   npm run test:eventos -- surf Valencia`);
console.log(`   npm run test:eventos -- ciclismo "Castilla y León" 60`);

console.log(`\n3️⃣  AUTOMATIZADO (Cron job):`);
console.log(`   Ejecutar diariamente: node scripts/test-eventos-automation.js`);
console.log(`   O invocar desde cronograma: /loop daily /eventos`);

console.log('\n' + '='.repeat(70));
console.log('✨ VENTAJAS DE ESTA AUTOMATIZACIÓN');
console.log('='.repeat(70));
console.log(`✅ Búsqueda web actualizada (Brave Search con freshness=pastmonth)`);
console.log(`✅ Extracción de contenido dinámico (Puppeteer renderiza JavaScript)`);
console.log(`✅ Deduplicación automática (url_info como clave única)`);
console.log(`✅ Geolocalización (lat/lon y location geography para mapas)`);
console.log(`✅ Idempotente (ejecutar N veces = mismo resultado final)`);
console.log(`✅ Escalable (agregar más deportes/ubicaciones sin cambios)`);
console.log(`✅ Integrado con Supabase (directo a base de datos)`);

console.log('\n' + '='.repeat(70));
console.log('📝 UBICACIÓN DE ARCHIVOS');
console.log('='.repeat(70));
console.log(`Skill: .claude/commands/eventos.md`);
console.log(`Test:  scripts/test-eventos-automation.js`);
console.log(`Tabla: Supabase tb_eventos (ya existe)`);
console.log(`Env:   .claude/settings.local.json (BRAVE_API_KEY, SUPABASE_*)`);

console.log('\n' + '='.repeat(70) + '\n');
