import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Documentos2Page } from './documentos2.page';

const routes: Routes = [
  {
    path: '',
    component: Documentos2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Documentos2PageRoutingModule {}
