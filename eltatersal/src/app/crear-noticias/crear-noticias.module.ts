import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearNoticiasPageRoutingModule } from './crear-noticias-routing.module';

import { CrearNoticiasPage } from './crear-noticias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearNoticiasPageRoutingModule
  ],
  declarations: [CrearNoticiasPage]
})
export class CrearNoticiasPageModule {}
