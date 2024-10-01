import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearNoticiasPage } from './crear-noticias.page';

const routes: Routes = [
  {
    path: '',
    component: CrearNoticiasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearNoticiasPageRoutingModule {}
