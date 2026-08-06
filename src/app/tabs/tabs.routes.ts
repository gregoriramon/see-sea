import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { playaResolver } from '../pages/playa-view/playa.resolver';
import { eventoResolver } from '../pages/evento-view/evento.resolver';

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
        path: 'playa/:slug',
        loadComponent: () =>
          import('../pages/playa-view/playa-view.page').then((m) => m.PlayaViewPage),
        resolve: { playa: playaResolver },
      },
      {
        path: 'travesia/:slug',
        loadComponent: () =>
          import('../pages/evento-view/evento-view.page').then((m) => m.EventoViewPage),
        resolve: { evento: eventoResolver },
      },
      {
        path: 'evento/:id',
        loadComponent: () =>
          import('../pages/evento-view/evento-view.page').then((m) => m.EventoViewPage),
        resolve: { evento: eventoResolver },
      },
      {
        path: '',
        redirectTo: '/tabs/eventos',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/eventos',
    pathMatch: 'full',
  },
];
