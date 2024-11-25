import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AsistenciaPageRoutingModule } from './asistencia-routing.module';
import { QRCodeModule } from 'angularx-qrcode';
import { AsistenciaPage } from './asistencia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZXingScannerModule,
    ReactiveFormsModule,
    QRCodeModule,
    AsistenciaPageRoutingModule
  ],
  declarations: [AsistenciaPage]
})
export class AsistenciaPageModule {}
