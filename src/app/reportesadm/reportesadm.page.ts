// reportesadm.page.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Reporte } from '../modelos/reporte';
import { Location } from '@angular/common';
import { AlertController, NavController } from '@ionic/angular'; // Importar AlertController para alertas
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-reportesadm',
  templateUrl: './reportesadm.page.html',
  styleUrls: ['./reportesadm.page.scss'],
})
export class ReportesadmPage implements OnInit {
  nuevoReporte: Reporte = {
    id: '',
    direccion: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
    fecha: Timestamp.now(),
  };

  reportes: Reporte[] = [];
  reportesFiltrados: Reporte[] = []; // Variable para los reportes filtrados
  searchTerm: string = ''; // Término de búsqueda

  public modalAbierto: boolean = false;
  public modalDetalleAbierto: boolean = false;
  public reporteSeleccionado: Reporte = {
    id: '',
    direccion: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
    fecha: Timestamp.now(),
  };
  selectedImage: File | null = null;

  // Nuevas variables para edición
  isEditMode: boolean = false;
  reporteActualId: string | null = null; // Cambiado a string

  categorias: string[] = [
    'Accidente',
    'Actitud Sospechosa',
    'Incendio',
    'Mascota',
    'Robo',
    'Ruidos Molestos',
    'Salud'
  ].sort();

  constructor(
    private apiService: ApiService,
    private location: Location,
    private navCtrl: NavController,
    private alertController: AlertController // Inyectar AlertController
  ) {}

  ngOnInit() {
    this.listarReportes();
  }

  abrirFormulario() {
    this.modalAbierto = true;
  }

  cerrarFormulario() {
    this.modalAbierto = false;
    this.resetFormulario();
  }

  cerrarDetalle() {
    this.modalDetalleAbierto = false;
  }

  async mostrarAlertaCamposIncompletos() {
    const alert = await this.alertController.create({
      header: 'Campos Incompletos',
      message: 'Por favor, rellene todos los campos obligatorios.',
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  async mostrarAlertaConfirmacion(mensaje: string, handler: () => void) {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: mensaje,
      buttons: [
        {
          text: 'Sí',
          handler: handler
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  registrarReporte() {
    if (!this.nuevoReporte.direccion || !this.nuevoReporte.descripcion || !this.nuevoReporte.categoria) {
        this.mostrarAlertaCamposIncompletos();
        return;
    }

    this.nuevoReporte.id = this.isEditMode && this.reporteActualId !== null ? this.reporteActualId : this.apiService.createId();

    if (this.selectedImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.nuevoReporte.imagenUrl = e.target?.result as string;
            this.guardarReporte();
        };
        reader.readAsDataURL(this.selectedImage);
    } else {
        this.guardarReporte();
    }
}

private guardarReporte() {
    if (this.isEditMode && this.reporteActualId !== null) {
        this.apiService.actualizarReporteFirebase(this.nuevoReporte).subscribe(
            () => {
                this.resetFormulario();
            },
            (error) => {
                console.error('Error al actualizar el reporte', error);
            }
        );
    } else {
        this.apiService.agregarReporteFirebase(this.nuevoReporte).subscribe(
            () => {
                this.resetFormulario();
            },
            (error) => {
                console.error('Error al registrar el reporte', error);
            }
        );
    }
}



  private resetFormulario() {
    this.nuevoReporte = {
      id: '',
      direccion: '',
      descripcion: '',
      categoria: '',
      imagenUrl: '',
      fecha: Timestamp.now(),
    };
    this.selectedImage = null;
    this.isEditMode = false;
    this.reporteActualId = null;
    this.listarReportes();
  }

  listarReportes() {
    this.apiService.listarReportesFirebase().subscribe(
      (datos: Reporte[]) => {
        this.reportes = datos;
        this.reportesFiltrados = [...this.reportes]; // Al inicio, muestra todos los reportes
      },
      (error) => {
        console.error('Error al obtener la lista de reportes', error);
      }
    );
  }

  filtrarReportes() {
    const term = this.searchTerm.toLowerCase();

    if (!term.trim()) {
      // Si no hay ningún término de búsqueda, muestra todos los reportes
      this.reportesFiltrados = [...this.reportes];
    } else {
      this.reportesFiltrados = this.reportes.filter(reporte =>
        reporte.direccion.toLowerCase().includes(term) ||
        reporte.descripcion.toLowerCase().includes(term) ||
        (reporte.categoria && reporte.categoria.toLowerCase().includes(term))
      );
    }
  }

  volverAtras() {
    this.location.back(); // Usa Location para volver atrás
  }

  verDetalleReporte(reporte: Reporte) {
    this.reporteSeleccionado = reporte;
    this.modalDetalleAbierto = true;
  }

  getIconForCategory(categoria: string): string {
    switch (categoria) {
      case 'Accidente':
        return 'car-crash';
      case 'Actitud Sospechosa':
        return 'eye';
      case 'Incendio':
        return 'flame';
      case 'Mascota':
        return 'paw';
      case 'Robo':
        return 'lock-closed';
      case 'Ruidos Molestos':
        return 'volume-high';
      case 'Salud':
        return 'medkit';
      default:
        return 'clipboard';
    }
  }

  getColorForCategory(categoria: string): string {
    switch (categoria) {
      case 'Mascota':
      case 'Salud':
        return '#6FCF97'; // Verde suave
      case 'Ruidos Molestos':
        return '#C39BD3'; // Morado suave
      case 'Accidente':
      case 'Actitud Sospechosa':
      case 'Incendio':
      case 'Robo':
        return '#E57373'; // Rojo suave
      default:
        return '#B0B0B0'; // Gris suave (color por defecto)
    }
  }

  // Nuevo: Función para editar un reporte
  editarReporte(reporte: Reporte) {
    this.isEditMode = true;
    this.reporteActualId = reporte.id;
    this.nuevoReporte = { ...reporte };
    this.modalAbierto = true;
  }

  // Nuevo: Función para eliminar un reporte
  async eliminarReporte(reporte: Reporte) {
    await this.mostrarAlertaConfirmacion(
      `¿Desea eliminar el reporte de ${reporte.direccion}?`,
      () => {
        this.apiService.eliminarReporteFirebase(reporte.id).subscribe(
          () => {
            this.listarReportes();
          },
          (error) => {
            console.error('Error al eliminar el reporte', error);
          }
        );
      }
    );
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
