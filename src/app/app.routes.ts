import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-page.component').then(
        (module) => module.DashboardPageComponent
      )
  },
  {
    path: 'records',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/records/pages/record-list-page.component').then(
        (module) => module.RecordListPageComponent
      )
  },
  {
    path: 'records/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/records/pages/record-detail-page.component').then(
        (module) => module.RecordDetailPageComponent
      )
  },
  {
    path: 'records/:id/history/:historyId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/records/pages/record-diff-page.component').then(
        (module) => module.RecordDiffPageComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
