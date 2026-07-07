import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tips',
    loadComponent: () => import('./pages/tips/tips.page').then( m => m.TipsPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
