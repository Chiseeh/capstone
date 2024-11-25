import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { Noticias } from '../modelos/noticia';
import { ApiService } from '../servicios/api.service';
import { Feria } from '../modelos/noticia'; // Import Feria model

@Component({
  selector: 'app-noticia',
  templateUrl: './noticia.page.html',
  styleUrls: ['./noticia.page.scss'],
})
export class NoticiaPage implements OnInit {
  public modalAbierto: boolean = false;
  noticias: Noticias[] = [];
  ufData: any;
  ferias: Feria[] = []; // Declare ferias array to store market data

  constructor(
    private navCtrl: NavController,
    private noticiaServicio: ApiService,
    private apiService: ApiService,
    private loadingControl: LoadingController
  ) {}

  ngOnInit() {
    this.loadFerias(); // Load market data
    this.apiService.getUF().subscribe(
      (data) => {
        this.ufData = data;
        console.log(this.ufData);
      },
      (error) => {
        console.error('Error al consumir la API', error);
      }
    );
  }

  // Fetch the market data (ferias)
  loadFerias() {
    this.ferias = [
      { comuna: 'El Bosque', nombreFeria: 'Arturo Prat', callePrincipal: 'Nueva Poniente', calleInicial: 'Manuel Bulnes', calleFinal: 'Tomas Yavar', diasFuncionamiento: 'Miércoles y Sábado', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Borgoño', callePrincipal: 'Luis Barros Borgoño', calleInicial: 'Rengo', calleFinal: 'Javiera Carrera', diasFuncionamiento: 'Miércoles', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Camino Del Inca', callePrincipal: 'Camino del Inca', calleInicial: 'Padre Hurtado', calleFinal: 'Pje. Pumanque', diasFuncionamiento: 'Jueves y Domingo', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Capitan Avalos', callePrincipal: 'Capitán Avalos', calleInicial: 'Gran Avenida', calleFinal: 'Padre Hurtado', diasFuncionamiento: 'Miércoles y Sábado', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Covarrubias', callePrincipal: 'Avda. Julio Covarrubias', calleInicial: 'Los Aviadores', calleFinal: 'Jorge Luco', diasFuncionamiento: 'Martes y Viernes', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'El Sauce', callePrincipal: 'Observatorio', calleInicial: 'Julio Covarrubias', calleFinal: 'Padre Hurtado', diasFuncionamiento: 'Miércoles y Sábado', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Lagos De Chile', callePrincipal: 'Los Nogales', calleInicial: 'Los Espejo', calleFinal: '18 de Septiembre', diasFuncionamiento: 'Jueves y Domingo', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Las Parcelas', callePrincipal: 'Las Parcelas', calleInicial: 'Padre Hurtado', calleFinal: 'Pje. Pumanque', diasFuncionamiento: 'Martes y Viernes', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Los Carolinos', callePrincipal: 'Los Carolinos', calleInicial: 'Los Alamos', calleFinal: 'Los Sauces', diasFuncionamiento: 'Martes y Sábado', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Santa Elena', callePrincipal: 'El Sauce', calleInicial: 'Los Pinares', calleFinal: 'Los Litres', diasFuncionamiento: 'Jueves y Domingo', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Santa Laura', callePrincipal: 'Luis Barros Borgoño', calleInicial: 'Rengo', calleFinal: 'Indio Jerónimo', diasFuncionamiento: 'Domingo', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Temuco', callePrincipal: 'Las Canteras', calleInicial: 'Zinc', calleFinal: 'La Pampa', diasFuncionamiento: 'Martes y Viernes', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Vecinal', callePrincipal: 'Vecinal Sur', calleInicial: 'San Francisco', calleFinal: 'Océano Atlántico', diasFuncionamiento: 'Miércoles y Sábado', horarioFuncionamiento: '09:00 a 15:00' },
      { comuna: 'El Bosque', nombreFeria: 'Victor Plaza Mayorga', callePrincipal: 'Victor Plaza Mayorga', calleInicial: 'Antonio Bórquez', calleFinal: 'Tulipanes', diasFuncionamiento: 'Viernes', horarioFuncionamiento: '09:00 a 15:00' },
      // Add additional entries if there are more markets.
    ];
  }


  ionViewWillEnter() {
    this.loadNoticia();
  }

  volverAtras() {
    this.navCtrl.navigateRoot('inicio');
  }

  toggleVerMas(noticia: Noticias) {
    noticia.verMas = !noticia.verMas;
  }

  async loadNoticia(event?: InfiniteScrollCustomEvent) {
    const loading = await this.loadingControl.create({
      message: 'Cargando...',
      spinner: 'circles'
    });
    await loading.present();

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
