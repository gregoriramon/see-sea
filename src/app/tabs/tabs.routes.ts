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
          import('../pages/buscar/buscar.page').then((m) => m.BuscarPage),
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
