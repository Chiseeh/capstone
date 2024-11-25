import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { EventosAdmPage } from './eventosadm.page';
import { REACTIVE_NODE } from '@angular/core/primitives/signals';

const routes: Routes = [
  {
    path: '',
    component: EventosAdmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [RouterModule],
})
export class EventosadmPageRoutingModule {}
