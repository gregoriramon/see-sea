import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'tips',
    loadComponent: () => import('./pages/tips/tips.page').then( m => m.TipsPage)
  },
];
