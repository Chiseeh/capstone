import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { InfiniteScrollCustomEvent, LoadingController } from '@ionic/angular';
import { Evento } from '../modelos/eventos';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
})
export class EventoPage {
  eventos: Evento[] = [];

  constructor(
    private apiService: ApiService,
    private loadingControl: LoadingController
  ) { }

  ionViewWillEnter(){
    this.loadEvento();
  }

  // metodo para ver los eventos
  async loadEvento(event?: InfiniteScrollCustomEvent){
    // creamos un cargador para visualizar los eventos a través de una carga
    const loading = await this.loadingControl.create({
        message: 'Cargando...',
        spinner: 'bubbles'
      }
    )
    await loading.present(); // fin del cargador

    this.apiService.listarEventos().subscribe(
      (resp) => {
        loading.dismiss();
        this.eventos = resp;
        event?.target.complete(); // termina nuestro evento
      },
      (err) => {
        console.log(err.message);
        loading.dismiss();
      }
    )
  }
}
