import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportesadmPageRoutingModule } from './reportesadm-routing.module';

import { ReportesadmPage } from './reportesadm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportesadmPageRoutingModule
  ],
  declarations: [ReportesadmPage]
})
export class ReportesadmPageModule {}
