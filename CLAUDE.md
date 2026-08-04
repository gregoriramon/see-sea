# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**see-sea** es una app Ionic + Angular para consultar el estado del mar y la previsión meteorológica de playas españolas (formato AEMET). Persiste favoritos y registro de dispositivos/acciones en Supabase, y se despliega como PWA en Cloudflare Pages.

**Stack**: Angular 20 (standalone) · Ionic 8 · Capacitor 8 · Supabase · Puppeteer (scraping en scripts Node) · SCSS · Karma/Jasmine · Angular ESLint.

## Common Commands

```bash
# Servir en local (por defecto usa environment.ts / development)
npm start                   # dev
npm run start:cons          # sirve con environment.cons.ts
npm run start:prod          # sirve con environment.prod.ts

# Builds (salida en www/)
npm run build:dev
npm run build:cons
npm run build:prod          # equivalente a `npm run build` (defaultConfiguration=production)

# Despliegue a Cloudflare Pages (requiere wrangler autenticado)
npm run deploy:cf:cons      # build:cons + wrangler pages deploy (proyecto sisi-cons)
npm run deploy:cf:prod      # build:prod + wrangler pages deploy (proyecto sisi-prod)

# Tests y lint
npm test                    # Karma en watch
npm test -- --watch=false   # single run (CI)
npm run lint                # ESLint sobre src/**/*.ts y src/**/*.html
```

## Environments & Deployment

El proyecto tiene **tres entornos** con file-replacement en `angular.json`:

| Configuración   | Env file                          | Cloudflare Pages |
|-----------------|-----------------------------------|------------------|
| `development`   | `environment.ts` (default)        | —                |
| `consolidation` | `environment.cons.ts`             | `sisi-cons`      |
| `production`    | `environment.prod.ts`             | `sisi-prod`      |

Cada entorno apunta a un proyecto Supabase distinto (ver commit `c872df5`). El service worker (`ngsw-config.json`) se incluye en builds `cons` y `prod`, no en `development`.

### Hosting en Cloudflare Pages

- **Build command** en el dashboard de Cloudflare: `npm run build:cons` / `npm run build:prod`.
- **Output dir**: `www`.
- **SPA routing**: `public/_redirects` (`/* /index.html 200`).
- **Cache**: `public/_headers` aplica `no-cache` sobre `/index.html` y `/ngsw.json`.
- **Env vars** (por proyecto en Cloudflare): las claves Supabase se inyectan vía `environment.cons.ts` / `environment.prod.ts` en build time, no runtime — configurar en Cloudflare como *build environment variables* si el build se hace en su CI.
- **Deploy manual** desde local: `npm run deploy:cf:cons` / `npm run deploy:cf:prod` (requiere `wrangler` CLI autenticado con `wrangler login`).
- **Fase 4 (SSR)**: `wrangler.toml` ya presente como base; se extenderá con el Worker SSR de Angular.

## Architecture

### Capas
- **`src/app/core/services/`** — servicios singleton:
  - `supabase/` — cliente Supabase y operaciones de BD (tablas `tb_favoritas`, `tb_eventos_websites`, registro de dispositivos/acciones).
  - `local-repository/` — identificación de dispositivo y estado local persistido.
  - `favoritas/` — CRUD de playas favoritas apoyado en Supabase + local.
  - `common-local/` — utilidades locales compartidas.
- **`src/app/shared/`** — componentes standalone reutilizables, pipes de formato meteorológico y utilidades de plantilla.
- **`src/app/pages/`** — páginas de feature (playa-list, favoritas, calendario, tips) cargadas de forma lazy desde `app.routes.ts`.
- **`src/app/tabs/`** — estructura de navegación por pestañas inferiores (`tabs.routes.ts`).
- **`src/app/models/`** — interfaces de dominio: `Playa`, `Dispositivo`, `Prediccion`/`Dia`, etc.

### Flujo de datos meteorológicos
La predicción sigue el **formato AEMET**: valores codificados (p. ej. cielo `100`=despejado, `110`=nuboso) más `descripcion1`/`descripcion2`, y una lista de `Dia` con temperatura, viento, oleaje, sensación térmica, temperatura del agua y UV. Los **pipes de `shared/pipes/`** (`temperatura-pipe`, `viento-pipe`, `oleaje-pipe`, `sensacion-termica-pipe`, `uv-max-pipe`, `dia-semana-pipe`) traducen esos códigos a texto legible — cualquier cambio en el modelo de predicción debe reflejarse en los pipes correspondientes.

### Registro de dispositivos
`AppComponent.ngOnInit` registra el dispositivo al arrancar y `registraDispositivo()` en `SupabaseService` traza acciones del usuario. Añadir nuevas acciones significa llamar a ese servicio, no crear tablas nuevas.

### Componentes standalone
Todo el proyecto usa Angular standalone (Angular 20). Los schematics ya están configurados para ello (`angular.json` → `@ionic/angular-toolkit:page` con `standalone: true`). No hay `NgModule` de feature.

## Puppeteer / scraping

El proyecto incluye scripts Node con Puppeteer para poblar `tb_eventos_websites` en Supabase (catálogo de webs de eventos deportivos). No es código de la app cliente — se ejecuta de forma independiente. Los skills relacionados (si están instalados en `.claude/`) automatizan búsqueda y scraping; verificar su presencia antes de usarlos, ya que `.claude/commands/eventos.md` puede estar fuera del working tree.

## Build & bundle notes

- Salida: `www/` (mismo path en dev/cons/prod; se sobrescribe entre builds).
- Presupuestos de bundle inicial: 2 MB warning / 5 MB error (`angular.json`).
- `outputHashing: all` en `cons` y `prod`; `index.html` y `ngsw.json` sirven con `Cache-Control: no-cache` para evitar servir un HTML viejo que referencie chunks nuevos.
