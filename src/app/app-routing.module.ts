import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'colores',
    loadChildren: () =>
      import('./contenido/colores/colores.module').then(
        (m) => m.ColoresPageModule
      ),
  },
  {
    path: 'modal',
    loadChildren: () =>
      import('./contenido/modal/modal.module').then((m) => m.ModalPageModule),
  },
  {
    path: 'datos',
    loadChildren: () =>
      import('./contenido/datos/datos.module').then((m) => m.DatosPageModule),
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./cart/cart.module').then((m) => m.CartPageModule),
  },
  {
    path: 'order-status',
    loadChildren: () =>
      import('./order-status/order-status.module').then(
        (m) => m.OrderStatusPageModule
      ),
  },
  {
    path: 'history',
    loadChildren: () =>
      import('./history/history.module').then((m) => m.HistoryPageModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
  {
    path: 'personajes',
    loadChildren: () =>
      import('./contenido/personajes/personajes.module').then(
        (m) => m.PersonajesPageModule
      ),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
