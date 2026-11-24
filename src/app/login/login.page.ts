import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  modo: string = 'login'; // 'login' o 'registro'

  loginData = {
    email: '',
    password: ''
  };

  registroData = {
    nombre: '',
    matricula: '',
    email: '',
    password: ''
  };

  constructor(private router: Router) {}

  crearCuenta() {
    if (!this.registroData.nombre || !this.registroData.email || !this.registroData.password) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Guardar lista de usuarios registrados
    const usuarios = JSON.parse(localStorage.getItem('usuarios_upvt') || '[]');
    const existe = usuarios.some((u: any) => u.email === this.registroData.email);

    if (existe) {
      alert('Este correo ya está registrado. Inicia sesión.');
      this.modo = 'login';
      return;
    }

    usuarios.push(this.registroData);
    localStorage.setItem('usuarios_upvt', JSON.stringify(usuarios));

    // Guardar sesión activa y sincronizar con el Perfil del Estudiante
    localStorage.setItem('sesion_activa', JSON.stringify(this.registroData));
    localStorage.setItem('mi_perfil_upvt', JSON.stringify({
      nombre: this.registroData.nombre,
      email: this.registroData.email,
      matricula: this.registroData.matricula,
      telefono: ''
    }));

    alert('¡Cuenta creada con éxito! Bienvenido/a a CoffeUPVT.');
    this.router.navigate(['/home']);
  }

  iniciarSesion() {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Ingresa tu correo y contraseña.');
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios_upvt') || '[]');
    const usuarioValido = usuarios.find(
      (u: any) => u.email === this.loginData.email && u.password === this.loginData.password
    );

    if (usuarioValido) {
      localStorage.setItem('sesion_activa', JSON.stringify(usuarioValido));
      localStorage.setItem('mi_perfil_upvt', JSON.stringify({
        nombre: usuarioValido.nombre,
        email: usuarioValido.email,
        matricula: usuarioValido.matricula,
        telefono: usuarioValido.telefono || ''
      }));
      this.router.navigate(['/home']);
    } else {
      alert('Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate.');
    }
  }
}