import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MascotasperdidasPageRoutingModule } from './mascotasperdidas-routing.module';

import { MascotasperdidasPage } from './mascotasperdidas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,  // Asegúrate de que esté incluido
    MascotasperdidasPageRoutingModule
  ],
  declarations: [MascotasperdidasPage]
})
export class MascotasperdidasPageModule {}
