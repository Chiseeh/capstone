import { Component, OnInit } from '@angular/core';
import { Evento } from '../modelos/eventos';
import { ApiService } from '../servicios/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-evento',
  templateUrl: './crear-evento.page.html',
  styleUrls: ['./crear-evento.page.scss'],
})
export class CrearEventoPage implements OnInit {

  newEvento: Evento = {
    idEvento: 0,
    nombreEvento: "",
    descripcion: "",
    tipoEvento:  "" || "Actividades Recreativas",
    horaInicio: new Date(),
    usuario: 0
  }

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  // crear un evento nuevo
  crearEvento(){
    this.apiService.crearEventos(this.newEvento).subscribe();
    this.router.navigateByUrl("/evento");
  }

}
