import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AutoridadesPageRoutingModule } from './autoridades-routing.module';

import { AutoridadesPage } from './autoridades.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AutoridadesPageRoutingModule
  ],
  declarations: [AutoridadesPage]
})
export class AutoridadesPageModule {}
