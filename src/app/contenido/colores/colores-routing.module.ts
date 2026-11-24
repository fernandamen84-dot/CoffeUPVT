import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColoresPage } from './colores.page';

const routes: Routes = [
  {
    path: '',
    component: ColoresPage
  },  {
    path: 'colores.module',
    loadChildren: () => import('./colores.module/colores.module.module').then( m => m.ColoresModulePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColoresPageRoutingModule {}
