---
description: Recabar eventos deportivos con Brave Search + Puppeteer y guardarlos en Supabase
---

# Automatización: Búsqueda y Persistencia de Eventos Deportivos

Este comando orquesta un flujo completo de:
1. **Búsqueda** de eventos con Brave Search (20-50 URLs)
2. **Extracción** de detalles con Puppeteer
3. **Persistencia** en Supabase tabla `tb_eventos`
4. **Rastreo de URLs** en tabla `tb_eventos_websites`

## Tablas Supabase Usadas

### 1. `tb_eventos` (Eventos Encontrados)
Almacena los eventos deportivos descubiertos.

| Campo | Tipo | Propósito |
|-------|------|----------|
| `id` | int8 | Identificador único |
| `fecha_evento` | date | Cuándo es el evento |
| `descripcion` | varchar | Nombre + descripción del evento |
| `lugar_evento` | varchar | Ubicación/recinto donde ocurre |
| `organizador` | varchar | Club/federación/entidad |
| `url_info` | varchar | **URL fuente (clave dedup)** |
| `url_inscripcion` | varchar | Dónde inscribirse |
| `precio` | int4 | Costo en euros |
| `distancia` | int8 | Metros (si aplica) |
| `lat` / `lon` | numeric | Coordenadas GPS |
| `location` | geography | PostGIS para mapas |
| `created_at` | timestamptz | Cuándo se descubrió |

### 2. `tb_eventos_websites` (Rastreo de URLs)
Almacena las URLs visitadas/descubiertas en la FASE 1.

| Campo | Tipo | Propósito |
|-------|------|----------|
| `id` | bigserial | Identificador único |
| `url` | varchar | **URL (UNIQUE)** |
| `deporte` | varchar | Tipo de deporte buscado |
| `ubicacion` | varchar | Ubicación buscada |
| `estado` | varchar | pendiente / visitada / error / no_relevante |
| `fecha_descubierta` | timestamptz | Cuándo se encontró la URL |
| `fecha_visitada` | timestamptz | Cuándo se visitó con Puppeteer |
| `eventos_encontrados` | int | Cuántos eventos se extrajeron de esta URL |
| `notas` | text | Detalles del estado (errores, etc.) |
| `created_at` / `updated_at` | timestamptz | Tracking |

**IMPORTANTE:** Si aún no existe `tb_eventos_websites`, crea la tabla ejecutando en Supabase SQL Editor:

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

CREATE INDEX idx_tb_eventos_websites_deporte ON public.tb_eventos_websites(deporte);
CREATE INDEX idx_tb_eventos_websites_ubicacion ON public.tb_eventos_websites(ubicacion);
CREATE INDEX idx_tb_eventos_websites_estado ON public.tb_eventos_websites(estado);
```

## Parámetros (opcionales)

Puedes invocar de estas formas:

```
/eventos
/eventos deporte=surf ubicacion=Valencia
/eventos deporte=ciclismo ubicacion="Castilla y León" dias=60
```

**Parámetros disponibles:**
- `deporte` (default: "deportivos") — tipo de deporte/evento a buscar
- `ubicacion` (default: "Valencia") — región o ciudad
- `dias` (default: 30) — rango de antigüedad de resultados a incluir

---

## FASE 0: Parsear parámetros de entrada

Lee los argumentos pasados al comando y asigna valores por defecto:

```
deporte = "deportivos" (si no se pasa)
ubicacion = "Valencia" (si no se pasa)
dias = 30 (si no se pasa)
```

---

## FASE 1: Búsqueda con Brave Search

**Objetivo:** Encontrar **al menos 20 URLs relevantes** (hasta un máximo de 50) de eventos.

Usa la herramienta **`brave_web_search`** con estos parámetros:

```json
{
  "query": "{deporte} eventos {ubicacion} 2026",
  "country": "es",
  "language": "es",
  "freshness": "pastmonth",
  "safe_search": true
}
```

**Acciones:**
1. Ejecuta búsquedas múltiples con variaciones:
   - Búsqueda 1: `"{deporte} eventos {ubicacion} 2026"`
   - Búsqueda 2: `"{deporte} competiciones {ubicacion}"`
   - Búsqueda 3: `"federación {deporte} {ubicacion}"`
   - Búsqueda 4: `"clubs {deporte} {ubicacion}"`
   - Búsqueda 5: `"eventbrite {deporte} {ubicacion}"`
   
2. Filtra solo URLs que parezcan relevantes (excluye redes sociales generales, publicidad, etc.)
3. Extrae **mínimo 20 URLs** (máximo 50 URLs) de las páginas más prometedoras
4. Para CADA URL encontrada:
   - INSERT en tabla `tb_eventos_websites` con:
     - `url` (obligatorio, UNIQUE)
     - `deporte` (valor pasado)
     - `ubicacion` (valor pasado)
     - `estado` = "pendiente" (será "visitada" después de FASE 2)
     - `fecha_descubierta` = NOW()
   - Si URL ya existe en tb_eventos_websites, actualiza `fecha_descubierta` pero no duplica

5. Guarda la lista de URLs en memoria para la FASE 2

**Ejemplo esperado:**
- Sitios de gestión de inscripciones deportivas
- URLs de federaciones deportivas
- Sitios de eventos locales (eventbrite, swimme, deportistaenruta, calendarios de eventos)
- Páginas de clubes deportivos
- Blogs de deportes con calendarios
- Portales municipales de eventos deportivos
- Asociaciones y federaciones autonómicas

**Inserción en `tb_eventos_websites`:**

Para cada URL encontrada:

```sql
INSERT INTO tb_eventos_websites (url, deporte, ubicacion, estado)
VALUES ('{url}', '{deporte}', '{ubicacion}', 'pendiente')
ON CONFLICT (url) DO UPDATE 
SET fecha_descubierta = NOW(), estado = 'pendiente'
WHERE url = '{url}';
```

---

## FASE 2: Extracción de Detalles con Puppeteer

**Objetivo:** Visitar cada URL y extraer información estructurada de los eventos.

Para **cada URL** de la lista anterior:

### Paso 1: Extraer contenido

Usa la herramienta **`extract_page_content`** con:

```json
{
  "url": "https://ejemplo.com/evento"
}
```

Esto devuelve `title`, `text`, `html` y `metadata`.

### Paso 2: Parsear el contenido extraído

Del texto y HTML extraído, intenta identificar y extraer:

```
fecha_evento         → Busca patrones de fecha (ej: "25 de junio", "25/06/2026")
                       Convierte a formato ISO DATE (2026-06-25)
                       Si no encuentras, deja NULL

descripcion         → El título de la página + primer párrafo (max 500 caracteres)

lugar_evento        → Nombre del recinto/ciudad donde ocurre (ej: "Playa de la Malvarrosa")
                       Busca en: "en Valencia", "en Benidorm", "en..." o dentro de la ubicación

organizador         → Club, federación o entidad que organiza
                       Busca: "organizado por", "federación de", "club de"

precio              → Número entero de euros
                       Busca: "€", "euros", "precio", "inscripción"
                       Si dice "gratuito" → 0
                       Si no aparece → NULL

distancia           → Solo aplica a carreras/ciclismo/deportes de resistencia
                       Busca: "5km", "10km", "semi-maratón" (26km), "maratón" (42km)
                       Convierte a metros (int)
                       Si no es relevante → NULL

url_inscripcion     → URL para inscribirse/comprar entradas
                       Busca: "inscribirse", "registrarse", "entradas", "comprar"
                       Toma href del primer link relevante

lat / lon           → Coordenadas (si aparecen en la página)
                       Formato: número decimal (ej: 39.4669, -0.3793 para Valencia)
                       Si no hay coords explícitas → NULL

url_info            → La URL que visitamos (importante para deduplicación)
```

### Paso 3: Validación básica

Antes de pasar al FASE 3, valida que:
- `fecha_evento` sea válida (si existe, debe ser >= hoy)
- `url_info` no esté vacía (es obligatoria para deduplicación)
- Al menos uno de: `lugar_evento`, `descripcion`, `organizador` debe tener contenido

Si falla la validación, descarta el evento y continúa con el siguiente.

### Paso 4: Acumular eventos

Crea una lista en memoria con todos los eventos válidos extraídos. Cada evento es un objeto con las claves anteriores.

### Paso 5: Actualizar estado en `tb_eventos_websites`

Después de procesar cada URL, actualiza su estado:

```sql
UPDATE tb_eventos_websites
SET 
  estado = 'visitada',
  fecha_visitada = NOW(),
  eventos_encontrados = N,
  notas = 'Extracción completada'
WHERE url = '{url_visitada}';
```

Si hay error al acceder a la URL:

```sql
UPDATE tb_eventos_websites
SET 
  estado = 'error',
  fecha_visitada = NOW(),
  notas = 'Error: timeout/acceso denegado/etc'
WHERE url = '{url_con_error}';
```

Si la URL no contiene eventos relevantes:

```sql
UPDATE tb_eventos_websites
SET 
  estado = 'no_relevante',
  fecha_visitada = NOW(),
  notas = 'Sin eventos relevantes encontrados'
WHERE url = '{url}';
```

---

## FASE 3: Persistencia en Supabase

**Objetivo:** Guardar los eventos en `tb_eventos` sin duplicados.

Para **cada evento** de la lista acumulada:

### Paso 1: Verificar duplicado

Usa **`execute_sql`** con esta consulta:

```sql
SELECT id FROM tb_eventos 
WHERE url_info = '{url_info}' 
LIMIT 1;
```

(Reemplaza `{url_info}` con la URL del evento actual, escapando comillas si las hay.)

### Paso 2a: Si NO existe (nuevo)

Usa **`execute_sql`** con este INSERT:

```sql
INSERT INTO tb_eventos (
  fecha_evento,
  descripcion,
  lugar_evento,
  organizador,
  url_info,
  url_inscripcion,
  precio,
  distancia,
  lat,
  lon,
  location
) VALUES (
  '{fecha_evento}'::date,
  '{descripcion}',
  '{lugar_evento}',
  '{organizador}',
  '{url_info}',
  '{url_inscripcion}',
  {precio},
  {distancia},
  {lat},
  {lon},
  {ST_POINT}
);
```

**Reglas de escape:**
- Reemplaza `'` → `''` (duplica comillas simples en cadenas)
- Si el campo es NULL en el objeto, escribe `NULL` (sin comillas)
- Para `location`: si lat y lon existen, usa `ST_MakePoint({lon}, {lat})::geography`, en caso contrario `NULL`

### Paso 2b: Si EXISTE (actualizar)

Usa **`execute_sql`** con este UPDATE:

```sql
UPDATE tb_eventos 
SET 
  fecha_evento = COALESCE('{fecha_evento}'::date, fecha_evento),
  descripcion = COALESCE('{descripcion}', descripcion),
  lugar_evento = COALESCE('{lugar_evento}', lugar_evento),
  organizador = COALESCE('{organizador}', organizador),
  url_inscripcion = COALESCE('{url_inscripcion}', url_inscripcion),
  precio = COALESCE({precio}, precio),
  distancia = COALESCE({distancia}, distancia),
  lat = COALESCE({lat}, lat),
  lon = COALESCE({lon}, lon),
  location = CASE 
    WHEN {lat} IS NOT NULL AND {lon} IS NOT NULL 
    THEN ST_MakePoint({lon}, {lat})::geography 
    ELSE location 
  END
WHERE url_info = '{url_info}';
```

### Paso 3: Registrar resultado

Para cada evento:
- Si INSERT exitoso → anota como "✅ NUEVO"
- Si UPDATE exitoso → anota como "🔄 ACTUALIZADO"
- Si error SQL → anota como "❌ ERROR: {mensaje}"

---

## FASE 4: Resumen y Reporte

Una vez procesados todos los eventos, muestra al usuario:

```
📊 RESUMEN DE AUTOMATIZACIÓN

🔍 Fase 1 (Búsqueda con Brave Search)
   - Consulta: "{deporte} eventos {ubicacion}"
   - URLs encontradas: N (al menos 20, hasta 50)
   - URLs nuevas en tb_eventos_websites: X
   - URLs ya existentes: Y

📄 Fase 2 (Extracción con Puppeteer)
   - URLs procesadas: N
   - URLs visitadas exitosamente: N
   - URLs con error: N
   - URLs no relevantes: N
   - Eventos extraídos: N
   - Eventos validados: N

💾 Fase 3 (Persistencia)
   - Nuevos eventos insertados: N
   - Eventos actualizados: N
   - Errores de inserción: N

📋 Rastreo de URLs
   - Estado "visitada": X
   - Estado "error": Y
   - Estado "no_relevante": Z
   - Estado "pendiente": P (para próximas búsquedas)

⏱️ Tiempo total: X segundos
```

Además, lista cada evento guardado con formato:
```
✅ Carreras Populares Valencia 2026
   Fecha: 2026-06-15
   Lugar: Turia, Valencia
   Organizador: Federación de Atletismo
   Precio: 15€
   URL fuente: https://...
   URL inscripción: https://...
```

Y un resumen de URLs procesadas:
```
📚 URLs Procesadas (Fase 1-2)
   ✅ Visitadas (N): [lista de URLs]
   ⚠️ Error (N): [lista de URLs con error]
   ❌ No relevante (N): [lista de URLs]
   ⏳ Pendiente próxima búsqueda (N): [lista de URLs]
```

---

## Notas Importantes

1. **Deduplicación:** Se basa en `url_info` — si ejecutas el comando dos veces con la misma búsqueda, los eventos existentes se actualizan pero no se crean duplicados.

2. **Errores de extracción:** Si Puppeteer no puede acceder a una URL (timeout, acceso denegado), salta a la siguiente sin parar el flujo.

3. **Formato de fechas:** Asegúrate de que las fechas extraídas se conviertan a formato ISO (YYYY-MM-DD) antes de enviar a SQL.

4. **Escape de SQL:** Ten cuidado con las comillas y caracteres especiales en campos de texto. Si una descripción tiene `'`, conviértela a `''`.

5. **Coordenadas:** Usa siempre el orden `ST_MakePoint(lon, lat)` — **longitud primero**, luego latitud.

---

## Ejemplo de Ejecución

**Usuario ejecuta:**
```
/eventos deporte=surf ubicacion=Valencia
```

**Esperado:**
1. ✅ Busca "surf eventos Valencia 2026"
2. ✅ Extrae 5-8 URLs (blogs de surf, federación, clubs locales)
3. ✅ Visita cada URL con Puppeteer
4. ✅ Parsea eventos (campeonatos, competiciones, clases)
5. ✅ Guarda en tb_eventos (nuevos e inserta, antiguos actualiza)
6. ✅ Muestra resumen: "3 nuevos eventos, 2 actualizados, 0 errores"
