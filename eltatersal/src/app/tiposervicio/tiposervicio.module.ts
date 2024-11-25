import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TiposervicioPageRoutingModule } from './tiposervicio-routing.module';

import { TiposervicioPage } from './tiposervicio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TiposervicioPageRoutingModule
  ],
  declarations: [TiposervicioPage]
})
export class TiposervicioPageModule {}
