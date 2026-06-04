# Documentación de Herramientas - Brave Search MCP Server

## Descripción General

El servidor MCP de Brave Search proporciona **8 herramientas especializadas** que ofrecen acceso a la API de Brave Search a través del protocolo Model Context Protocol (MCP). Estas herramientas permiten a agentes de IA y LLMs realizar búsquedas avanzadas y obtener información de múltiples tipos de contenido.

**Configuración del Servidor:**
- Nombre: `brave-search`
- Comando: `npx -y @modelcontextprotocol/server-brave-search`
- Variable de entorno requerida: `BRAVE_API_KEY`
- Repositorio: [brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server)

---

## Herramientas Disponibles

### 1. **brave_web_search**

**Descripción:** Realiza búsquedas web exhaustivas con múltiples tipos de resultados ricos y opciones avanzadas de filtrado.

**Parámetros:**
- `query` (string, requerido): Término o frase de búsqueda
- `country` (string, opcional): Código de país para filtrar resultados (ej: "es" para España)
- `language` (string, opcional): Código de idioma para los resultados (ej: "es" para español)
- `freshness` (string, opcional): Filtro de antigüedad ("pasthour", "pastday", "pastweek", "pastmonth", "pastyear")
- `safe_search` (boolean, opcional): Habilitar filtrado de contenido seguro
- `spellcheck` (boolean, opcional): Corregir errores ortográficos en la consulta
- `summarize` (object, opcional): Opciones para generar resúmenes de IA

**Tipo de Resultado:**
- Resultados web generales
- FAQs
- Discusiones
- Contenido de video
- Summary keys para usar con el resumidor

**Ejemplo de Uso:**
```
Buscar "mejores playas de España" con idioma español y resultados de los últimos 7 días
```

---

### 2. **brave_local_search**

**Descripción:** Busca negocios locales y lugares de interés (POIs) con calificaciones, horarios y descripciones de IA.

**Parámetros:**
- `query` (string, requerido): Término de búsqueda local (ej: "restaurantes italianos")
- `country` (string, requerido): Código de país para localizar búsquedas
- `language` (string, opcional): Código de idioma
- `location` (string, opcional): Ubicación específica (ciudad, dirección)
- `latitude` (number, opcional): Latitud para búsquedas basadas en coordenadas
- `longitude` (number, opcional): Longitud para búsquedas basadas en coordenadas

**Tipo de Resultado:**
- Nombre del negocio
- Dirección completa
- Número de teléfono
- Horarios de apertura
- Calificaciones y reviews
- Descripción generada por IA
- Distancia desde ubicación

**Notas Importantes:**
- ⚠️ Requiere **plan Pro** de Brave Search
- Si no está disponible, por defecto retorna resultados de búsqueda web

**Ejemplo de Uso:**
```
Buscar "hoteles cerca de Valencia" con ubicación específica
```

---

### 3. **brave_image_search**

**Descripción:** Realiza búsquedas de imágenes basadas en términos de búsqueda, retornando URLs de imágenes con metadatos.

**Parámetros:**
- `query` (string, requerido): Término de búsqueda de imagen
- `language` (string, opcional): Código de idioma
- `count` (number, opcional): Número de resultados (máx. 200)
- `safe_search` (boolean, opcional): Filtrado de contenido seguro

**Tipo de Resultado:**
- URLs de imágenes
- Títulos e descripciones
- Tamaños y dimensiones
- Fuente/origen
- Thumbnails

**Ejemplo de Uso:**
```
Buscar imágenes de "paisajes de montaña" en español
```

---

### 4. **brave_video_search**

**Descripción:** Busca videos con metadatos y miniaturas, ideal para encontrar contenido multimedia.

**Parámetros:**
- `query` (string, requerido): Término de búsqueda de video
- `country` (string, opcional): Código de país
- `language` (string, opcional): Código de idioma
- `count` (number, opcional): Número de resultados
- `spellcheck` (boolean, opcional): Corrector ortográfico

**Tipo de Resultado:**
- Títulos de video
- URLs de video
- Descripciones
- Miniaturas
- Duración
- Fuente (YouTube, Vimeo, etc.)
- Metadatos de visualización

**Ejemplo de Uso:**
```
Buscar videos tutoriales sobre "programación en Python"
```

---

### 5. **brave_news_search**

**Descripción:** Busca artículos de noticias actuales con controles de frescura y indicadores de noticias de último momento.

**Parámetros:**
- `query` (string, requerido): Término de búsqueda de noticias
- `country` (string, opcional): Código de país para noticias locales
- `language` (string, opcional): Código de idioma
- `freshness` (string, opcional): Filtro de antigüedad ("pasthour", "pastday", "pastweek", "pastmonth")

**Tipo de Resultado:**
- Título del artículo
- URL del artículo
- Fuente de noticias
- Fecha de publicación
- Descripción/snippet
- Indicador de noticias de último momento

**Características Especiales:**
- Filtrado de frescura por defecto: **últimas 24 horas**
- Soporte para paginación
- Indicadores de breaking news

**Ejemplo de Uso:**
```
Buscar noticias sobre "criptomonedas" del último día en español
```

---

### 6. **brave_place_search**

**Descripción:** Busca puntos de interés (POIs) en un área geográfica específica con información detallada.

**Parámetros:**
- `query` (string, requerido): Tipo de lugar a buscar (ej: "museos", "parques")
- `latitude` (number, requerido): Latitud del punto central de búsqueda
- `longitude` (number, requerido): Longitud del punto central de búsqueda
- `radius` (number, opcional): Radio de búsqueda en metros

**Tipo de Resultado:**
- Nombre del lugar
- Dirección completa
- Coordenadas GPS
- Horarios de apertura
- Información de contacto
- Calificaciones y reviews
- Categoría del lugar
- Distancia desde punto de búsqueda

**Ejemplo de Uso:**
```
Buscar parques naturales cerca de Barcelona (coordenadas específicas)
```

---

### 7. **brave_summarizer**

**Descripción:** Genera resúmenes de IA a partir de resultados de búsqueda web, creando síntesis coherentes de información múltiple.

**Parámetros:**
- `summary_keys` (array de strings, requerido): Claves de resumen obtenidas de resultados de `brave_web_search`
- `language` (string, opcional): Código de idioma para el resumen
- `key_points` (boolean, opcional): Incluir puntos clave del resumen

**Tipo de Resultado:**
- Resumen coherente y procesado
- Puntos clave principales
- Enlaces a fuentes originales
- Información sintetizada

**Notas Importantes:**
- ⚠️ Requiere **plan Pro** de Brave Search
- Las `summary_keys` se obtienen de búsquedas web previas
- Ideal para síntesis de información compleja

**Flujo de Uso Típico:**
1. Ejecutar `brave_web_search` (obtiene `summary_keys`)
2. Pasar `summary_keys` a `brave_summarizer` (genera resumen)

**Ejemplo de Uso:**
```
Obtener resumen de "inteligencia artificial en medicina" basado en múltiples fuentes
```

---

### 8. **brave_llm_context**

**Descripción:** Recupera contenido web pre-extraído y optimizado para agentes de IA, fundamentación de LLMs y pipelines RAG.

**Parámetros:**
- `url` (string, requerido): URL a procesar
- `max_tokens` (number, opcional): Límite de tokens en el contenido extraído
- `max_snippet_size` (number, opcional): Tamaño máximo de fragmentos de contenido

**Tipo de Resultado:**
- Contenido web limpio y procesado
- Texto estructurado
- Metadatos de la página
- Enlaces internos y externos
- Información sobre la fuente

**Casos de Uso:**
- Preparar contenido para análisis de IA
- Fundamentación (grounding) de respuestas de LLM
- Pipelines de Recuperación Aumentada por Generación (RAG)
- Extracción de información estructurada

**Ejemplo de Uso:**
```
Extraer contenido de un artículo para análisis de sentimiento o extracción de datos
```

---

## Tabla Comparativa de Herramientas

| Herramienta | Propósito | Plan Requerido | Parámetro Clave | Mejor Para |
|---|---|---|---|---|
| `brave_web_search` | Búsqueda web general | Free | `query` | Búsquedas amplias |
| `brave_local_search` | Negocios y POIs | **Pro** | `location` | Búsquedas locales |
| `brave_image_search` | Imágenes | Free | `query` | Contenido visual |
| `brave_video_search` | Videos | Free | `query` | Contenido multimedia |
| `brave_news_search` | Noticias actuales | Free | `freshness` | Información reciente |
| `brave_place_search` | Puntos de interés | Free | `latitude`/`longitude` | Búsquedas geográficas |
| `brave_summarizer` | Resúmenes de IA | **Pro** | `summary_keys` | Síntesis de información |
| `brave_llm_context` | Contenido optimizado IA | Free | `url` | RAG y análisis IA |

---

## Parámetros Comunes

### Códigos de País
Usa códigos ISO 3166-1 alfa-2:
- `es` - España
- `us` - Estados Unidos
- `mx` - México
- `fr` - Francia
- `de` - Alemania
- `it` - Italia
- [Lista completa de códigos ISO](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)

### Códigos de Idioma
Usa códigos ISO 639-1:
- `es` - Español
- `en` - Inglés
- `fr` - Francés
- `de` - Alemán
- `it` - Italiano
- `pt` - Portugués
- `ja` - Japonés
- `zh` - Chino

### Valores de Freshness (Frescura)
- `pasthour` - Última hora
- `pastday` - Últimas 24 horas
- `pastweek` - Última semana
- `pastmonth` - Último mes
- `pastyear` - Último año

---

## Consideraciones de Uso

### Planes y Límites
- **Plan Free**: Acceso a 5 de 8 herramientas
- **Plan Pro**: Acceso completo a todas las herramientas (incluye `brave_local_search` y `brave_summarizer`)
- Consultar documentación de Brave Search API para límites de tasa

### Mejores Prácticas
1. **Combinación de herramientas**: Usar `brave_web_search` + `brave_summarizer` para información completa
2. **Búsquedas localizadas**: Usar `country` y `language` para resultados relevantes
3. **Filtrado temporal**: Usar `freshness` para noticias y contenido actualizado
4. **RAG pipelines**: Usar `brave_llm_context` para preparar contenido para IA

### Manejo de Errores
- Si `brave_local_search` no está disponible, retorna automáticamente resultados de web
- Validar que `summary_keys` sean válidas antes de usar `brave_summarizer`
- Usar `spellcheck: true` para consultas con posibles errores ortográficos

---

## Referencias

- **Repositorio Oficial**: [brave/brave-search-mcp-server](https://github.com/brave/brave-search-mcp-server)
- **Guía de Integración**: [Brave Search MCP with Claude Desktop](https://brave.com/search/api/guides/use-with-claude-desktop-with-mcp/)
- **Documentación en DeepWiki**: [brave/brave-search-mcp-server](https://deepwiki.com/brave/brave-search-mcp-server)
- **API Reference**: [Brave Search API Tools](https://brave.com/search/api/tools/)

---

**Última actualización:** 2 de junio de 2026  
**Versión del servidor:** @modelcontextprotocol/server-brave-search  
**Estado:** Funcional y probado ✅
