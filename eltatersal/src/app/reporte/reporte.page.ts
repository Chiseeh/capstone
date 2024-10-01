// reporte.page.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Reporte } from '../modelos/reporte';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
})
export class ReportePage implements OnInit {
  nuevoReporte: Reporte = {
    id: 0,
    direccion: '',
    descripcion: '',
    categoria: ''
  };

  reportes: Reporte[] = [];
  public modalAbierto: boolean = false;

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
    private navCtrl: NavController,
    private alertController: AlertController // Añadir la dependencia de AlertController
  ) {}

  ngOnInit() {
    this.listarReportes();
  }

  abrirFormulario() {
    this.modalAbierto = true;
  }

  cerrarFormulario() {
    this.modalAbierto = false;
  }

  // Método para mostrar una alerta si hay campos vacíos
  async mostrarAlertaCamposIncompletos() {
    const alert = await this.alertController.create({
      header: 'Campos incompletos',
      message: 'Por favor, rellene todos los campos obligatorios.',
      buttons: ['OK']
    });
    await alert.present();
  }

  registrarReporte() {
    // Verificar si los campos están vacíos
    if (!this.nuevoReporte.direccion || !this.nuevoReporte.descripcion || !this.nuevoReporte.categoria) {
      // Mostrar alerta si falta algún campo
      this.mostrarAlertaCamposIncompletos();
      return; // Detener la ejecución si faltan campos
    }

    this.nuevoReporte.id = Date.now();
    this.apiService.agregarReporte(this.nuevoReporte).subscribe(
      () => {
        // Reiniciar el formulario después de agregar el reporte
        this.nuevoReporte = {
          id: 0,
          direccion: '',
          descripcion: '',
          categoria: '' // Limpiar las categorías
        };
        this.listarReportes(); // Actualizar la lista de reportes
        this.cerrarFormulario(); // Cerrar el formulario modal
      },
      (error) => {
        console.error('Error al registrar el reporte', error);
      }
    );
  }

  listarReportes() {
    this.apiService.listarReportes().subscribe(
      (datos) => {
        this.reportes = datos;
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

  // Métodos auxiliares para obtener íconos y colores según la categoría
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
