import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { InfiniteScrollCustomEvent, LoadingController, ToastController } from '@ionic/angular';
import { Evento } from '../modelos/eventos';
import { NavController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
})
export class EventoPage {
  eventos: Evento[] = [];
  imagenSeleccionada: File | null = null; // Declaramos la variable imagenSeleccionada

  confirmarUsuario: string[] = [];
  eventoId!: string;

  constructor(
    private apiService: ApiService,
    private navCtrl: NavController,
    private loadingControl: LoadingController,
    private alertController: AlertController,
    private toasController: ToastController,
    private afAuth: AngularFireAuth
  ) { }

  ionViewWillEnter(){
    this.loadEventos();
  }

  volverAtras() {
    this.navCtrl.back();
  }
    // Define la función que será llamada cuando se seleccione un archivo (imagen)
    onFileSelected(event: any) {
      const file: File = event.target.files[0]; // Obtener el primer archivo seleccionado
      if (file) {
        this.imagenSeleccionada = file; // Guardar el archivo en la variable imagenSeleccionada
        console.log('Imagen seleccionada:', file);
        // Aquí puedes hacer algo adicional, como mostrar una vista previa o cargar el archivo
      }
    }


  // Cargar eventos desde Firebase
  async loadEventos(event?: InfiniteScrollCustomEvent) {
    const loading = await this.loadingControl.create({
        message: 'Cargando...',
        spinner: 'bubbles'
    });
    await loading.present();

    this.apiService.listarEventos().subscribe(
        (eventos) => {
            // Asegúrate de inicializar asistentes
            this.eventos = eventos.map(evento => ({
                ...evento,
                asistentes: evento.asistentes || [] // Inicializa a un arreglo vacío si no está definido
            }));
            loading.dismiss();
            event?.target.complete();
        },
        (err) => {
            console.error("Error cargando eventos:", err);
            loading.dismiss();
        }
    );
}


  async ObtenerIdUsuario(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(null); // O podrías rechazar la promesa
        }
      });
    });
  }

  async confirmarAsistencia(id: string) {
    const evento = this.eventos.find(ev => ev.id === id);

    // Verifica si el evento fue encontrado
    if (!evento) {
        const toast = await this.toasController.create({
            message: 'Evento no encontrado',
            duration: 2000,
        });
        await toast.present();
        return; // Sale de la función si el evento no existe
    }

    // Asegúrate de que la propiedad asistentes esté inicializada
    evento.asistentes = evento.asistentes || []; // Inicializar si es undefined

    // Obtener información del usuario actual
    this.apiService.ObtenerUsuarioActual().subscribe(async (usuario) => {
        if (!usuario) {
            const toast = await this.toasController.create({
                message: 'Error: No se pudo obtener la información del usuario.',
                duration: 2000,
            });
            await toast.present();
            return;
        }

        const usuarioId = usuario.id;

        // Verificamos si el usuario ya ha confirmado asistencia
        // Verifica si 'asistentes' está definido y es un arreglo
        if (Array.isArray(evento.asistentes) && evento.asistentes.includes(usuarioId)) {
            const toast = await this.toasController.create({
                message: 'Ya has confirmado tu asistencia a este evento.',
                duration: 2000,
            });
            await toast.present();
            return; // Sale de la función si el usuario ya ha confirmado en el evento
        }

        const alert = await this.alertController.create({
            header: 'Confirmar Asistencia',
            message: '¿Desea asistir a este evento?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                },
                {
                    text: 'Aceptar',
                    handler: () => {
                        this.loadConfirmaUsuarios(id, usuarioId);
                    },
                },
            ],
        });

        await alert.present();
    });
}



  // Cargar confirmación de usuarios
  async loadConfirmaUsuarios(eventoId: string, usuarioId: string) {
    // Confirmar asistencia usando la API
    this.apiService.confirmarAsistencia(eventoId, usuarioId).subscribe(
      async () => {
        // Actualiza localmente el evento
        const evento = this.eventos.find(ev => ev.id === eventoId);
        if (evento) {
          evento.asistentesCount = (evento.asistentesCount || 0) + 1; // Incrementar el conteo localmente
          evento.asistentes = evento.asistentes || []; // Inicializar si es undefined
          evento.asistentes.push(usuarioId); // Agregar el ID del usuario a la lista de asistentes
        }

        // Mostrar un mensaje de éxito
        const toast = await this.toasController.create({
          message: 'Su asistencia ha sido confirmada',
          duration: 2000,
        });
        await toast.present();
        this.loadEventos(); // Recargar eventos para mostrar actualizaciones
      },
      async (error) => {
        console.error("Error al confirmar la asistencia al evento: ", error);
        const toast = await this.toasController.create({
          message: 'No se pudo confirmar la asistencia. Inténtelo de nuevo.',
          duration: 2000,
        });
        toast.present();
      }
    );
  }
}

