import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  textoBuscar: string = '';
  categoriaSeleccionada: string = 'Todos';

  productos: any[] = [];
  productosFiltrados: any[] = [];

  private apiUrl = 'https://coffeupvt.free.beeceptor.com/todos';
  private ultimaPeticionApi = 0;
  private readonly cooldownMs = 60000; // 1 minuto entre consultas a Beeceptor

  // Respaldo local por si Beeceptor responde 429 o no hay caché previa
  private productosRespaldo: any[] = [
    {
      nombre: 'Café Americano Caliente',
      precio: 28,
      categoria: 'Bebidas',
      descripcion: 'Café de grano recién molido (12 oz).',
      imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'
    },
    {
      nombre: 'Capuchino Clásico',
      precio: 36,
      categoria: 'Bebidas',
      descripcion: 'Espresso con leche vaporizada y espuma suave.',
      imagen: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80'
    },
    {
      nombre: 'Chilaquiles Verdes con Pollo',
      precio: 45,
      categoria: 'Comidas',
      descripcion: 'Totopos crujientes en salsa verde, pollo deshebrado, crema y queso.',
      imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80'
    },
    {
      nombre: 'Papas a la Francesa',
      precio: 30,
      categoria: 'Snacks',
      descripcion: 'Porción dorada y crujiente con sal.',
      imagen: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80'
    },
    {
      nombre: 'Combo Mañanero UPVT',
      precio: 55,
      categoria: 'Promos',
      descripcion: 'Café americano + pan dulce o snack del día.',
      imagen: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    },
    {
      nombre: 'Rebanada de Pastel de Chocolate',
      precio: 38,
      categoria: 'Postres',
      descripcion: 'Bizcocho suave de cacao con cobertura cremosa.',
      imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    },
    {
      nombre: 'Iced Latte Vainilla',
      precio: 40,
      categoria: 'Bebidas Frías',
      descripcion: 'Café frío con hielo, leche y toque de vainilla.',
      imagen: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80'
    }
  ];

  categorias = [
    { titulo: 'Todos', icon: 'apps', bgColor: '#ede9fe', iconColor: '#6d28d9', activeBg: '#6d28d9' },
    { titulo: 'Bebidas', icon: 'cafe', bgColor: '#fef3c7', iconColor: '#b45309', activeBg: '#b45309' },
    { titulo: 'Comidas', icon: 'fast-food', bgColor: '#ffedd5', iconColor: '#ea580c', activeBg: '#ea580c' },
    { titulo: 'Snacks', icon: 'nutrition', bgColor: '#dcfce7', iconColor: '#15803d', activeBg: '#15803d' },
    { titulo: 'Promos', icon: 'flame', bgColor: '#ffe4e6', iconColor: '#e11d48', activeBg: '#e11d48' },
    { titulo: 'Postres', icon: 'ice-cream', bgColor: '#fce7f3', iconColor: '#db2777', activeBg: '#db2777' },
    { titulo: 'Bebidas Frías', icon: 'snow', bgColor: '#e0f2fe', iconColor: '#0284c7', activeBg: '#0284c7' }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('url base: ', environment.URL_BASE);
    this.cargarDesdeCacheYRespaldo();
    this.consultarBeeceptorSiToca();
  }

  ionViewWillEnter() {
    if (!this.categoriaSeleccionada) {
      this.categoriaSeleccionada = 'Todos';
    }
    this.cargarDesdeCacheYRespaldo();
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

  private cargarDesdeCacheYRespaldo() {
    const cache = localStorage.getItem('productos_upvt_cache');
    if (cache) {
      try {
        const datosCache = JSON.parse(cache);
        if (Array.isArray(datosCache) && datosCache.length > 0) {
          this.productos = datosCache;
          this.aplicarFiltros();
          return;
        }
      } catch {
        // Ignorar JSON corrupto y usar respaldo
      }
    }

    this.productos = [...this.productosRespaldo];
    this.aplicarFiltros();
  }

  private consultarBeeceptorSiToca() {
    const ahora = Date.now();
    if (ahora - this.ultimaPeticionApi < this.cooldownMs) {
      return;
    }
    this.ultimaPeticionApi = ahora;

    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.productos = data;
          localStorage.setItem('productos_upvt_cache', JSON.stringify(data));
          this.aplicarFiltros();
        }
      },
      error: (err) => {
        // Si hay 429 (límite de peticiones) o error de red, mantenemos caché/respaldo sin saturar
        if (err?.status === 429) {
          this.ultimaPeticionApi = Date.now() + this.cooldownMs;
        }
        this.cargarDesdeCacheYRespaldo();
      }
    });
  }

  obtenerCantidadCarrito(): number {
    const carritoActual = JSON.parse(localStorage.getItem('mi_carrito') || '[]');
    return carritoActual.reduce((total: number, item: any) => total + (item.cantidad || 1), 0);
  }

  async agregarAlCarrito(nombre: string, precio: number) {
    let carritoActual = JSON.parse(localStorage.getItem('mi_carrito') || '[]');
    const index = carritoActual.findIndex((p: any) => p.nombre === nombre);
    if (index > -1) {
      carritoActual[index].cantidad += 1;
    } else {
      carritoActual.push({ nombre, precio, cantidad: 1 });
    }
    localStorage.setItem('mi_carrito', JSON.stringify(carritoActual));
    this.cdr.detectChanges();

    const toast = await this.toastController.create({
      message: `${nombre} agregado al carrito`,
      duration: 1400,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  irAlCarrito() {
    this.quitarFocoActual();
    this.router.navigate(['/cart']);
  }

  buscarProducto(event: any) {
    this.textoBuscar = typeof event === 'string' ? event : (event?.target?.value ?? '');
    this.aplicarFiltros();
  }

  filtrarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria || 'Todos';
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const texto = (this.textoBuscar || '').toLowerCase().trim();
    const cat = this.categoriaSeleccionada || 'Todos';

    this.productosFiltrados = (this.productos || []).filter(prod => {
      const coincideCategoria = cat === 'Todos' || prod.categoria === cat;
      const coincideTexto = !texto || (prod.nombre || '').toLowerCase().includes(texto);
      return coincideCategoria && coincideTexto;
    });

    this.cdr.detectChanges();
  }
}