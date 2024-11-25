import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetaileventosadmPageRoutingModule } from './detaileventosadm-routing.module';

import { DetaileventosadmPage } from './detaileventosadm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetaileventosadmPageRoutingModule
  ],
  declarations: [DetaileventosadmPage]
})
export class DetaileventosadmPageModule {}
