import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { noIngresadoGuard } from './no-ingresado.guard';
import { ingresadoGuard} from './ingresado.guard';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    canActivate: [noIngresadoGuard]
  },
  {
    path: 'registro',
    loadChildren: () => import('./registro/registro.module').then( m => m.RegistroPageModule),
    canActivate: [noIngresadoGuard]
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then( m => m.InicioPageModule),
    canActivate: [ingresadoGuard]
  },
  {
    path: 'quejas',
    loadChildren: () => import('./quejas/quejas.module').then( m => m.QuejasPageModule)
  },
  {
    path: 'reporte',
    loadChildren: () => import('./reporte/reporte.module').then( m => m.ReportePageModule)
  },
  {
    path: 'evento',
    loadChildren: () => import('./evento/evento.module').then( m => m.EventoPageModule)
  },
  {
    path: 'crear-evento',
    loadChildren: () => import('./crear-evento/crear-evento.module').then( m => m.CrearEventoPageModule)
  },
  {
    path: 'noticia',
    loadChildren: () => import('./noticia/noticia.module').then( m => m.NoticiaPageModule)
  },
  {
    path: 'crear-noticias',
    loadChildren: () => import('./crear-noticias/crear-noticias.module').then( m => m.CrearNoticiasPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
