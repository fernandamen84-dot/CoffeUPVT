import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {

  sesionActiva: boolean = true;
  modoAcceso: 'login' | 'registro' = 'login';
  editandoPerfil: boolean = false;
  private destinoFoto: 'perfil' | 'registro' = 'perfil';

  perfil = {
    nombre: '',
    correo: '',
    matricula: '',
    telefono: '',
    foto: '',
    password: ''
  };

  loginForm = {
    identificador: '',
    password: ''
  };

  registroForm = {
    nombre: '',
    matricula: '',
    correo: '',
    telefono: '',
    password: '',
    foto: ''
  };

  private copiaRespaldo = { ...this.perfil };

  constructor(
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarEstadoSesionYPerfil();
  }

  ionViewWillEnter() {
    this.editandoPerfil = false;
    this.cargarEstadoSesionYPerfil();
  }

  ionViewWillLeave() {
    this.editandoPerfil = false;
    this.quitarFocoActual();
  }

  private quitarFocoActual() {
    const activo = document.activeElement as HTMLElement | null;
    if (activo && typeof activo.blur === 'function') {
      activo.blur();
    }
  }

  cargarEstadoSesionYPerfil() {
    const estadoGuardado = localStorage.getItem('sesion_activa_upvt');
    this.sesionActiva = estadoGuardado === null ? true : estadoGuardado === 'true';

    const guardado = localStorage.getItem('perfil_estudiante_upvt');
    if (guardado) {
      try {
        const datos = JSON.parse(guardado);
        this.perfil = {
          nombre: datos.nombre || '',
          correo: datos.correo || '',
          matricula: datos.matricula || '',
          telefono: datos.telefono || '',
          foto: datos.foto || '',
          password: datos.password || ''
        };
        this.copiaRespaldo = { ...this.perfil };
      } catch {
        // Ignorar JSON corrupto
      }
    }

    this.cdr.detectChanges();
  }

  cambiarModoAcceso(modo: 'login' | 'registro') {
    this.quitarFocoActual();
    this.modoAcceso = modo;
    this.cdr.detectChanges();
  }

  alternarModoEdicion() {
    this.quitarFocoActual();
    if (!this.editandoPerfil) {
      this.copiaRespaldo = { ...this.perfil };
      this.editandoPerfil = true;
    } else {
      this.cancelarEdicion();
    }
    this.cdr.detectChanges();
  }

  cancelarEdicion() {
    this.quitarFocoActual();
    this.perfil = { ...this.copiaRespaldo };
    this.editandoPerfil = false;
    this.cdr.detectChanges();
  }

  abrirSelectorFoto(inputElement: HTMLInputElement) {
    if (!this.editandoPerfil || !this.sesionActiva) {
      return;
    }
    this.destinoFoto = 'perfil';
    this.quitarFocoActual();
    inputElement.value = '';
    inputElement.click();
  }

  abrirSelectorFotoRegistro(inputElement: HTMLInputElement) {
    this.destinoFoto = 'registro';
    this.quitarFocoActual();
    inputElement.value = '';
    inputElement.click();
  }

  onSeleccionarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido.');
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      const resultado = typeof lector.result === 'string' ? lector.result : '';
      if (this.destinoFoto === 'registro') {
        this.registroForm.foto = resultado;
      } else if (this.editandoPerfil && this.sesionActiva) {
        this.perfil.foto = resultado;
      }
      this.cdr.detectChanges();
    };
    lector.readAsDataURL(archivo);
  }

  quitarFoto() {
    if (!this.editandoPerfil || !this.sesionActiva) {
      return;
    }
    this.perfil.foto = '';
    this.cdr.detectChanges();
  }

  async guardarCambios() {
    this.quitarFocoActual();
    localStorage.setItem('perfil_estudiante_upvt', JSON.stringify(this.perfil));
    this.copiaRespaldo = { ...this.perfil };
    this.editandoPerfil = false;
    this.cdr.detectChanges();

    const toast = await this.toastController.create({
      message: 'Cambios del perfil guardados correctamente.',
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async iniciarSesion() {
    this.quitarFocoActual();
    const idIngresado = this.loginForm.identificador.trim().toLowerCase();
    const passIngresado = this.loginForm.password.trim();

    if (!idIngresado || !passIngresado) {
      alert('Ingresa tu matrícula o correo institucional y tu contraseña.');
      return;
    }

    const tieneCuentaGuardada = Boolean(this.perfil.matricula || this.perfil.correo);
    if (tieneCuentaGuardada) {
      const matriculaMatch = this.perfil.matricula && idIngresado === this.perfil.matricula.trim().toLowerCase();
      const correoMatch = this.perfil.correo && idIngresado === this.perfil.correo.trim().toLowerCase();
      if (!matriculaMatch && !correoMatch) {
        alert('La matrícula o correo no coincide con la cuenta registrada en este dispositivo.');
        return;
      }
      if (this.perfil.password && passIngresado !== this.perfil.password) {
        alert('Contraseña incorrecta.');
        return;
      }
    } else {
      if (idIngresado.includes('@')) {
        this.perfil.correo = this.loginForm.identificador.trim();
      } else {
        this.perfil.matricula = this.loginForm.identificador.trim();
      }
      this.perfil.password = passIngresado;
      localStorage.setItem('perfil_estudiante_upvt', JSON.stringify(this.perfil));
    }

    this.sesionActiva = true;
    this.editandoPerfil = false;
    localStorage.setItem('sesion_activa_upvt', 'true');
    this.loginForm = { identificador: '', password: '' };
    this.copiaRespaldo = { ...this.perfil };
    this.cdr.detectChanges();

    const toast = await this.toastController.create({
      message: `¡Bienvenido${this.perfil.nombre ? ', ' + this.perfil.nombre : ''}! Sesión iniciada.`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async crearCuenta() {
    this.quitarFocoActual();
    const nombre = this.registroForm.nombre.trim();
    const matricula = this.registroForm.matricula.trim();
    const correo = this.registroForm.correo.trim();
    const telefono = this.registroForm.telefono.trim();
    const password = this.registroForm.password.trim();

    if (!nombre || !matricula || !correo || !password) {
      alert('Completa al menos nombre, matrícula, correo institucional y contraseña.');
      return;
    }

    this.perfil = {
      nombre,
      matricula,
      correo,
      telefono,
      foto: this.registroForm.foto,
      password
    };

    localStorage.setItem('perfil_estudiante_upvt', JSON.stringify(this.perfil));
    localStorage.setItem('sesion_activa_upvt', 'true');
    this.copiaRespaldo = { ...this.perfil };
    this.sesionActiva = true;
    this.editandoPerfil = false;
    this.registroForm = { nombre: '', matricula: '', correo: '', telefono: '', password: '', foto: '' };
    this.cdr.detectChanges();

    const toast = await this.toastController.create({
      message: 'Cuenta creada con éxito. ¡Bienvenido a CoffeUPVT!',
      duration: 2200,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  async cerrarSesion() {
    this.quitarFocoActual();
    this.editandoPerfil = false;
    this.sesionActiva = false;
    this.modoAcceso = 'login';
    localStorage.setItem('sesion_activa_upvt', 'false');
    this.cdr.detectChanges();

    const toast = await this.toastController.create({
      message: 'Sesión cerrada. Inicia sesión o crea una cuenta.',
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}