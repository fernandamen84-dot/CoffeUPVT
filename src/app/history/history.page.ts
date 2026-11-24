import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false,
})
export class HistoryPage {

  ordenes: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ionViewWillEnter() {
    this.cargarHistorial();
  }

  ionViewDidEnter() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    const data = localStorage.getItem('historial_compras_upvt');
    this.ordenes = data ? JSON.parse(data) : [];
    this.cdr.detectChanges();
  }

}