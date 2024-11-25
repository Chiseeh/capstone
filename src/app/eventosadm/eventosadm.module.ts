import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EventosadmPageRoutingModule } from './eventosadm-routing.module';

import { EventosAdmPage } from './eventosadm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EventosadmPageRoutingModule
  ],
  declarations: [EventosAdmPage]
})
export class EventosadmPageModule {}
