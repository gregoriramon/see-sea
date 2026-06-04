# Supabase MCP Server - Herramientas Disponibles

**Fecha:** 2 de junio de 2026  
**Proyecto:** see-sea  
**Servidor MCP:** @supabase/mcp-server

---

## Resumen

El servidor MCP de Supabase proporciona más de **20 herramientas** organizadas por categoría funcional. Todas las categorías están habilitadas por defecto excepto **Storage**.

---

## 📊 Base de Datos

Herramientas para gestionar esquemas y estructuras de base de datos.

| Herramienta | Descripción |
|---|---|
| `list_tables` | Listar todas las tablas de la base de datos |
| `list_extensions` | Listar extensiones de PostgreSQL instaladas |
| `list_migrations` | Listar migraciones disponibles |
| `apply_migration` | Aplicar una migración a la base de datos |
| `execute_sql` | Ejecutar consultas SQL personalizadas |

---

## 🐛 Debugging

Herramientas para diagnóstico y resolución de problemas.

| Herramienta | Descripción |
|---|---|
| `get_logs` | Obtener logs del proyecto |
| `get_advisors` | Obtener recomendaciones y análisis |

---

## 🛠️ Desarrollo

Herramientas para configuración y generación de código.

| Herramienta | Descripción |
|---|---|
| `get_project_url` | Obtener URL base del proyecto |
| `get_publishable_keys` | Obtener claves públicas del proyecto |
| `generate_typescript_types` | Generar tipos TypeScript basados en el esquema |

---

## ⚡ Edge Functions

Herramientas para gestionar funciones serverless en Edge.

| Herramienta | Descripción |
|---|---|
| `list_edge_functions` | Listar todas las Edge Functions |
| `get_edge_function` | Obtener detalles de una función específica |
| `deploy_edge_function` | Desplegar una nueva Edge Function |

---

## 👤 Gestión de Cuenta

Herramientas para administrar proyectos y organizaciones.

| Herramienta | Descripción |
|---|---|
| `list_projects` | Listar todos los proyectos |
| `get_project` | Obtener detalles de un proyecto específico |
| `create_project` | Crear un nuevo proyecto |
| `pause_project` | Pausar un proyecto |
| `restore_project` | Restaurar un proyecto pausado |
| `list_organizations` | Listar organizaciones |
| `get_organization` | Obtener detalles de una organización |
| `get_cost` | Obtener información de costos |
| `confirm_cost` | Confirmar costos |

---

## 📚 Documentación

Herramientas para acceder a recursos de documentación.

| Herramienta | Descripción |
|---|---|
| `search_docs` | Buscar en la documentación oficial de Supabase |

---

## 🌿 Branching (Experimental)

**Requiere:** Plan pagado  
Herramientas para trabajar con ramas de base de datos.

| Herramienta | Descripción |
|---|---|
| `create_branch` | Crear una rama de base de datos |
| `list_branches` | Listar todas las ramas |
| `delete_branch` | Eliminar una rama |
| `merge_branch` | Fusionar una rama |
| `reset_branch` | Resetear una rama a un estado anterior |
| `rebase_branch` | Hacer rebase de una rama |

---

## 💾 Storage (Deshabilitado por defecto)

Herramientas para gestionar almacenamiento de archivos.

| Herramienta | Descripción |
|---|---|
| `list_storage_buckets` | Listar todos los buckets de almacenamiento |
| `get_storage_config` | Obtener configuración de almacenamiento |
| `update_storage_config` | Actualizar configuración de almacenamiento |

---

## Configuración Actual

### Servidor MCP Configurado
- **Nombre:** supabase
- **Paquete:** @supabase/mcp-server
- **Variables de entorno necesarias:**
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### Estado
✅ Conectividad verificada (2026-06-02)  
✅ Variables de entorno configuradas  
✅ Servidor listo para usar

---

## Referencias

- [Documentación oficial de Supabase MCP](https://supabase.com/docs/guides/ai-tools/mcp)
- [Repositorio oficial en GitHub](https://github.com/supabase-community/supabase-mcp)

---

**Última actualización:** 2026-06-02
