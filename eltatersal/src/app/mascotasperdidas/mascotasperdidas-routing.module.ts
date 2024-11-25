import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MascotasperdidasPage } from './mascotasperdidas.page';

const routes: Routes = [
  {
    path: '',
    component: MascotasperdidasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MascotasperdidasPageRoutingModule {}
