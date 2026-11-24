import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import * as L from 'leaflet';

interface CoordenadasUPVT {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-order-status',
  templateUrl: './order-status.page.html',
  styleUrls: ['./order-status.page.scss'],
  standalone: false,
})
export class OrderStatusPage implements OnInit, AfterViewInit, OnDestroy {

  ordenActiva: any = null;

  private readonly CAFETERIA_UPVT: CoordenadasUPVT = {
    lat: 19.2994,
    lng: -99.7347
  };

  ubicacionUsuario: CoordenadasUPVT | null = null;
  rutaCafeteriaVisible: boolean = false;
  recorridoEnVivo: boolean = false;
  buscandoUbicacion: boolean = false;
  mensajeAviso: string = '';

  textoUbicacionActual: string = 'Aún no seleccionada';
  distanciaCafeteria: string = '';
  tiempoEstimado: string = '';
  indicacionRecorrido: string = 'Presiona "Mi ubicación" para ver dónde estás y luego toca la tacita ("Cafetería") para ver el recorrido.';

  private mapa: L.Map | null = null;
  private marcadorUsuario: L.CircleMarker | null = null;
  private marcadorCafeteria: L.CircleMarker | null = null;
  private lineaRuta: L.Polyline | null = null;
  private watchId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarOrdenActiva();
  }

  ngAfterViewInit() {
    this.programarMontajeMapa();
  }

  ionViewWillEnter() {
    this.cargarOrdenActiva();
  }

  ionViewDidEnter() {
    this.programarMontajeMapa();
  }

  ionViewWillLeave() {
    this.quitarFocoActual();
    this.detenerWatcher();
  }

  ngOnDestroy() {
    this.detenerWatcher();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.destruirMapa();
  }

  private quitarFocoActual() {
    const activo = document.activeElement as HTMLElement | null;
    if (activo && typeof activo.blur === 'function') {
      activo.blur();
    }
  }

  irAlMenu() {
    this.quitarFocoActual();
    this.router.navigate(['/home']);
  }

  async descargarTicketPdf() {
    this.quitarFocoActual();
    if (!this.ordenActiva) {
      return;
    }

    const folio = this.ordenActiva.id || 'UPVT-001';
    const estado = this.ordenActiva.estado || 'En preparación';
    const resumen = this.ordenActiva.resumen || 'Pedido Cafetería UPVT';
    const total = this.ordenActiva.total ?? 0;
    const etiquetaPago = this.ordenActiva.etiquetaPago || 'Pago en ventanilla';
    const codigoQr = this.ordenActiva.codigoQr || folio;
    const qrUrl = this.ordenActiva.qrUrl || '';
    const fecha = new Date().toLocaleString('es-MX');

    const ventana = window.open('', '_blank', 'width=420,height=640');
    if (ventana) {
      ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Ticket Orden #${folio} - CoffeUPVT</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f6f5f2;
              color: #2b211b;
              padding: 20px;
              margin: 0;
            }
            .ticket {
              max-width: 340px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 14px;
              padding: 18px;
              border-top: 5px solid #5c3a21;
              box-shadow: 0 4px 14px rgba(0,0,0,0.08);
            }
            h1 {
              font-size: 18px;
              margin: 0 0 4px 0;
              text-align: center;
              color: #5c3a21;
            }
            .sub {
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              margin-bottom: 14px;
            }
            .fila {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 6px;
            }
            .resumen {
              background: #f8f7f4;
              padding: 10px;
              border-radius: 8px;
              font-size: 12px;
              margin: 10px 0;
            }
            .total {
              font-size: 15px;
              font-weight: bold;
              text-align: right;
              margin-top: 8px;
              color: #2b211b;
            }
            .qr-box {
              text-align: center;
              margin-top: 14px;
              padding-top: 12px;
              border-top: 1px dashed #d6d3cd;
            }
            .qr-box img {
              width: 140px;
              height: 140px;
            }
            .codigo {
              font-family: monospace;
              font-size: 11px;
              color: #6b7280;
              margin-top: 4px;
            }
            @media print {
              body { background: #ffffff; padding: 0; }
              .ticket { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <h1>CoffeUPVT · Cafetería</h1>
            <div class="sub">Comprobante de Orden · ${fecha}</div>
            <div class="fila"><span>Folio:</span><strong>#${folio}</strong></div>
            <div class="fila"><span>Estado:</span><strong>${estado}</strong></div>
            <div class="fila"><span>Pago:</span><span>${etiquetaPago}</span></div>
            <div class="resumen">${resumen}</div>
            <div class="total">Total: $${total} MXN</div>
            ${qrUrl ? `
              <div class="qr-box">
                <img src="${qrUrl}" alt="QR" />
                <div class="codigo">${codigoQr}</div>
              </div>
            ` : `<div class="codigo">Código: ${codigoQr}</div>`}
          </div>
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 250);
            };
          </script>
        </body>
        </html>
      `);
      ventana.document.close();

      const toast = await this.toastController.create({
        message: 'Ticket listo para guardar o imprimir en PDF.',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } else {
      const toast = await this.toastController.create({
        message: 'Permite ventanas emergentes para exportar el PDF del ticket.',
        duration: 2200,
        position: 'bottom',
        color: 'warning'
      });
      await toast.present();
    }
  }

  cargarOrdenActiva() {
    const raw = localStorage.getItem('orden_activa_upvt');
    if (raw) {
      try {
        this.ordenActiva = JSON.parse(raw);
        if (this.ordenActiva?.ubicacionCliente) {
          const u = this.ordenActiva.ubicacionCliente;
          if (typeof u.lat === 'number' && typeof u.lng === 'number') {
            this.ubicacionUsuario = { lat: u.lat, lng: u.lng };
            this.textoUbicacionActual = `${u.lat.toFixed(5)}, ${u.lng.toFixed(5)}`;
          }
        }
      } catch {
        this.ordenActiva = null;
      }
    } else {
      this.ordenActiva = null;
    }
    this.cdr.detectChanges();
  }

  private programarMontajeMapa() {
    setTimeout(() => {
      this.crearMapaUPVT();
      this.forzarRedibujadoMapa();
      if (this.ubicacionUsuario) {
        this.ubicarUsuarioEnMapa(this.ubicacionUsuario.lat, this.ubicacionUsuario.lng, false);
        if (this.rutaCafeteriaVisible) {
          this.mostrarRecorridoCafeteria();
        }
      }
    }, 250);
  }

  forzarRedibujadoMapa() {
    if (!this.mapa) {
      this.crearMapaUPVT();
    }
    if (!this.mapa) {
      return;
    }
    this.mapa.invalidateSize({ animate: false, pan: false });
    setTimeout(() => {
      this.mapa?.invalidateSize({ animate: false, pan: false });
    }, 200);
  }

  private destruirMapa() {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
      this.marcadorUsuario = null;
      this.marcadorCafeteria = null;
      this.lineaRuta = null;
    }
  }

  private crearMapaUPVT() {
    const el = document.getElementById('mapa-upvt');
    if (!el || this.mapa) {
      return;
    }

    this.mapa = L.map('mapa-upvt', {
      center: [this.CAFETERIA_UPVT.lat, this.CAFETERIA_UPVT.lng],
      zoom: 17,
      zoomControl: true,
      fadeAnimation: false,
      zoomAnimation: false,
      markerZoomAnimation: false
    });

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      keepBuffer: 6,
      updateWhenIdle: false,
      updateWhenZooming: false,
      attribution: '&copy; OpenStreetMap'
    });

    const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      keepBuffer: 6,
      updateWhenIdle: false,
      updateWhenZooming: false,
      attribution: '&copy; CARTO'
    });

    let fallos = 0;
    osm.on('tileerror', () => {
      fallos++;
      if (fallos >= 2 && this.mapa && this.mapa.hasLayer(osm)) {
        this.mapa.removeLayer(osm);
        carto.addTo(this.mapa);
        this.forzarRedibujadoMapa();
      }
    });

    osm.addTo(this.mapa);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver?.disconnect();
      this.resizeObserver = new ResizeObserver(() => {
        this.mapa?.invalidateSize({ animate: false, pan: false });
      });
      this.resizeObserver.observe(el);
    }
  }

  seleccionarMiUbicacion() {
    this.quitarFocoActual();
    this.mensajeAviso = '';
    if (!('geolocation' in navigator)) {
      this.mensajeAviso = 'Tu navegador no soporta ubicación GPS.';
      return;
    }

    this.buscandoUbicacion = true;
    this.cdr.detectChanges();

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        this.buscandoUbicacion = false;
        this.ubicarUsuarioEnMapa(pos.coords.latitude, pos.coords.longitude, true);
        const toast = await this.toastController.create({
          message: 'Mostrando tu ubicación actual en la UPVT.',
          duration: 1600,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      },
      (err) => {
        this.buscandoUbicacion = false;
        this.mensajeAviso = this.mensajeError(err.code);
        this.cdr.detectChanges();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  mostrarRecorridoCafeteria() {
    this.quitarFocoActual();
    this.mensajeAviso = '';
    this.rutaCafeteriaVisible = true;

    if (!this.mapa) {
      this.crearMapaUPVT();
    }
    if (!this.mapa) {
      return;
    }

    if (!this.marcadorCafeteria) {
      this.marcadorCafeteria = L.circleMarker([this.CAFETERIA_UPVT.lat, this.CAFETERIA_UPVT.lng], {
        radius: 10,
        fillColor: '#f97316',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.95
      })
        .addTo(this.mapa)
        .bindPopup('<b>Cafetería UPVT</b>');
    } else {
      this.marcadorCafeteria.setLatLng([this.CAFETERIA_UPVT.lat, this.CAFETERIA_UPVT.lng]);
    }
    this.marcadorCafeteria.openPopup();

    if (!this.ubicacionUsuario) {
      this.mapa.setView([this.CAFETERIA_UPVT.lat, this.CAFETERIA_UPVT.lng], 17, { animate: false });
      this.indicacionRecorrido = 'Cafetería UPVT marcada. Presiona "Mi ubicación" para calcular la distancia y el recorrido hasta aquí.';
      this.forzarRedibujadoMapa();
      this.cdr.detectChanges();
      return;
    }

    this.calcularYDibujarRecorrido();
  }

  iniciarRecorrido() {
    this.quitarFocoActual();
    this.mensajeAviso = '';
    this.rutaCafeteriaVisible = true;

    if (!('geolocation' in navigator)) {
      this.mensajeAviso = 'Tu navegador no soporta recorrido en tiempo real.';
      return;
    }

    this.detenerWatcher();
    this.recorridoEnVivo = true;
    this.buscandoUbicacion = true;
    this.cdr.detectChanges();

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.buscandoUbicacion = false;
        this.ubicarUsuarioEnMapa(pos.coords.latitude, pos.coords.longitude, false);
        this.calcularYDibujarRecorrido();
      },
      (err) => {
        this.buscandoUbicacion = false;
        this.recorridoEnVivo = false;
        this.mensajeAviso = this.mensajeError(err.code);
        this.detenerWatcher();
        this.cdr.detectChanges();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 2000 }
    );
  }

  detenerRecorrido() {
    this.quitarFocoActual();
    this.detenerWatcher();
    this.recorridoEnVivo = false;
    this.cdr.detectChanges();
  }

  simularUbicacionCampus() {
    this.mensajeAviso = '';
    this.ubicarUsuarioEnMapa(this.CAFETERIA_UPVT.lat + 0.0011, this.CAFETERIA_UPVT.lng + 0.0009, false);
    this.mostrarRecorridoCafeteria();
  }

  private ubicarUsuarioEnMapa(lat: number, lng: number, centrarSoloUsuario: boolean) {
    this.ubicacionUsuario = { lat, lng };
    this.textoUbicacionActual = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    if (this.ordenActiva) {
      this.ordenActiva.ubicacionCliente = {
        lat,
        lng,
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        enTiempoReal: this.recorridoEnVivo
      };
      localStorage.setItem('orden_activa_upvt', JSON.stringify(this.ordenActiva));
    }

    if (!this.mapa) {
      this.crearMapaUPVT();
    }
    if (!this.mapa) {
      return;
    }

    if (!this.marcadorUsuario) {
      this.marcadorUsuario = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: '#dc2626',
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.95
      })
        .addTo(this.mapa)
        .bindPopup('<b>Estás aquí</b>');
    } else {
      this.marcadorUsuario.setLatLng([lat, lng]);
    }

    if (centrarSoloUsuario && !this.rutaCafeteriaVisible) {
      this.mapa.setView([lat, lng], 17, { animate: false });
      this.marcadorUsuario.openPopup();
      this.indicacionRecorrido = 'Ubicación marcada. Ahora toca el botón de la tacita (Cafetería) para ver el recorrido.';
    } else if (this.rutaCafeteriaVisible) {
      this.calcularYDibujarRecorrido();
    }

    this.forzarRedibujadoMapa();
    this.cdr.detectChanges();
  }

  private calcularYDibujarRecorrido() {
    if (!this.mapa || !this.ubicacionUsuario) {
      return;
    }

    const { lat, lng } = this.ubicacionUsuario;
    const puntos: L.LatLngExpression[] = [
      [lat, lng],
      [this.CAFETERIA_UPVT.lat, this.CAFETERIA_UPVT.lng]
    ];

    if (!this.lineaRuta) {
      this.lineaRuta = L.polyline(puntos, {
        color: '#ea580c',
        weight: 3.5,
        dashArray: '6, 6'
      }).addTo(this.mapa);
    } else {
      this.lineaRuta.setLatLngs(puntos);
    }

    const metros = this.distanciaMetros(lat, lng, this.CAFETERIA_UPVT.lat, this.CAFETERIA_UPVT.lng);
    this.distanciaCafeteria = metros < 1000
      ? `${Math.round(metros)} m`
      : `${(metros / 1000).toFixed(2)} km`;

    const minutos = Math.max(1, Math.round(metros / 75));
    this.tiempoEstimado = minutos === 1 ? '1 min aprox.' : `${minutos} min aprox.`;

    const rumboNS = this.CAFETERIA_UPVT.lat < lat ? 'sur' : 'norte';
    const rumboOE = this.CAFETERIA_UPVT.lng < lng ? 'oeste' : 'este';
    this.indicacionRecorrido = `Camina hacia el ${rumboNS}-${rumboOE} (${this.distanciaCafeteria}) desde tu ubicación hasta la Cafetería UPVT.`;

    this.mapa.fitBounds(L.latLngBounds(puntos), { padding: [30, 30], maxZoom: 17, animate: false });
    this.forzarRedibujadoMapa();
    this.cdr.detectChanges();
  }

  obtenerUrlComoLlegar(): string {
    const dest = `${this.CAFETERIA_UPVT.lat},${this.CAFETERIA_UPVT.lng}`;
    if (!this.ubicacionUsuario) {
      return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=walking`;
    }
    return `https://www.google.com/maps/dir/?api=1&origin=${this.ubicacionUsuario.lat},${this.ubicacionUsuario.lng}&destination=${dest}&travelmode=walking`;
  }

  private detenerWatcher() {
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const rad = (d: number) => d * (Math.PI / 180);
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private mensajeError(code: number): string {
    if (code === 1) return 'Permiso de ubicación denegado.';
    if (code === 2) return 'No se detectó señal GPS en este momento.';
    if (code === 3) return 'Se agotó el tiempo al buscar ubicación.';
    return 'No se pudo obtener la ubicación.';
  }
}