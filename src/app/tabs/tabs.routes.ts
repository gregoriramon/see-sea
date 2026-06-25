import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'favoritas',
        loadComponent: () =>
          import('../pages/favoritas/favoritas.page').then((m) => m.FavoritasPage),
      },
      {
        path: 'buscar',
        loadComponent: () =>
          import('../pages/playa-list/playa-list.page').then((m) => m.PlayaListPage),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('../pages/calendario/calendario.page').then((m) => m.CalendarioPage),
      },
      {
        path: 'tips',
        loadComponent: () =>
          import('../pages/tips/tips.page').then((m) => m.TipsPage),
      },
      {
        path: 'playa/:codPlaya',
        loadComponent: () =>
          import('../pages/playa-view/playa-view.page').then((m) => m.PlayaViewPage),
      },
      {
        path: '',
        redirectTo: '/tabs/favoritas',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/favoritas',
    pathMatch: 'full',
  },
];
