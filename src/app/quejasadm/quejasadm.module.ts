import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuejasadmPageRoutingModule } from './quejasadm-routing.module';

import { QuejasadmPage } from './quejasadm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuejasadmPageRoutingModule
  ],
  declarations: [QuejasadmPage]
})
export class QuejasadmPageModule {}
