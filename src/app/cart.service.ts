import { Injectable } from '@angular/core';

export interface ProductoCarrito {
  nombre: string;
  precio: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private carrito: ProductoCarrito[] = [];

  constructor() {
    // Cargar lo que ya esté guardado al iniciar la app
    const guardado = localStorage.getItem('carrito_coffeapp');
    if (guardado) {
      this.carrito = JSON.parse(guardado);
    }
  }

  private guardarStorage() {
    localStorage.setItem('carrito_coffeapp', JSON.stringify(this.carrito));
  }

  agregarProducto(nombre: string, precio: number) {
    const item = this.carrito.find(p => p.nombre === nombre);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ nombre, precio, cantidad: 1 });
    }
    this.guardarStorage();
  }

  obtenerCarrito() {
    const guardado = localStorage.getItem('carrito_coffeapp');
    if (guardado) {
      this.carrito = JSON.parse(guardado);
    }
    return this.carrito;
  }

  aumentarCantidad(index: number) {
    this.carrito[index].cantidad++;
    this.guardarStorage();
  }

  disminuirCantidad(index: number) {
    if (this.carrito[index].cantidad > 1) {
      this.carrito[index].cantidad--;
    } else {
      this.eliminarProducto(index);
    }
    this.guardarStorage();
  }

  eliminarProducto(index: number) {
    this.carrito.splice(index, 1);
    this.guardarStorage();
  }

  calcularTotal(): number {
    return this.carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }
}