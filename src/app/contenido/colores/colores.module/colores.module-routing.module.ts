import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColoresModulePage } from './colores.module.page';

const routes: Routes = [
  {
    path: '',
    component: ColoresModulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColoresModulePageRoutingModule {}
