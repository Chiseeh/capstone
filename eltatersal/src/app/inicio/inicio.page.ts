  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { ToastController } from '@ionic/angular';
  import { ApiService } from '../servicios/api.service';
  import { AngularFirestore } from '@angular/fire/compat/firestore'; // Importa Firestore
  import { Usuario,UsuarioConID } from '../modelos/usuario';
  import { getAuth } from 'firebase/auth';
  import { AngularFireAuth } from '@angular/fire/compat/auth';
  import { ModalController } from '@ionic/angular';
  import { AlertaModalComponent } from '../alerta-modal/alerta-modal.component';
  import { Local, LocalConID } from '../modelos/local';


  @Component({
    selector: 'app-inicio',
    templateUrl: './inicio.page.html',
    styleUrls: ['./inicio.page.scss'],
  })
  export class InicioPage implements OnInit {
    nombreBoton: string = '';
    ufData: any;
    weatherData: any;
    isModalOpen: boolean = false; // Nueva variable para controlar el estado del modal
    isAlertOpen: boolean = false; // Estado de la alerta
    isAlertButtonDisabled: boolean = false; // Controla el estado del botón de alerta
    mostrarMensajeReposo: boolean = false; // Variable para mostrar el mensaje de reposo
    farmacias: any[] = [];
    locales: any[] = []; // Arreglo para almacenar los locales
    local: LocalConID | null = null;
    usuarioTieneLocal: boolean = false;
    usuario: UsuarioConID | undefined;
    public modalAbierto: boolean = false;
    public modalDetalleAbierto: boolean = false; // Modal para visualizar detalles¿

    alertaReciente: any; // Agrega esta línea
    currentSlideIndex = 0; // Índice de la imagen actual
    images = [
     '/assets/images/fotostate/tate.PNG',
     '/assets/images/fotostate/entrada.jpg',
     '/assets/images/fotostate/sadi.jpg',
  ];
    constructor(private router: Router,private toastController: ToastController,
       private apiService: ApiService,private firestore: AngularFirestore,
       private afAuth: AngularFireAuth,private modalController: ModalController ) {

       }

       ngOnInit() {

        this.obtenerLocal();
        this.cargarLocales();

        // Obtiene datos de la API de UF
        this.apiService.getUF().subscribe(
          (data) => {
            this.ufData = data;
            console.log(this.ufData);
          },
          (error) => {
            console.error('Error al consumir la API', error);
          }
        );

        // Obtiene datos del clima
        this.apiService.getCurrentWeather().subscribe(
          (data) => {
            this.weatherData = {
              location: data.location.name,
              currentTemp: data.current.temp_c,
              maxTemp: data.current.temp_c,
              minTemp: data.current.temp_c
            };
            console.log(this.weatherData);
          },
          (error) => {
            console.error('Error al consumir la API', error);
          }
        );

        // Obtiene datos de farmacias
        this.apiService.getLocalesTurnos().subscribe(
          (data) => {
            this.farmacias = data;
            console.log(this.farmacias);
          },
          (error) => {
            console.error('Error al consumir la API', error);
          }
        );

    // Obtiene el ID del usuario autenticado
  this.afAuth.authState.subscribe(user => {
    if (user) {
      // Si hay un usuario autenticado, busca su información en Firestore
      this.firestore.collection<Usuario>('usuarios').doc(user.uid).valueChanges().subscribe((usuarioData) => {
        if (usuarioData) {
          this.usuario = {
            id: user.uid, // Usa el ID del usuario autenticado
            ...usuarioData // Combina el objeto de usuario con el ID
          } as UsuarioConID;
        } else {
          console.error('No se encontró el usuario en Firestore');
        }
      });
    } else {
      console.error('No hay usuario autenticado');
    }
  });

   // Escucha los cambios en la colección de alertas de Firebase
   this.firestore.collection('alertas').stateChanges(['added']).subscribe((changes) => {
    changes.forEach(async (change) => {
      if (change.type === 'added') {
        const alerta = change.payload.doc.data();
        await this.abrirModalParaTodos(alerta); // Muestra el modal a todos los usuarios
      }
    });
  });
}



   // Declarar la variable para controlar el estado de reposo
private enReposo: boolean = false;

// Método para enviar la alerta
async enviarAlerta() {
  if (!this.usuario || !this.usuario.nombre || !this.usuario.apellido || !this.usuario.direccion) {
    console.error('No hay usuario disponible para enviar la alerta');
    return;
  }

  // Verificar si el botón está en reposo
  if (this.enReposo) {
    this.mostrarMensajeReposo = true; // Muestra el mensaje en la página
    console.warn('El botón de alerta está en reposo. Por favor espera un minuto antes de intentar nuevamente.');
    return;
  }

  try {
    // Envía la alerta a Firebase Firestore
    const docRef = await this.firestore.collection('alertas').add({
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      direccion: this.usuario.direccion,
      timestamp: new Date(),
    });
    console.log('Alerta enviada con éxito', docRef.id);

    // Almacena la alerta reciente
    this.alertaReciente = {
      id: docRef.id,
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      direccion: this.usuario.direccion,
      timestamp: new Date(),
    };

    // Llama a mostrarAlerta después de enviar
    await this.mostrarAlerta();

    // Activar el estado de reposo
    this.enReposo = true;

    // Desactivar el estado de reposo después de 1 minuto (60000 ms)
    setTimeout(() => {
      this.enReposo = false;
      this.mostrarMensajeReposo = false; // Oculta el mensaje al finalizar el tiempo
    }, 60000);
  } catch (error) {
    console.error('Error al enviar alerta:', error);
  }
}

async abrirModalParaTodos(alerta: any) {
  if (!this.isModalOpen && this.usuario) {
    this.isModalOpen = true;

    const modal = await this.modalController.create({
      component: AlertaModalComponent,
      componentProps: {
        mensaje: [
          `Alerta de:`,
          `${alerta.nombre}`,
          `${alerta.apellido}`,
          `Dirección:`,
          `${alerta.direccion}`
        ]
      },
      cssClass: 'small-modal',
    });

    modal.onDidDismiss().then(() => {
      this.isModalOpen = false;
      this.alertaReciente = null;
    });

    await modal.present();
  } else {
    console.error('Datos del usuario no disponibles para mostrar la alerta');
  }
}


  async mostrarAlerta() {
    if (!this.isModalOpen && this.usuario) {
      this.isModalOpen = true; // Marca el modal como abierto

      const modal = await this.modalController.create({
        component: AlertaModalComponent,
        componentProps: {
          mensaje: [
            `Alerta de:`,
            `${this.usuario.nombre}`,
            `${this.usuario.apellido}`,
            `Dirección:`,
            `${this.usuario.direccion}`
          ]
        },
        cssClass: 'small-modal', // Clase CSS personalizada para ajustar el tamaño
      });

      modal.onDidDismiss().then(() => {
        this.isModalOpen = false; // Marca el modal como cerrado
        this.alertaReciente = null; // Limpia la alerta reciente al cerrar
      });

      await modal.present();
    } else {
      console.error('Datos del usuario no disponibles para mostrar la alerta');
    }
  }

  cerrarAlerta() {
    this.isModalOpen = false; // Lógica para cerrar el modal
    this.alertaReciente = null; // Limpia la alerta reciente
  }

  // Otros métodos que necesites...


    irAEstadisticas() {
      window.open('http://localhost:8101', '_blank');  // Abre la página de estadísticas en una nueva pestaña
    }

    buscarBoton() {
      const valorBuscado = this.nombreBoton.toLowerCase(); // Obtiene el valor de búsqueda
      const botones: { [key: string]: string } = {
        'queja': 'quejas',
        'eventos': 'eventos',
        'reportar': 'reporte',
        'noticias': 'noticias',
        'documentos': 'documentos'
      }; // Mapa de nombres a IDs de botones

      // Verifica si el valor buscado coincide con algún botón
      const id = botones[valorBuscado];
      if (id) {
        this.scrollToBoton(id); // Llama a scrollToBoton
      } else {
        console.log('Botón no encontrado'); // O cualquier otra acción
      }
    }

    scrollToBoton(id: string) {
      const elemento = document.getElementById(id); // Obtiene el elemento por ID
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Hace scroll hacia el botón
      }
    }


    async cerrarSesion() {
      // Elimina todos los datos del localStorage
      localStorage.clear();

      // Muestra un toast notificando que la sesión se ha cerrado
      const toast = await this.toastController.create({
        message: 'Sesión cerrada correctamente.',
        duration: 2000, // Duración del toast en milisegundos
        color: 'success' // Puedes ajustar el color según tu preferencia
      });
      toast.present();

      // Redirige al usuario a la página de inicio de sesión o a otra página
      this.router.navigate(['/login']); // Asegúrate de que la ruta '/login' sea la correcta
    }
    moveSlide(direction: number) {
      this.currentSlideIndex += direction;

      if (this.currentSlideIndex < 0) {
        this.currentSlideIndex = this.images.length - 1; // Regresa al último slide
      } else if (this.currentSlideIndex >= this.images.length) {
        this.currentSlideIndex = 0; // Regresa al primer slide
      }

      const slideWidth = document.querySelector('.carrusel-image')?.clientWidth || 0;
      const offset = -this.currentSlideIndex * slideWidth;
      document.querySelector('.carrusel-images')!.setAttribute('style', `transform: translateX(${offset}px);`);
    }

      // Método para cargar los locales
  cargarLocales() {
    this.apiService.listarLocalesFirebase().subscribe(
      (data) => {
        this.locales = data;
      },
      (error) => {
        console.error('Error al cargar los locales:', error);
      }
    );
  }

  toggleHayPan(local: LocalConID): void {
    local.hayPan = !local.hayPan;
    this.apiService.actualizarLocal(local.id, { hayPan: local.hayPan }).subscribe(
      () => {
        console.log('Local actualizado exitosamente');
      },
      (error) => {
        console.error('Error al actualizar el local:', error);
      }
    );
  }

  private async obtenerLocal() {
    const user = getAuth().currentUser;

    if (user) {
      const localId = user.uid;

      // Obtén los datos del local
      const localData = await this.apiService.getLocal(localId).toPromise();

      if (localData) {
        this.local = {
          id: localId,
          ...localData,
        } as LocalConID;
        this.usuarioTieneLocal = true;
      } else {
        console.error('No se encontró el local asociado al usuario');
      }
    } else {
      console.error('No hay usuario autenticado');
    }
  }

}
