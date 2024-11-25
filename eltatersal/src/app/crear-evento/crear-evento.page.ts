import { Component, OnInit } from '@angular/core';
import { Evento } from '../modelos/eventos';
import { ApiService } from '../servicios/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-evento',
  templateUrl: './crear-evento.page.html',
  styleUrls: ['./crear-evento.page.scss'],
})
export class CrearEventoPage implements OnInit {

  newEvento: Evento = {
    id: "",
    nombreEvento: "",
    descripcion: "",
    tipoEvento: "Actividades Recreativas", // valor predeterminado
    horaInicio: new Date(),
    imagen: "",
    usuario: ""
  }
  imageBase64 = "";
  loadImage = false;
  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
  }

   // crear un evento nuevo
   crearEvento(){
    this.apiService.agregarEvento(this.newEvento).subscribe(
      () => {
        console.log("Evento agregado exitosamente a Firebase");
        this.router.navigateByUrl("/evento");
      },
      (error) => console.error("Error al crear el evento:", error)
    );
  }

  capturarImagen(evento: Event) {
    this.loadImage = true;
    //const imageProduct = this.imageProduct.nativeElement;

    const imageProduct = (evento.target as HTMLInputElement);
    imageProduct.files
    console.log("Aqui toma la foto", imageProduct.files?.item);
    if (imageProduct.files) {
      const archivo = imageProduct.files[0];
      console.log("Archivo: ", archivo);
      const src = URL.createObjectURL(imageProduct.files[0]);

      const reader = new FileReader();
      reader.readAsDataURL(archivo);

      reader.onload = () => {
        this.loadImage = false;
        this.imageBase64 = reader.result as string;
        this.newEvento.imagen = this.imageBase64;
      }
      console.log("Hola: ", this.imageBase64);
    }

  }
}
