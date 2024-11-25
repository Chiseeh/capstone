import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Asegúrate de importar AngularFirestore
import { Noticias } from '../modelos/noticia';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-noticiasadm',
  templateUrl: './noticiasadm.page.html',
  styleUrls: ['./noticiasadm.page.scss'],
})
export class NoticiasAdmPage implements OnInit {
  noticias: Noticias[] = [];
  newNoticia: Noticias = {
    id: '',
    titulo: "",
    descripcion: "",
    fecha: new Date(),
    video: "",
    imagen: ""
  };

  noticiaEditando: Noticias | null = null;
  imagenBase64: string = "";
  videoBase64: string = "";
  mostrarFormulario: boolean = false;
  noticiasFiltradas: Noticias[] = []; // Para almacenar las noticias filtradas
  searchTerm: string = ''; // Para el término de búsqueda

  constructor(
    private navCtrl: NavController,
    private loadingControl: LoadingController,
    private alertController: AlertController,
    private firestore: AngularFirestore // Cambiado a AngularFirestore
  ) {}

  ngOnInit() {
    this.loadNoticias();
  }

  // Cargar las noticias desde Firestore
  loadNoticias() {
    this.firestore.collection<Noticias>('noticias').valueChanges({ idField: 'id' }).subscribe((noticias) => {
      this.noticias = noticias;
    });
  }

  capturarImagen(evento: Event) {
    const imagenNoticia = (evento.target as HTMLInputElement);
    if (imagenNoticia.files) {
      const archivo = imagenNoticia.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(archivo);

      reader.onload = () => {
        this.imagenBase64 = reader.result as string;
        this.newNoticia.imagen = this.imagenBase64;
        this.newNoticia.video = "";  // Limpiar el campo de video si se sube una imagen
      };
    }
  }

  capturarVideo(evento: Event) {
    const videoNoticia = (evento.target as HTMLInputElement);
    if (videoNoticia.files) {
      const archivo = videoNoticia.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(archivo);

      reader.onload = () => {
        this.videoBase64 = reader.result as string;
        this.newNoticia.video = this.videoBase64;
        this.newNoticia.imagen = "";  // Limpiar el campo de imagen si se sube un video
      };
    }
  }

  async crearNoticia() {
    this.newNoticia.fecha = new Date();  // Actualizamos la fecha de la noticia

    if (this.noticiaEditando) {
      // Si estamos editando, actualizamos la noticia
      const noticiaDocRef = this.firestore.collection('noticias').doc(this.noticiaEditando.id);
      await noticiaDocRef.update({ ...this.newNoticia });
    } else {
      // Si estamos creando una nueva noticia
      await this.firestore.collection('noticias').add({ ...this.newNoticia });
    }

    this.loadNoticias();
    this.limpiarFormulario();
  }

  editarNoticia(noticia: Noticias) {
    this.noticiaEditando = noticia;  // Guardamos la noticia a editar
    this.newNoticia = { ...noticia };  // Cargamos la noticia en el formulario
    this.mostrarFormulario = true;  // Mostrar el formulario al editar
  }

  async eliminarNoticia(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Está seguro de que desea eliminar esta noticia?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.firestore.collection('noticias').doc(id).delete();
            this.loadNoticias();
          }
        }
      ]
    });

    await alert.present();
  }

  limpiarFormulario() {
    this.newNoticia = { id: '', titulo: "", descripcion: "", fecha: new Date(), imagen: "", video: "" };  // Limpiar el formulario
    this.noticiaEditando = null;  // Reiniciar la noticia que se está editando
    this.mostrarFormulario = false;  // Ocultar el formulario
  }

  volverAlMenuPrincipal() {
    this.navCtrl.navigateForward(['/inicio']);  // Cambia '/inicio' a la ruta correcta para tu página de menú principal
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;  // Alternar la visibilidad del formulario
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

      // Filtrar noticias
    filtrarNoticias() {
      const term = this.searchTerm.toLowerCase();

      if (!term.trim()) {
        // Si no hay término de búsqueda, mostrar todas las noticias
        this.noticiasFiltradas = this.noticias;
      } else {
        this.noticiasFiltradas = this.noticias.filter(noticia =>
          noticia.titulo.toLowerCase().includes(term) ||
          noticia.descripcion.toLowerCase().includes(term)
        );
      }
    }
}
