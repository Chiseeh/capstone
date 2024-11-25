import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentosadmfirePage } from './documentosadmfire.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentosadmfirePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentosadmfirePageRoutingModule {}
