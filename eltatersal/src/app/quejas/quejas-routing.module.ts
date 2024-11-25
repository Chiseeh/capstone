import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QuejasPage } from './quejas.page';
import { IonicModule } from '@ionic/angular';

const routes: Routes = [
  {
    path: '',
    component: QuejasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),IonicModule],
  exports: [RouterModule],
})
export class QuejasPageRoutingModule {}
