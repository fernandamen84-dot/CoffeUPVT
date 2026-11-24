import { Component, inject, OnInit, signal } from '@angular/core';
import { RickService } from '../../services/rick-service';
import { personaje } from '../../interfaces/rick-interface';

@Component({
  selector: 'app-personajes',
  templateUrl: './personajes.page.html',
  styleUrls: ['./personajes.page.scss'],
  standalone: false,
})
export class PersonajesPage implements OnInit {

  public listapersonajes  =  signal<personaje[]>([]) // AQUI SE GUARDAN LOS PERSONAJES

  private servicio = inject(RickService) //AQUI SE INVOCA EN EL SERVCIO 

  
  ngOnInit() {
  }

  personajesSrvc(){
    this.servicio.getPersonajes().subscribe(
      {
        next:(res) => {
          //se realiza la accion
          console.log("Infromacion obtenida del servicio",res.results)
          this.listapersonajes.set (res.results)
        },

        error:(err) => {
          console.error("Error en la petición",err)
        },

        complete() {
          console.log("Petición completada")
        }

      }
    )
  }
}