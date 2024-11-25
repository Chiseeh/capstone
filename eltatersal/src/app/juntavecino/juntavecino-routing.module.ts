import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JuntavecinoPage } from './juntavecino.page';

const routes: Routes = [
  {
    path: '',
    component: JuntavecinoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JuntavecinoPageRoutingModule {}
