# 🎯 Automatización de Eventos Deportivos

Una skill de Claude Code que automatiza la búsqueda, extracción y persistencia de **eventos deportivos** usando:
- **Brave Search** para encontrar URLs relevantes
- **Puppeteer** para extraer detalles de eventos
- **Supabase** para guardar en `tb_eventos`

## Inicio Rápido

### Opción 1: Desde Claude Code (Recomendado)

Abre Claude Code en la carpeta del proyecto y ejecuta:

```bash
/eventos
```

Con parámetros opcionales:

```bash
/eventos deporte=surf ubicacion=Valencia
/eventos deporte=ciclismo ubicacion="Castilla y León" dias=60
```

**Parámetros disponibles:**
- `deporte` (default: "deportivos") — tipo de evento a buscar
- `ubicacion` (default: "Valencia") — región o ciudad
- `dias` (default: 30) — antigüedad máxima de resultados

### ⚠️ REQUISITO PREVIO: Crear tabla `tb_eventos_websites`

Antes de ejecutar `/eventos` por primera vez, crea la tabla de rastreo de URLs:

1. Abre Supabase Dashboard → SQL Editor
2. Copia y ejecuta el contenido de: `database/migrations/create-tb_eventos_websites.sql`
3. O ejecuta manualmente:

```sql
CREATE TABLE IF NOT EXISTS public.tb_eventos_websites (
  id BIGSERIAL PRIMARY KEY,
  url VARCHAR NOT NULL UNIQUE,
  deporte VARCHAR,
  ubicacion VARCHAR,
  estado VARCHAR DEFAULT 'pendiente',
  fecha_descubierta TIMESTAMPTZ DEFAULT NOW(),
  fecha_visitada TIMESTAMPTZ,
  eventos_encontrados INT DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tb_eventos_websites_deporte ON public.tb_eventos_websites(deporte);
CREATE INDEX IF NOT EXISTS idx_tb_eventos_websites_ubicacion ON public.tb_eventos_websites(ubicacion);
CREATE INDEX IF NOT EXISTS idx_tb_eventos_websites_estado ON public.tb_eventos_websites(estado);
```

Una vez hecho esto, la skill `/eventos` está lista para usar.

### Opción 2: Desde Terminal

```bash
# Con valores por defecto (deportivos en Valencia)
node scripts/test-eventos-automation.js

# Con parámetros personalizados
node scripts/test-eventos-automation.js surf Valencia
node scripts/test-eventos-automation.js ciclismo "Castilla y León" 60
```

### Opción 3: Automatizado (Cron Job)

Para ejecutar diariamente desde Claude Code:

```bash
/loop daily /eventos
```

## Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 0: Parsear parámetros (deporte, ubicacion, dias)          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ FASE 1: Búsqueda (Brave Search) → 20-50 URLs                   │
│ ├─ Query variaciones: "eventos", "competiciones", "clubs", etc │
│ ├─ Extrae 20-50 URLs relevantes                                │
│ └─ INSERT en tb_eventos_websites (estado: pendiente)           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ FASE 2: Extracción (Puppeteer)                                 │
│ ├─ Para cada URL: extract_page_content()                       │
│ ├─ Parsear: fecha, lugar, organizador, precio, coords, etc.   │
│ ├─ Validar: fecha >= hoy, url_info no vacía                   │
│ └─ UPDATE tb_eventos_websites (estado: visitada/error)        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ FASE 3: Persistencia (Supabase)                                │
│ ├─ Para cada evento: SELECT id FROM tb_eventos WHERE url_info  │
│ ├─ Si NO existe → INSERT en tb_eventos                         │
│ ├─ Si existe → UPDATE (upsert idempotente)                     │
│ └─ UPDATE tb_eventos_websites (eventos_encontrados = N)       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│ FASE 4: Resumen                                                │
│ ├─ URLs descubiertas: N, nuevas: X, ya existentes: Y          │
│ ├─ URLs visitadas: N, errores: E, no relevantes: R            │
│ ├─ Eventos nuevos: N, actualizados: U                         │
│ └─ Estado final en tb_eventos_websites                         │
└─────────────────────────────────────────────────────────────────┘
```

## Tablas Supabase

La skill `/eventos` utiliza **2 tablas**:

### 1. `tb_eventos` (Eventos Descubiertos)
Almacena los eventos deportivos encontrados y validados.

| Campo | Tipo | Propósito |
|-------|------|----------|
| `id` | int8 | PK auto-identity |
| `fecha_evento` | date | Cuándo es el evento |
| `descripcion` | varchar | Nombre + detalles |
| `lugar_evento` | varchar | Ubicación/recinto |
| `organizador` | varchar | Club/federación |
| `url_info` | varchar | **URL fuente (clave dedup)** |
| `url_inscripcion` | varchar | Link de registro |
| `precio` | int4 | Costo en euros |
| `distancia` | int8 | Metros (deportes resistencia) |
| `lat` / `lon` | numeric | Coordenadas GPS |
| `location` | geography | PostGIS para mapas |
| `created_at` | timestamptz | Cuándo se descubrió |

**Índices:** url_info, deporte, fecha_evento, ciudad

### 2. `tb_eventos_websites` (Rastreo de URLs)
Almacena todas las URLs descubiertas en la FASE 1, con estado de procesamiento.

| Campo | Tipo | Propósito |
|-------|------|----------|
| `id` | bigserial | PK |
| `url` | varchar | **URL (UNIQUE)** |
| `deporte` | varchar | Deporte buscado |
| `ubicacion` | varchar | Ubicación buscada |
| `estado` | varchar | pendiente / visitada / error / no_relevante |
| `fecha_descubierta` | timestamptz | Cuándo se encontró |
| `fecha_visitada` | timestamptz | Cuándo Puppeteer visitó |
| `eventos_encontrados` | int | Eventos extraídos de esta URL |
| `notas` | text | Error/detalles |

**Índices:** deporte, ubicacion, estado, fecha_descubierta

**Archivo de migración:** `database/migrations/create-tb_eventos_websites.sql`

## Detalles Técnicos

### Deduplicación

La automatización se basa en `url_info` (URL original) como clave:
1. **Primera ejecución:** Inserta nuevos eventos
2. **Siguientes ejecuciones:** Actualiza campos si la URL ya existe (COALESCE)
3. **Resultado:** Sin duplicados aunque ejecutes N veces

### Escapado SQL

Cuando genere consultas INSERT/UPDATE, la skill debe:
- Reemplazar `'` → `''` en campos de texto
- Escribir `NULL` (sin comillas) para valores nulos
- Usar `ST_MakePoint(lon, lat)::geography` para geolocalización
  - ⚠️ **Orden importante:** Longitud PRIMERO, latitud segundo

### Validación de Eventos

Se descartan eventos si:
- Fecha < hoy (eventos pasados)
- `url_info` está vacía (sin URL fuente)
- No tiene al menos uno de: `lugar_evento`, `descripcion`, `organizador`

## Variables de Entorno Requeridas

Verifica que `.claude/settings.local.json` tenga:

```json
{
  "env": {
    "BRAVE_API_KEY": "tu_clave_aqui",
    "SUPABASE_URL": "https://peojsedikxvmbirvlgmi.supabase.co",
    "SUPABASE_ANON_KEY": "tu_clave_publica_aqui"
  }
}
```

**No** comitees credenciales en `.claude/settings.json` — usa siempre `settings.local.json`.

## Estructura de Archivos

```
see-sea/
├── .claude/
│   ├── commands/
│   │   └── eventos.md          ← Skill principal
│   ├── settings.json           ← Config compartida (sin secrets)
│   └── settings.local.json     ← Credenciales (local, no comitear)
├── scripts/
│   └── test-eventos-automation.js  ← Demo/test
├── EVENTOS_AUTOMATION.md       ← Este archivo
└── ...
```

## Ejemplos de Uso

### Buscar campeonatos de natación

```bash
/eventos deporte="campeonatos natación" ubicacion="Comunidad Valenciana"
```

### Buscar maratones en todo España (últimos 60 días)

```bash
/eventos deporte=maratones ubicacion=España dias=60
```

### Buscar competiciones de triatlón en Valencia

```bash
/eventos deporte=triatlón ubicacion=Valencia
```

## Troubleshooting

### ❌ "La skill no se encuentra"

Si acabas de crear el archivo, reinicia Claude Code:
1. Cierra la sesión
2. Reabre la carpeta del proyecto
3. Intenta de nuevo `/eventos`

### ❌ "Error de autenticación Supabase"

Verifica que `.claude/settings.local.json` tenga credenciales válidas:
```bash
echo $SUPABASE_URL $SUPABASE_ANON_KEY
```

### ❌ "Puppeteer timeout"

Algunos sitios tardan mucho en cargar. La skill continuará con el siguiente evento.

### ❌ "Brave Search sin resultados"

Intenta ajustar:
- `deporte`: ser más específico (ej: "surf competición" en lugar de "deportes")
- `ubicacion`: usar provincia o región conocida

## Próximas Mejoras

- [x] ✅ Rastreo de URLs en tabla `tb_eventos_websites`
- [x] ✅ Ampliación de búsqueda a 20-50 URLs
- [ ] Dashboard de URLs pendientes/visitadas/errores
- [ ] Reintento automático de URLs con error
- [ ] Mapear automáticamente `cod_municipio`, `cod_provincia`, `cod_ccaa`
- [ ] Extraer imágenes de eventos y guardar URLs
- [ ] Notificar en app cuando hay nuevos eventos en favoritas
- [ ] Cron job automático (ejecutar `/eventos` diariamente)
- [ ] Análisis de fuentes más productivas (qué webs tienen más eventos)

## Referencias

- **Skill:** `.claude/commands/eventos.md`
- **Plan:** `.claude/plans/purring-finding-star.md`
- **Tabla Supabase:** `tb_eventos`
- **MCPs usados:**
  - `brave-search` — búsqueda web
  - `puppeteer` — extracción de contenido
  - `supabase` — persistencia

---

**Creado:** 2 de junio de 2026  
**Estado:** ✅ Implementado y listo para usar
