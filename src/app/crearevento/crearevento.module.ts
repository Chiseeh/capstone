import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreareventoPageRoutingModule } from './crearevento-routing.module';

import { CreareventoPage } from './crearevento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreareventoPageRoutingModule
  ],
  declarations: [CreareventoPage]
})
export class CreareventoPageModule {}
