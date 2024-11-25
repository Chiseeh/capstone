import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentosadmfirePageRoutingModule } from './documentosadmfire-routing.module';

import { DocumentosadmfirePage } from './documentosadmfire.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentosadmfirePageRoutingModule
  ],
  declarations: [DocumentosadmfirePage]
})
export class DocumentosadmfirePageModule {}
