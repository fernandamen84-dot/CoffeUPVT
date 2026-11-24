import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContenidoPage } from './contenido.page';

const routes: Routes = [
  {
    path: '',
    component: ContenidoPage
  },  {
    path: 'datos',
    loadChildren: () => import('./datos/datos.module').then( m => m.DatosPageModule)
  },
  {
    path: 'colores',
    loadChildren: () => import('./colores/colores.module').then( m => m.ColoresPageModule)
  },
  {
    path: 'modal',
    loadChildren: () => import('./modal/modal.module').then( m => m.ModalPageModule)
  },
  {
    path: 'personajes',
    loadChildren: () => import('./personajes/personajes.module').then( m => m.PersonajesPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContenidoPageRoutingModule {}
