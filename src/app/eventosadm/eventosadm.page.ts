import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, InfiniteScrollCustomEvent, LoadingController, ToastController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service'; // Asegúrate de importar tu servicio
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-eventosadm',
  templateUrl: './eventosadm.page.html',
  styleUrls: ['./eventosadm.page.scss'],
})
export class EventosAdmPage implements OnInit {

  eventos: Observable<any[]> = of([]); // Inicializa como un observable vacío
  eventosFiltrados: any[] = []; // Para almacenar eventos filtrados
  searchTerm: string = ''; // Término de búsqueda


  constructor(
    private apiService: ApiService, // Cambiado a tu ApiService
    private loadingControl: LoadingController,
    private toastController: ToastController,
    private navCtrl: NavController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadEvento();
  }

  async loadEvento(event?: InfiniteScrollCustomEvent) {
    const loading = await this.loadingControl.create({
      message: 'Cargando...',
      spinner: 'bubbles'
    });
    await loading.present();

    this.eventos = this.apiService.listarEventosFirebase();

    this.eventos.subscribe(() => {
      loading.dismiss();
      event?.target.complete();
    }, (err) => {
      console.log(err.message);
      loading.dismiss();
    });
  }

  async confirmarDelete(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de eliminar este evento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteEvento(id);
          },
        },
      ],
    });

    await alert.present();
  }

  deleteEvento(id: string) {
    this.apiService.eliminarEventoFirebase(id).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Evento eliminado exitosamente',
          duration: 2000,
        });
        toast.present();
        this.loadEvento(); // Recargamos los eventos
      },
      error: async (error) => {
        console.error("Error al eliminar el evento: ", error);
      }
    });
  }

  // Navegación a diferentes páginas
  irAInicio() {
    this.navCtrl.navigateForward('/inicio');
  }

  irAQuejas() {
    this.navCtrl.navigateForward('/quejasadm');
  }

  irAEventos() {
    this.navCtrl.navigateForward('/eventosadm');
  }

  irANoticias() {
    this.navCtrl.navigateForward('/noticiasadm');
  }

  irAReportarSituacion() {
    this.navCtrl.navigateForward('/reportesadm');
  }

  volverAlLogin() {
    this.navCtrl.navigateRoot('/login'); // Asegúrate de que la ruta '/login' sea la correcta
  }

  irAGestionUsuarios() {
    this.navCtrl.navigateForward('/usuariosadm'); // Asegúrate de que esta ruta es la correcta para el CRUD
  }

  irADocumentos() {
    this.navCtrl.navigateForward('/documentosadmfire');
  }

  irALocales() {
    this.navCtrl.navigateForward('/localesadm'); // Ajusta la ruta según corresponda
  }

  filtrarEventos() {
    const term = this.searchTerm.toLowerCase();

    if (!term.trim()) {
      // Si no hay ningún término de búsqueda, muestra todos los eventos
      this.eventos.subscribe(data => {
        this.eventosFiltrados = data;
      });
    } else {
      this.eventos.subscribe(data => {
        this.eventosFiltrados = data.filter(evento =>
          evento.nombreEvento.toLowerCase().includes(term) ||
          evento.descripcion.toLowerCase().includes(term) ||
          (evento.tipoEvento && evento.tipoEvento.toLowerCase().includes(term))
        );
      });
    }
  }
}
