import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NoticiasAdmPage } from './noticiasadm.page';

const routes: Routes = [
  {
    path: '',
    component: NoticiasAdmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoticiasadmPageRoutingModule {}
