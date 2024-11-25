import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocalesadmPageRoutingModule } from './localesadm-routing.module';

import { LocalesAdmPage } from './localesadm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocalesadmPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [LocalesAdmPage]
})
export class LocalesadmPageModule {}
