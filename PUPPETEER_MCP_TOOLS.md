# Servidor MCP Puppeteer - Documentación

## Descripción General

El servidor MCP Puppeteer proporciona herramientas para extraer información de páginas web de forma automatizada. Utiliza Puppeteer, un navegador headless basado en Chromium, para renderizar completamente las páginas antes de extraer datos. Esto permite acceder a contenido dinámico generado por JavaScript.

**Configuración:** `.mcp.json`
```json
{
  "puppeteer": {
    "command": "node",
    "args": ["mcp-servers/puppeteer-server.js"]
  }
}
```

---

## Herramientas Disponibles

### 1. `extract_page_content`

Extrae el contenido completo de una página web, incluyendo HTML, texto plano, título y metadatos.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `url` | string | ✅ Sí | La URL de la página a extraer |

#### Respuesta (Exitosa)

```json
{
  "success": true,
  "data": {
    "title": "Título de la página",
    "url": "https://ejemplo.com/pagina",
    "html": "<html>... contenido HTML completo ...</html>",
    "text": "Texto plano de la página",
    "metadata": {
      "description": "Descripción de la página",
      "keywords": "palabra1, palabra2",
      "author": "Autor de la página"
    }
  }
}
```

#### Casos de Uso

- Extraer contenido de blogs y artículos
- Obtener información de páginas de productos
- Recopilar datos de sitios web con contenido dinámico
- Análisis de contenido de competidores
- Archivado de páginas web

#### Ejemplo de Uso

```
Extrae el contenido completo de https://www.ejemplo.com/articulo
```

**Respuesta esperada:** Objeto con título, HTML completo, texto limpio y metadatos del artículo.

---

### 2. `extract_table_data`

Extrae datos de tablas HTML de una página web y los convierte en estructuras de datos fáciles de procesar.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `url` | string | ✅ Sí | La URL de la página que contiene las tablas |
| `tableSelector` | string | ❌ No | Selector CSS para identificar tablas específicas (default: `"table"`) |

#### Respuesta (Exitosa)

```json
{
  "success": true,
  "data": [
    [
      ["Encabezado 1", "Encabezado 2", "Encabezado 3"],
      ["Fila 1 - Columna 1", "Fila 1 - Columna 2", "Fila 1 - Columna 3"],
      ["Fila 2 - Columna 1", "Fila 2 - Columna 2", "Fila 2 - Columna 3"]
    ]
  ]
}
```

#### Selectores Comunes

```
"table"                    # Todas las tablas
"table.data-table"         # Tablas con clase específica
"div.container > table"    # Tablas dentro de divs
".results-table tbody tr"   # Filas específicas de una tabla
```

#### Casos de Uso

- Extraer datos de tablas de precios
- Recopilar información de rankings o listas
- Obtener datos financieros de tablas HTML
- Convertir tablas web a formatos estructurados
- Web scraping de datos tabulares

#### Ejemplo de Uso

```
Extrae todas las tablas de https://ejemplo.com/precios
```

**Respuesta esperada:** Array de tablas, donde cada tabla es un array de filas, y cada fila es un array de celdas.

---

### 3. `take_screenshot`

Toma una captura de pantalla de una página web en formato PNG codificado en base64.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `url` | string | ✅ Sí | La URL de la página a capturar |
| `fullPage` | boolean | ❌ No | Si capturar la página completa o solo el viewport (default: `false`) |

#### Respuesta (Exitosa)

```json
{
  "success": true,
  "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "encoding": "base64"
}
```

#### Opciones

- **`fullPage: false`** (default) - Captura solo el área visible del navegador (viewport)
- **`fullPage: true`** - Captura la página completa, desplazándose hacia abajo si es necesario

#### Casos de Uso

- Validar cambios visuales en un sitio web
- Capturar errores o cambios inesperados
- Documentar el estado de una página en un momento específico
- Monitoring de cambios en diseño web
- Testing visual automatizado

#### Ejemplo de Uso

```
Toma una captura de pantalla de la página completa de https://ejemplo.com
```

**Respuesta esperada:** Imagen PNG en formato base64 que puede ser visualizada o guardada.

---

## Respuestas de Error

Todas las herramientas retornan la siguiente estructura en caso de error:

```json
{
  "success": false,
  "error": "Descripción del error"
}
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `ERR_NAME_NOT_RESOLVED` | URL inválida o dominio no existe | Verifica la URL y que sea accesible |
| `net::ERR_CONNECTION_TIMED_OUT` | Servidor no responde dentro del tiempo límite | Intenta con otra URL o revisa tu conexión |
| `Timeout (30 segundos)` | La página tardó demasiado en cargar | Intenta con una URL más rápida |

---

## Casos de Uso Avanzados

### 1. Monitoreo de Cambios en Precios
```
1. Usa extract_table_data para obtener tabla de precios
2. Guarda los datos en una base de datos
3. Compara con datos anteriores para detectar cambios
```

### 2. Análisis de Contenido Competidor
```
1. extract_page_content de sitio competidor
2. Procesa el texto para análisis de keywords
3. Identifica cambios en posicionamiento de contenido
```

### 3. Validación Visual de Sitios
```
1. take_screenshot de la página
2. Compara con screenshot anterior
3. Detecta cambios no intencionales
```

### 4. Extracción de Datos Dinámicos
```
1. extract_page_content en sitios con JavaScript
2. Obtiene datos que solo se generan en el cliente
3. Convierte en formato estructurado
```

---

## Limitaciones y Consideraciones

### Limitaciones Técnicas

1. **Tiempo de Timeout:** 30 segundos máximo por petición
2. **Memoria:** Cada navegador consume ~100-150 MB
3. **Recursos:** Puppeteer es intensive en CPU
4. **Sandbox:** Corre con `--no-sandbox` en algunos entornos

### Consideraciones Legales y Éticas

- ⚠️ **Respeta robots.txt** - Verifica que el scraping sea permitido
- ⚠️ **Términos de Servicio** - Algunos sitios prohíben web scraping
- ⚠️ **Rate Limiting** - No hagas múltiples peticiones simultáneas al mismo servidor
- ⚠️ **User-Agent** - Puppeteer se identifica claramente como navegador

### Problemas Conocidos

1. **Sitios con Protección DDoS** - Cloudflare puede bloquear
2. **Páginas con Login Requerido** - No puede autenticarse automáticamente
3. **Contenido en Iframes** - Solo extrae iframes si están en el mismo dominio
4. **JavaScript Pesado** - Puede fallar si la página tiene errores JavaScript

---

## Ejemplos Prácticos

### Ejemplo 1: Extraer Artículo Completo
```
Herramienta: extract_page_content
URL: https://blog.ejemplo.com/mi-articulo
Resultado: Obtengo el título, contenido y metadatos del artículo
```

### Ejemplo 2: Comparar Precios
```
Herramienta: extract_table_data
URL: https://tienda.ejemplo.com/precios
Selector: ".precios-tabla"
Resultado: Array de precios por producto que puedo procesar programáticamente
```

### Ejemplo 3: Monitoreo Visual
```
Herramienta: take_screenshot
URL: https://ejemplo.com
fullPage: true
Resultado: Imagen de toda la página para comparar cambios visuales
```

---

## Integración con Otras Herramientas MCP

### Con Supabase
```
1. extract_page_content para obtener datos
2. Procesa y estructura los datos
3. Guarda en Supabase usando el servidor MCP de Supabase
```

### Con Brave Search
```
1. Usa Brave Search para encontrar URLs relevantes
2. Usa Puppeteer para extraer contenido detallado de esas URLs
3. Combina resultados para análisis más profundo
```

---

## Configuración Avanzada

### Aumentar Timeout
Modificar en `mcp-servers/puppeteer-server.js`:
```javascript
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // 60 segundos
```

### Añadir Headers Personalizados
```javascript
await page.setExtraHTTPHeaders({
  'User-Agent': 'Tu-App/1.0'
});
```

### Desactivar Imágenes (Más Rápido)
```javascript
await page.setRequestInterception(true);
page.on('request', (request) => {
  if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
    request.abort();
  } else {
    request.continue();
  }
});
```

---

## Troubleshooting

### ¿El servidor no inicia?
1. Verifica que Puppeteer esté instalado: `npm list puppeteer`
2. Revisa los permisos del archivo: `chmod +x mcp-servers/puppeteer-server.js`
3. Prueba manualmente: `node mcp-servers/puppeteer-server.js`

### ¿Las extracciones están vacías?
1. Algunos sitios requieren JavaScript - normal con Puppeteer
2. Verifica que la página se cargue correctamente con `take_screenshot`
3. Aumenta el timeout si la página es lenta

### ¿El servidor se congela?
1. Una petición está tardando demasiado (timeout de 30s)
2. El servidor consume mucha memoria
3. Cierra páginas no utilizadas regularmente

---

## Resumen de Herramientas

| Herramienta | Propósito | Parámetros Clave | Salida |
|-------------|-----------|-----------------|--------|
| `extract_page_content` | Obtener HTML, texto y metadatos | `url` | Objeto con contenido |
| `extract_table_data` | Extraer tablas HTML | `url`, `tableSelector` | Array de tablas |
| `take_screenshot` | Capturar pantalla | `url`, `fullPage` | PNG en base64 |

---

**Última actualización:** 2 de junio de 2026

