import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage {
  productos: any[] = [];
  metodoPago: string = '';
  recibirNotificaciones: boolean = true;

  datosTarjeta = {
    titular: '',
    numero: '',
    vencimiento: '',
    cvv: ''
  };

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastController: ToastController
  ) {}

  ionViewWillEnter() {
    this.cargarDatos();
  }

  ionViewDidEnter() {
    this.cargarDatos();
  }

  ionViewWillLeave() {
    this.quitarFocoActual();
  }

  private quitarFocoActual() {
    const activo = document.activeElement as HTMLElement | null;
    if (activo && typeof activo.blur === 'function') {
      activo.blur();
    }
  }

  volverAlMenu() {
    this.quitarFocoActual();
    this.router.navigate(['/home']);
  }

  cargarDatos() {
    const data = localStorage.getItem('mi_carrito');
    console.log('Datos leídos de localStorage:', data);
    this.productos = data ? JSON.parse(data) : [];
    this.cdr.detectChanges();
  }

  aumentar(index: number) {
    this.productos[index].cantidad++;
    this.actualizarStorage();
  }

  disminuir(index: number) {
    if (this.productos[index].cantidad > 1) {
      this.productos[index].cantidad--;
    } else {
      this.productos.splice(index, 1);
    }
    this.actualizarStorage();
  }

  eliminar(index: number) {
    this.productos.splice(index, 1);
    this.actualizarStorage();
  }

  actualizarStorage() {
    localStorage.setItem('mi_carrito', JSON.stringify(this.productos));
    this.cdr.detectChanges();
  }

  getTotal(): number {
    return this.productos.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }

  obtenerTextoBotonPago(): string {
    if (this.metodoPago === 'efectivo') {
      return 'REGISTRAR ORDEN Y GENERAR QR';
    }
    if (this.metodoPago === 'tarjeta') {
      return 'PAGAR Y GENERAR QR';
    }
    return 'CONTINUAR Y GENERAR QR';
  }

  formatearNumeroTarjeta(event: any) {
    const valor = String(event?.detail?.value ?? '').replace(/\D/g, '').slice(0, 16);
    const grupos = valor.match(/.{1,4}/g);
    this.datosTarjeta.numero = grupos ? grupos.join(' ') : '';
  }

  formatearVencimiento(event: any) {
    const digitos = String(event?.detail?.value ?? '').replace(/\D/g, '').slice(0, 4);
    if (digitos.length >= 3) {
      this.datosTarjeta.vencimiento = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    } else {
      this.datosTarjeta.vencimiento = digitos;
    }
  }

  validarTarjeta(): boolean {
    const soloDigitos = this.datosTarjeta.numero.replace(/\D/g, '');
    const cvvLimpio = this.datosTarjeta.cvv.replace(/\D/g, '');

    if (!this.datosTarjeta.titular.trim()) {
      alert('Ingresa el nombre del titular de la tarjeta.');
      return false;
    }

    if (soloDigitos.length < 13 || soloDigitos.length > 16) {
      alert('Ingresa un número de tarjeta válido (13 a 16 dígitos).');
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.datosTarjeta.vencimiento)) {
      alert('Ingresa una fecha de vencimiento válida en formato MM/AA.');
      return false;
    }

    if (cvvLimpio.length < 3 || cvvLimpio.length > 4) {
      alert('Ingresa un CVV válido de 3 o 4 dígitos.');
      return false;
    }

    return true;
  }

  async procesarPago() {
    if (!this.productos || this.productos.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    if (!this.metodoPago) {
      alert('Selecciona un método de pago.');
      return;
    }

    let etiquetaPago = 'Efectivo en Ventanilla (Pago al recoger)';
    let estadoPago = 'Pendiente de pago en ventanilla';
    let mensajeToast = '';

    if (this.metodoPago === 'tarjeta') {
      if (!this.validarTarjeta()) {
        return;
      }
      const ultimos4 = this.datosTarjeta.numero.replace(/\D/g, '').slice(-4);
      etiquetaPago = `Tarjeta •••• ${ultimos4} (${this.datosTarjeta.titular.trim()})`;
      estadoPago = 'Pagado con tarjeta digital';
    }

    this.quitarFocoActual();

    const numeroOrden = Math.floor(1042 + Math.random() * 8900);
    const codigoUnico = `Orden#${numeroOrden}-UPVT-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const totalPagar = this.getTotal();
    const resumenProductos = this.productos
      .map((p: any) => `${p.nombre} (x${p.cantidad}) - $${p.precio * p.cantidad} MXN`)
      .join(', ');

    const nuevaOrden = {
      id: numeroOrden,
      codigoQr: codigoUnico,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(codigoUnico)}`,
      productos: [...this.productos],
      resumen: resumenProductos,
      total: totalPagar,
      metodoPago: this.metodoPago,
      etiquetaPago,
      estadoPago,
      notificaciones: this.recibirNotificaciones,
      pasoIndex: 1,
      estado: '¡PEDIDO EN PREPARACIÓN!',
      fecha: new Date().toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const historial = JSON.parse(localStorage.getItem('historial_compras_upvt') || '[]');
    historial.unshift(nuevaOrden);
    localStorage.setItem('historial_compras_upvt', JSON.stringify(historial));
    localStorage.setItem('orden_activa_upvt', JSON.stringify(nuevaOrden));

    this.productos = [];
    this.metodoPago = '';
    this.datosTarjeta = { titular: '', numero: '', vencimiento: '', cvv: '' };
    localStorage.removeItem('mi_carrito');
    this.cdr.detectChanges();

    if (nuevaOrden.metodoPago === 'efectivo') {
      mensajeToast = `Orden #${numeroOrden} registrada. Paga $${totalPagar} MXN en ventanilla al recoger.`;
    } else {
      mensajeToast = `Orden #${numeroOrden} pagada con ${etiquetaPago}.`;
    }

    const toast = await this.toastController.create({
      message: mensajeToast,
      duration: 2800,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
}