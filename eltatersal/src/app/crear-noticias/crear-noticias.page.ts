import { Component, OnInit } from '@angular/core';
import { Noticias } from '../modelos/noticia';
import { ApiService } from '../servicios/api.service';
import { Router } from '@angular/router';

import { Timestamp } from 'firebase/firestore'; // Importar Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar Firebase Storage

@Component({
  selector: 'app-crear-noticias',
  templateUrl: './crear-noticias.page.html',
  styleUrls: ['./crear-noticias.page.scss'],
})
export class CrearNoticiasPage  {

  newNoticia: Noticias = {
    idNoticia: '',  // Deja el idNoticia vacío, ya que se generará automáticamente en Firebase
    titulo: "", // Asegúrate de que sea string
    descripcion: "", // Asegúrate de que sea string
    fecha: Timestamp.now(),
    video: "",
    imagen: ""
  };


  imagenBase64 = "";
  loadVideo = false;
  loadImagen = false
  constructor( private noticiaServicio: ApiService,
    private router: Router) { }

   // Método para crear una noticia
   crearNoticia() {
    this.newNoticia.fecha = Timestamp.now();
    this.noticiaServicio.agregarNoticia(this.newNoticia).subscribe(
      () => {
        console.log('Noticia agregada exitosamente');
        this.router.navigateByUrl("/noticia");
      },
      (error) => {
        console.error('Error al agregar la noticia:', error);
      }
    );
  }

  // Método para capturar el video seleccionado
  capturarVideo(evento: Event) {
    const videoNoticia = (evento.target as HTMLInputElement);
    if(videoNoticia.files) {
      const archivo = videoNoticia.files[0];
      const storage = getStorage();
      const videoRef = ref(storage, `videos/${archivo.name}`);  // Guardamos el archivo con su nombre original

       // Subir el archivo a Firebase Storage
       uploadBytes(videoRef, archivo).then((snapshot) => {
        console.log('Video subido con éxito:', snapshot);


      // Obtener la URL de descarga del video
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        this.newNoticia.video = downloadURL;  // Guardamos solo la URL en Firestore
        console.log('URL del video:', downloadURL);  // Verifica que la URL sea correcta
      });


    }).catch((error) => {
      console.error('Error al subir el video:', error);
    });

    }
  }


  // Método para capturar la imagen seleccionada
  capturarImagen(evento: Event) {
    const imagenNoticia = (evento.target as HTMLInputElement);
    if(imagenNoticia.files) {
      const archivo = imagenNoticia.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(archivo);

      reader.onload = () => {
        this.imagenBase64 = reader.result as string;
        this.newNoticia.imagen = this.imagenBase64;
        this.newNoticia.video = "";  // Limpiar el campo video
        console.log("Imagen lista: ", this.imagenBase64);
      };
    }


  }}
