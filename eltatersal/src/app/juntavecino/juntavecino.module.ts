import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JuntavecinoPageRoutingModule } from './juntavecino-routing.module';

import { JuntavecinoPage } from './juntavecino.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JuntavecinoPageRoutingModule
  ],
  declarations: [JuntavecinoPage]
})
export class JuntavecinoPageModule {}
