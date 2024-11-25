import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NoticiasadmPageRoutingModule } from './noticiasadm-routing.module';

import { NoticiasAdmPage } from './noticiasadm.page';

import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoticiasadmPageRoutingModule,
    AngularFirestoreModule
  ],
  declarations: [NoticiasAdmPage]
})
export class NoticiasadmPageModule {}
