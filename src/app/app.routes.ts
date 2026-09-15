import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees/components/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
  },
  { path: '',   redirectTo: 'employees', pathMatch: 'full' },
  { path: '**', redirectTo: 'employees' }
];
