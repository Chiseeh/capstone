import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Documentos2PageRoutingModule } from './documentos2-routing.module';

import { Documentos2Page } from './documentos2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Documentos2PageRoutingModule
  ],
  declarations: [Documentos2Page]
})
export class Documentos2PageModule {}
