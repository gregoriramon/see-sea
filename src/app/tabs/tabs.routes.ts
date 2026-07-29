import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'favoritas',
        data: { preload: true },
        loadComponent: () =>
          import('../pages/favoritas/favoritas.page').then((m) => m.FavoritasPage),
      },
      {
        path: 'buscar',
        loadComponent: () =>
          import('../pages/playa-list/playa-list.page').then((m) => m.PlayaListPage),
      },
      {
        path: 'eventos',
        data: { preload: true },
        loadComponent: () =>
          import('../pages/evento-list/evento-list.page').then((m) => m.EventoListPage),
      },
      {
        path: 'calendario',
        data: { preload: true },
        loadComponent: () =>
          import('../pages/calendario/calendario.page').then((m) => m.CalendarioPage),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('../pages/feedback/feedback.page').then((m) => m.FeedbackPage),
      },
      {
        path: 'playa/:slug',
        loadComponent: () =>
          import('../pages/playa-view/playa-view.page').then((m) => m.PlayaViewPage),
      },
      {
        path: 'travesia/:slug',
        loadComponent: () =>
          import('../pages/evento-view/evento-view.page').then((m) => m.EventoViewPage),
      },
      {
        path: 'evento/:id',
        loadComponent: () =>
          import('../pages/evento-view/evento-view.page').then((m) => m.EventoViewPage),
      },
      {
        path: '',
        redirectTo: '/tabs/calendario',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/calendario',
    pathMatch: 'full',
  },
];
