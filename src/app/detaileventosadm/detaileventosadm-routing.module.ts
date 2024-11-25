import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetaileventosadmPage } from './detaileventosadm.page';

const routes: Routes = [
  {
    path: '',
    component: DetaileventosadmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetaileventosadmPageRoutingModule {}
