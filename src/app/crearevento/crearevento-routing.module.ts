import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreareventoPage } from './crearevento.page';

const routes: Routes = [
  {
    path: '',
    component: CreareventoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreareventoPageRoutingModule {}
