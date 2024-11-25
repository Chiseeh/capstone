import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service'; // Asegúrate de importar tu servicio

@Component({
  selector: 'app-detaileventosadm',
  templateUrl: './detaileventosadm.page.html',
  styleUrls: ['./detaileventosadm.page.scss'],
})
export class DetaileventosadmPage implements OnInit {

  @ViewChild('imageProduct') public imageProduct!: ElementRef;
  evento: any = {
    id: '',
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
    private route: ActivatedRoute,
    private router: Router,
    private toasController: ToastController
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvento(id);
    }
  }

  loadEvento(id: string) {
    this.apiService.getEventoByIDFirebase(id).subscribe(data => {
      this.evento = data;
    }, error => {
      console.error('Error al cargar el evento', error);
    });
  }

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
        this.evento.imagen = this.imageBase64;
      };
    }
  }

  saveChanges() {
    const id = this.evento.id;
    this.apiService.actualizarEventoFirebase(id, this.evento).then(async () => {
      const toast = await this.toasController.create({
        message: 'Evento actualizado exitosamente',
        duration: 2000,
      });
      toast.present();
      this.router.navigate(['/eventosadm']);
    }).catch((error: any) => {  // Se añade el tipo 'any' al error
      console.error('Error al actualizar el evento', error);
    });
  }
}
