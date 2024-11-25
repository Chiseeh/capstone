
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Reporte } from '../modelos/reporte';
import { NavController, AlertController } from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
})
export class ReportePage implements OnInit {
  nuevoReporte: Reporte = {
    id: '',
    direccion: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
    fecha: Timestamp.now(),
  };

  reportes: Reporte[] = [];

  public modalAbierto: boolean = false;
  public modalDetalleAbierto: boolean = false; // Modal para visualizar detalles
  public reporteSeleccionado: Reporte = {
    id: '',
    direccion: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
    fecha: Timestamp.now()
  }; // Para almacenar el reporte seleccionado
  selectedImage: File | null = null;

  categorias: string[] = [
    'Accidente',
    'Actitud Sospechosa',
    'Incendio',
    'Mascota',
    'Robo',
    'Ruidos Molestos',
    'Salud'
  ].sort();


  reportesActivos: number = 0; // Contador de reportes activos

  constructor(
    private apiService: ApiService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  resetFormulario() {
    this.nuevoReporte = {
      id: '',
      direccion: '',
      descripcion: '',
      categoria: '',
      imagenUrl: '',
      fecha: Timestamp.now()
    };
  }

  ngOnInit() {
    this.listarReportes();
  }

   // Método para enviar reporte urgente a la página de inicio
   enviarReporteUrgente(reporte: Reporte) {
    this.router.navigate(['/inicio'], {
      queryParams: {
        id: reporte.id,
        direccion: reporte.direccion,
        descripcion: reporte.descripcion,
        categoria: reporte.categoria,
        imagenUrl: reporte.imagenUrl,
        fecha: reporte.fecha.toDate().toISOString()
      }
    });
  }

  abrirFormulario() {
    this.modalAbierto = true;
  }

  cerrarFormulario() {
    this.modalAbierto = false;
  }

  contarReportesActivos() {
    this.reportesActivos = this.reportes.length; // Contar la cantidad total de reportes
  }

  cerrarDetalle() {
    this.modalDetalleAbierto = false; // Cerrar el modal de detalles
  }

  async mostrarAlertaCamposIncompletos() {
    const alert = await this.alertController.create({
      header: 'Campos incompletos',
      message: 'Por favor, rellene todos los campos obligatorios.',
      buttons: ['OK']
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

    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.nuevoReporte.imagenUrl = e.target?.result as string;
        this.nuevoReporte.id = Date.now().toString(); // Convierte el timestamp a string

        this.apiService.agregarReporte(this.nuevoReporte).subscribe(
          () => {
            this.resetFormulario(); // Resetea el formulario
            this.cerrarFormulario(); // Cierra el formulario
          },
          (error) => console.error('Error al registrar el reporte', error)
        );
      };
      reader.readAsDataURL(this.selectedImage);
    } else {
      this.nuevoReporte.id = Date.now().toString(); // Convierte el timestamp a string
      this.apiService.agregarReporte(this.nuevoReporte).subscribe(
        () => {
          this.resetFormulario(); // Resetea el formulario
          this.cerrarFormulario(); // Cierra el formulario
        },
        (error) => console.error('Error al registrar el reporte', error)
      );
    }
  }

  listarReportes() {
    this.apiService.listarReportes().subscribe(
      (datos) => {
        this.reportes = datos.map(reporte => ({
          ...reporte,
          fechaFormateada: reporte.fecha ? this.datePipe.transform(reporte.fecha.toDate(), 'dd/MM/yyyy') : 'Fecha no disponible' // Maneja caso donde fecha es null
        }));
        this.contarReportesActivos();
      },
      (error) => {
        console.error('Error al obtener la lista de reportes', error);
      }
    );
  }
  volverInicio() {
    this.navCtrl.navigateRoot('inicio');
  }

  volverAtras() {
    this.navCtrl.back();
  }

  // Método para manejar la visualización del detalle del reporte
  verDetalleReporte(reporte: Reporte) {
    this.reporteSeleccionado = reporte;
    this.modalDetalleAbierto = true; // Abrir el modal de detalle
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
        return '#28a745';
      case 'Ruidos Molestos':
        return 'purple';
      case 'Accidente':
      case 'Actitud Sospechosa':
      case 'Incendio':
      case 'Robo':
        return '#ad000d';
      default:
        return 'gray'; // Color por defecto
    }
  }
}
