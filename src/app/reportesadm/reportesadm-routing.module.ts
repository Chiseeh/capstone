import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportesadmPage } from './reportesadm.page';

const routes: Routes = [
  {
    path: '',
    component: ReportesadmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesadmPageRoutingModule {}
