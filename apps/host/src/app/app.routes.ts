import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const appRoutes: Route[] = [
  {
    path:'',component:LoginComponent
  },
  {
    path:'dashboard',component:DashboardComponent
  },
  {
    path: 'reports',
    loadChildren: () => import('reports/Routes').then((m) => m.remoteRoutes),
  },
  {
    path: 'upload',
    loadChildren: () => import('upload/Routes').then((m) => m.remoteRoutes),
  },
  
];
