import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Queja, QuejaConID } from '../modelos/quejas';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { Usuario } from '../modelos/usuario';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-quejasadm',
  templateUrl: './quejasadm.page.html',
  styleUrls: ['./quejasadm.page.scss'],
})
export class QuejasadmPage implements OnInit {
  quejas: QuejaConID[] = [];
  quejasEnProceso: number = 0;
  quejasResueltas: number = 0;
  isLoading = false;
  searchTerm: string = '';
  quejasFiltradas: QuejaConID[] = [];

  quejaSeleccionada: QuejaConID | null = null;
  modalDetalleAbierto: boolean = false;
  respuestaAdmin: string = '';

  constructor(
    private apiService: ApiService,
    private loadingController: LoadingController,
    private navCtrl: NavController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.modalDetalleAbierto = false;
    this.cargarQuejas();
  }

  async cargarQuejas() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando quejas...',
    });
    await loading.present();

    this.apiService.listarQuejasFirebase().subscribe(
      async (data: QuejaConID[]) => {
        this.quejas = data;

        await Promise.all(
          this.quejas.map(async (queja) => {
            const usuario = await this.apiService.obtenerUsuarioPorIDFirebase(queja.idUsuario).toPromise();
            queja.nombreUsuario = usuario || {
              id: '',
              rut: '',
              correo: '',
              clave: '',
              nombre: '',
              apellido: '',
              quejas: []
            };
          })
        );

        this.contarQuejasPorEstado();
        this.quejasFiltradas = this.quejas;
        this.isLoading = false;
        loading.dismiss();
      },
      (error: any) => {
        console.error('Error al cargar quejas', error);
        this.isLoading = false;
        loading.dismiss();
      }
    );
  }

  contarQuejasPorEstado() {
    this.quejasEnProceso = this.quejas.filter(queja => queja.estado === 'en proceso').length;
    this.quejasResueltas = this.quejas.filter(queja => queja.estado === 'resuelto').length;
  }

  getFormattedDate(timestamp: any): string {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();  // Devuelve la fecha en un formato legible
  }

  getIconForCategory(categoria: string): string {
    switch (categoria) {
      case 'seguridad':
        return 'alert-circle';
        case 'evento deportivo':
          return 'football';
      case 'infraestructura':
        return 'warning';
      default:
        return 'help-circle';
    }
  }

  getColorForCategory(categoria: string): string {
    switch (categoria) {
      case 'seguridad':
        return '#dc3545'; // Rojo oscuro para seguridad
      case 'evento deportivo':
        return '#28a745'; // Verde fuerte para eventos deportivos
      case 'infraestructura':
        return '#ffc107'; // Amarillo oscuro para infraestructura
      default:
        return '#6c757d'; // Gris oscuro para otras categorías
    }
  }


  volverAtras() {
    this.navCtrl.navigateRoot('inicio');
  }

  filtrarQuejas() {
    const term = this.searchTerm.toLowerCase();
    this.quejasFiltradas = this.quejas.filter(queja =>
      queja.titulo.toLowerCase().includes(term) ||
      queja.descripcion.toLowerCase().includes(term) ||
      (queja.nombreUsuario && `${queja.nombreUsuario.nombre} ${queja.nombreUsuario.apellido}`.toLowerCase().includes(term))
    );
  }

  filtrarPorEstado(estado: string) {
    this.quejasFiltradas = this.quejas.filter(queja => queja.estado === estado);
  }

  quitarFiltro() {
    this.searchTerm = '';
    this.quejasFiltradas = this.quejas;
  }

  verDetalleQueja(queja: QuejaConID) {
    this.quejaSeleccionada = queja;
    this.modalDetalleAbierto = true;
    this.respuestaAdmin = '';
  }

  cerrarDetalleQueja() {
    this.quejaSeleccionada = null;
    this.modalDetalleAbierto = false;
  }

  cerrarCaso() {
    if (this.quejaSeleccionada) {
      this.quejaSeleccionada.respuesta = this.respuestaAdmin;
      this.quejaSeleccionada.estado = 'resuelto';

      this.apiService.actualizarQuejaFirebase(this.quejaSeleccionada).subscribe(
        () => {
          console.log('Queja actualizada exitosamente');
          this.cerrarDetalleQueja();
          this.cargarQuejas();
        },
        (error: any) => {
          console.error('Error al actualizar la queja', error);
        }
      );
    }
  }

  async eliminarQueja(quejaId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta queja?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.eliminarQuejaFirebase(quejaId).subscribe(
              () => {
                this.quejas = this.quejas.filter(q => q.id !== quejaId);
                this.quejasFiltradas = this.quejasFiltradas.filter(q => q.id !== quejaId);
              },
              (error: any) => {
                console.error('Error eliminando queja:', error);
              }
            );
          },
        },
      ],
    });

    await alert.present();
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

}
