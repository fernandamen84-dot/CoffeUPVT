import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModalModulePage } from './modal.module.page';

const routes: Routes = [
  {
    path: '',
    component: ModalModulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalModulePageRoutingModule {}
