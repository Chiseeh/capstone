import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuariosAdmPage } from './usuariosadm.page';

const routes: Routes = [
  {
    path: '',
    component: UsuariosAdmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosadmPageRoutingModule {}
