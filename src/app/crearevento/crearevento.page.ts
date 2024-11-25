import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../servicios/api.service'; // Asegúrate de importar tu servicio

@Component({
  selector: 'app-crearevento',
  templateUrl: './crearevento.page.html',
  styleUrls: ['./crearevento.page.scss'],
})
export class CreareventoPage implements OnInit {

  @ViewChild('imageProduct') public imageProduct!: ElementRef;
  newEvento: any = {
    nombreEvento: "",
    descripcion: "",
    tipoEvento: "Actividades Recreativas",
    horaInicio: new Date(),
    imagen: "",
    usuario: 0
  };

  imageBase64 = "";
  loadImage = false;

  constructor(
    private apiService: ApiService, // Cambiado a tu ApiService
    private router: Router
  ) { }

  ngOnInit() {}

  capturarImagen(evento: Event) {
    this.loadImage = true;
    const imageProduct = (evento.target as HTMLInputElement);
    if (imageProduct.files) {
      const archivo = imageProduct.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(archivo);

      reader.onload = () => {
        this.loadImage = false;
        this.imageBase64 = reader.result as string;
        this.newEvento.imagen = this.imageBase64;
      };
    }
  }

  crearEvento() {
    this.apiService.createEvento(this.newEvento).subscribe({
      next: () => {
        this.resetFormulario();
        this.router.navigateByUrl("/eventosadm");
      },
      error: (err) => {
        console.error("Error al registrar el evento: ", err);
      }
    });
  }

  private resetFormulario() {
    this.newEvento = {
      nombreEvento: "",
      descripcion: "",
      tipoEvento: "Actividades Recreativas",
      horaInicio: new Date(),
      imagen: "",
      usuario: 0
    };
  }
}
