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
  {
    path: 'employees/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees/components/create-employee/create-employee.component').then(
        m => m.CreateEmployeeComponent
      )
  },
  {
    // Must come before employees/:id so ":id/edit" is never swallowed by the detail route
    path: 'employees/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees/components/edit-employee/edit-employee.component').then(
        m => m.EditEmployeeComponent
      )
  },
  {
    path: 'employees/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./employees/components/employee-detail/employee-detail.component').then(
        m => m.EmployeeDetailComponent
      )
  },
  { path: '',   redirectTo: 'employees', pathMatch: 'full' },
  { path: '**', redirectTo: 'employees' }
];
