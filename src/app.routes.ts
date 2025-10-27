import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Dashboard },
      { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      { path: 'documentation', component: Documentation },
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },

      // Tus rutas personalizadas
      {
        path: 'cargo',
        loadComponent: () => import('./app/pages/cargo/cargo.component').then(m => m.CargoComponent)
      },
      {
        path: 'empleado',
        loadComponent: () => import('./app/pages/empleado/empleado.component').then(m => m.EmpleadoComponent)
      },
      {
        path: 'proyecto',
        loadComponent: () => import('./app/pages/proyecto/proyecto.component').then(m => m.ProyectoComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./app/pages/proveedores/proveedor.component').then(m => m.ProveedorComponent)
      },
    ]
  },
  { path: 'landing', component: Landing },
  { path: 'notfound', component: Notfound },
  { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
  { path: '**', redirectTo: '/notfound' }
];
