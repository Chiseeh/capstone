import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


import { IonicModule } from '@ionic/angular';

import { UsuariosadmPageRoutingModule } from './usuariosadm-routing.module';

import { UsuariosAdmPage } from './usuariosadm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosadmPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UsuariosAdmPage]
})
export class UsuariosadmPageModule {}
