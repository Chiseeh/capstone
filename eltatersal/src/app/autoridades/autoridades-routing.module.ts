import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AutoridadesPage } from './autoridades.page';

const routes: Routes = [
  {
    path: '',
    component: AutoridadesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutoridadesPageRoutingModule {}
