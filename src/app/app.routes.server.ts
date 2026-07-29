import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Estrategia de renderizado por ruta:
 *   - Server: SSR on-demand en cada request. Necesario cuando la página carga
 *     datos async que no completan a tiempo para prerender (Supabase).
 *   - Prerender: HTML estático generado en build. Reservado para rutas 100%
 *     estáticas o que no dependen de fetches externos.
 *   - Client: HTML mínimo (shell), hidratación en cliente. Útil cuando no
 *     aporta SEO.
 */
export const serverRoutes: ServerRoute[] = [
  // Detalles con contenido indexable → SSR
  { path: 'tabs/playa/:slug', renderMode: RenderMode.Server },
  { path: 'tabs/travesia/:slug', renderMode: RenderMode.Server },
  { path: 'tabs/evento/:id', renderMode: RenderMode.Server },

  // Tabs con datos dinámicos → SSR (evita timeout de prerender)
  { path: 'tabs/favoritas', renderMode: RenderMode.Server },
  { path: 'tabs/buscar', renderMode: RenderMode.Server },
  { path: 'tabs/eventos', renderMode: RenderMode.Server },
  { path: 'tabs/calendario', renderMode: RenderMode.Server },

  // Estáticas
  { path: '**', renderMode: RenderMode.Prerender },
];
