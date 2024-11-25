import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'inicio',
    loadChildren: () => import('./inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'quejasadm',
    loadChildren: () => import('./quejasadm/quejasadm.module').then( m => m.QuejasadmPageModule)
  },
  {
    path: 'noticiasadm',
    loadChildren: () => import('./noticiasadm/noticiasadm.module').then( m => m.NoticiasadmPageModule)
  },
  {
    path: 'reportesadm',
    loadChildren: () => import('./reportesadm/reportesadm.module').then( m => m.ReportesadmPageModule)
  },
  {
    path: 'eventosadm',
    loadChildren: () => import('./eventosadm/eventosadm.module').then( m => m.EventosadmPageModule)
  },
  {
    path: 'usuariosadm',
    loadChildren: () => import('./usuariosadm/usuariosadm.module').then( m => m.UsuariosadmPageModule)
  },
  {
    path: 'detaileventosadm/:id',
    loadChildren: () => import('./detaileventosadm/detaileventosadm.module').then( m => m.DetaileventosadmPageModule)
  },
  {
    path: 'crearevento',
    loadChildren: () => import('./crearevento/crearevento.module').then( m => m.CreareventoPageModule)
  },
  {
    path: 'documentosadmfire',
    loadChildren: () => import('./documentosadmfire/documentosadmfire.module').then( m => m.DocumentosadmfirePageModule)
  },
  {
    path: 'localesadm',
    loadChildren: () => import('./localesadm/localesadm.module').then( m => m.LocalesadmPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
