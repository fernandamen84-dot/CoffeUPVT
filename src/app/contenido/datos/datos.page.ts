import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences'; // 1. Importamos el plugin

@Component({
  selector: 'app-datos',
  templateUrl: './datos.page.html',
  styleUrls: ['./datos.page.scss'],
  standalone: false,
})
export class DatosPage implements OnInit {

  txt: string = '';
  lbl: string = '';

  constructor() { }

  // 2. Usamos async/await porque Preferences devuelve Promesas
  async ngOnInit() {
    console.log('Se ha iniciado la app');

    // Obtener el valor guardado
    const { value } = await Preferences.get({ key: 'texto' });

    this.lbl = value || 'sin datos guardados';
    console.log('Valor recuperado al iniciar:', this.lbl);
  }

  // 3. Guardar usando Preferences.set
  async guardar() {
    await Preferences.set({
      key: 'texto',
      value: this.txt,
    });

    this.lbl = this.txt;
    console.log('Valor guardado exitosamente:', this.txt);
  }

  // 4. Eliminar usando Preferences.remove
  async eliminar() {
    await Preferences.remove({ key: 'texto' });

    // Volvemos a consultar para confirmar que se borró
    const { value } = await Preferences.get({ key: 'texto' });

    this.lbl = value || 'sin datos guardados';
    console.log('Valor eliminado. Estado actual:', this.lbl);
  }
}