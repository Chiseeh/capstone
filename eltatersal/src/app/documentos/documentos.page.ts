import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service';
import { Solicitud } from '../modelos/solicitud';
import { UsuarioConID } from '../modelos/usuario';

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.page.html',
  styleUrls: ['./documentos.page.scss'],
})
export class DocumentosPage implements OnInit {
  toastOpen = false;
  isButtonDisabled = false; // Variable para controlar el estado del botón
  solicitudes: Solicitud[] = []; // Array para almacenar las solicitudes
  usuarioActual: UsuarioConID | null = null; // Usuario autenticado

  constructor(
    private toastController: ToastController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.apiService.ObtenerUsuarioActual().subscribe(
      (usuario) => {
        this.usuarioActual = usuario; // Asigna el valor a usuarioActual
      },
      (error) => {
        console.error('Error al obtener el usuario actual', error);
      }
    );
  }


  async verificarSolicitud() {
    const usuarioId = this.apiService.ObtenerIdUsuario(); // Obtener ID del usuario actual

    this.apiService.listarSolicitudes().subscribe(
      (solicitudes) => {
        this.solicitudes = solicitudes; // Almacenar las solicitudes
        // Verificar si ya hay una solicitud para este usuario
        this.isButtonDisabled = solicitudes.some(
          (solicitud) =>
            solicitud.userId === usuarioId &&
            solicitud.documentType === 'Certificado de Residencia'
        );
      },
      (error) => {
        console.error('Error al listar solicitudes', error);
      }
    );
  }

  solicitarDocumento() {
    if (!this.usuarioActual) {
      console.error('No se encontró un usuario autenticado.');
      return;
    }

    // Deshabilitar el botón al hacer clic
    this.isButtonDisabled = true;

    this.apiService.solicitarDocumentos(this.usuarioActual)
      .then(async () => {
        this.toastOpen = true;

        const toast = await this.toastController.create({
          message: 'Solicitud enviada con éxito.',
          duration: 2000,
          position: 'bottom',
        });
        await toast.present();

        // Actualizar el estado de las solicitudes
        this.verificarSolicitud();
      })
      .catch(async (error) => {
        const toast = await this.toastController.create({
          message: 'Error al enviar la solicitud.',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();
        this.isButtonDisabled = false; // Habilitar nuevamente si hay error
      });
  }

  // Método para descargar el documento
  descargarDocumento(solicitud: Solicitud) {
    if (!solicitud.documentoId) {
      this.toastController
        .create({
          message: 'No hay documento disponible para descargar.',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
        })
        .then((toast) => toast.present());
      return;
    }

    const documentoUrl = `https://tuservidor.com/documentos/${solicitud.documentoId}`; // Asegúrate de tener la URL correcta del documento
    window.open(documentoUrl, '_blank');
  }
}
