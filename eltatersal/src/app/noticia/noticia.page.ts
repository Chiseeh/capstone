import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { Noticias } from '../modelos/noticia';
import { ApiService } from '../servicios/api.service';

@Component({
  selector: 'app-noticia',
  templateUrl: './noticia.page.html',
  styleUrls: ['./noticia.page.scss'],
})
export class NoticiaPage  {
  public modalAbierto: boolean = false;
  noticias: Noticias[] = [];

  constructor(private navCtrl: NavController,
    private noticiaServicio: ApiService,
    private loadingControl: LoadingController) { }

  // ciclo de vida de ionic (solo una)
  ionViewWillEnter() {
    this.loadNoticia();
  }

  // metodo el cual nos muestra las noticias para listarlas
  async loadNoticia(event?: InfiniteScrollCustomEvent) {
    // creamos un loading... para cargar y listar las noticias
    const loading = await this.loadingControl.create(
      {
        message: 'Cargando...',
        spinner: 'circles'
      }
    );
    await loading.present(); // fin del evento

    this.noticiaServicio.listarNoticias().subscribe(
      (resp) => {
        loading.dismiss();
        this.noticias = resp;
        event?.target.complete();
      },
      (err) => {
        console.log(err.message);
        loading.dismiss();
      }
    );
  }
}
