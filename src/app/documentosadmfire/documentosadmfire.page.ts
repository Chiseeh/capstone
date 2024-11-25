import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Solicitud } from '../modelos/solicitud';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-documentosadmfire',
  templateUrl: './documentosadmfire.page.html',
  styleUrls: ['./documentosadmfire.page.scss'],
})
export class DocumentosadmfirePage implements OnInit {
  solicitudes: Solicitud[] = []; // Almacenar las solicitudes

  constructor(private apiService: ApiService,
    private storage: AngularFireStorage,
    private navCtrl: NavController) { }

    ngOnInit() {
      // Obtener todas las solicitudes
      this.apiService.obtenerSolicitudes().subscribe((solicitudes) => {
        solicitudes.forEach((solicitud) => {
          this.apiService.obtenerUsuarioPorId(solicitud.userId).subscribe((usuario) => {
            solicitud.usuario = usuario; // Aquí no debería haber error
          });
        });
        this.solicitudes = solicitudes.map((solicitud) => ({
          ...solicitud,
          archivoSeleccionado: false, // Inicializar estado de archivo seleccionado
          archivo: null // Inicializar el archivo
        }));
      });
    }


    // Método para manejar la selección de archivo
    onFileSelected(event: any, solicitud: Solicitud) {
      const archivo = event.target.files[0];
      if (archivo) {
        solicitud.archivo = archivo; // Almacenar el archivo seleccionado
        solicitud.archivoSeleccionado = true; // Marcar que se seleccionó un archivo
      } else {
        solicitud.archivoSeleccionado = false; // Reiniciar si no hay archivo
      }
    }

// Método para aceptar una solicitud y subir el documento
aceptarSolicitud(solicitud: Solicitud, archivo: File | null | undefined) {
  if (archivo) {
    const filePath = `documentos/${archivo.name}`;
    const fileRef = this.storage.ref(filePath);

    // Subir el documento a Firebase Storage
    this.storage.upload(filePath, archivo).then(() => {
      fileRef.getDownloadURL().subscribe((url) => {
        // Actualizar la solicitud en Firestore
        this.apiService.actualizarSolicitud(solicitud.id!, {
          aceptada: true,
          documentoId: url, // Guardar la URL del documento
          documentoSubido: true, // Marcar el documento como subido
        });
        // Deshabilitar el botón y cambiar el estado
        solicitud.documentoSubido = true;
        solicitud.archivoSeleccionado = false; // Reiniciar estado
        solicitud.archivo = null; // Reiniciar archivo
      });
    });
  }
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
