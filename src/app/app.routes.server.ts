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
  // Detalles: RenderMode.Client (shell mínimo + hidratación).
  // Ionic + SSR se cuelga en isStable con componentes complejos; se resolverá
  // más adelante con SSG top-N o refactor Ionic-lite.
  { path: 'tabs/playa/:slug', renderMode: RenderMode.Client },
  { path: 'tabs/travesia/:slug', renderMode: RenderMode.Client },
  { path: 'tabs/evento/:id', renderMode: RenderMode.Client },

  // Tabs con datos dinámicos → SSR (title/meta correctos)
  { path: 'tabs/favoritas', renderMode: RenderMode.Server },
  { path: 'tabs/buscar', renderMode: RenderMode.Server },
  { path: 'tabs/eventos', renderMode: RenderMode.Server },
  { path: 'tabs/calendario', renderMode: RenderMode.Server },

  // Estáticas → prerender
  { path: '**', renderMode: RenderMode.Prerender },
];
