import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  principal = [
    { titulo: 'Catálogo / Menú', color: 'primary', icon: 'fast-food', ruta: '/home' },
    { titulo: 'Historial de Compras', color: 'warning', icon: 'time', ruta: '/history' },
  ];

  menu = [
    { titulo: 'Mi Carrito', color: 'primary', icon: 'cart', ruta: '/cart' },
    { titulo: 'Estado de Orden', color: 'success', icon: 'receipt', ruta: '/order-status' },
    { titulo: 'Perfil del Estudiante', color: 'danger', icon: 'person', ruta: '/profile' },
    { titulo: 'Personajes (Rick y Morty)', color: 'secondary', icon: 'planet', ruta: '/personajes' }
  ];

  constructor() {}
}