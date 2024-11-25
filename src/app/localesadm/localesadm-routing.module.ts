import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocalesAdmPage } from './localesadm.page';

const routes: Routes = [
  {
    path: '',
    component: LocalesAdmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocalesadmPageRoutingModule {}
