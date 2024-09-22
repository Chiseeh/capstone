import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Queja } from '../modelos/quejas';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-quejas',
  templateUrl: './quejas.page.html',
  styleUrls: ['./quejas.page.scss'],
})
export class QuejasPage implements OnInit {
  nuevaQueja: Queja ={
    id: 0,
    titulo: '',
    descripcion: '',
    categoria: 'seguridad',
    idUsuario: 0
  };

  quejas: Queja[] = [];
  public modalAbierto: boolean = false;

  constructor(private apiService: ApiService,private navCtrl: NavController) { }

  ngOnInit() {
    this.listarQuejas();
  }



  abrirFormulario() {
    this.modalAbierto = true;
  }

  cerrarFormulario() {
    this.modalAbierto = false;
  }

  registrarQueja(){
    //asignar un id unico a la queja
    this.nuevaQueja.id =  Date.now(); //usamos marca de tiempo real como id?
    this.nuevaQueja.idUsuario = this.apiService.ObtenerIdUsuario(); // obtener id del usuario actual
    this.apiService.agregarQueja(this.nuevaQueja).subscribe(
      () => {
        //limpiamos el formulario
        this.nuevaQueja = {
          id: 0,
          titulo: '',
          descripcion: '',
          categoria: 'seguridad',
          idUsuario: 0
        };
        this.listarQuejas(); //actualizamos la lista de quejas
      },
      (error)=> {
        console.error('Error al registrar la queja!!!!', Error);
      }
    );
  }
  listarQuejas(){
    this.apiService.listarQuejas().subscribe(
      (datos) => {
        this.quejas = datos;
      },
      (error) => {
        console.error('Error al obtener la lista de quejas', Error);
      }
    );
  }

  // Método para volver a la página de inicio
  volverInicio() {
    this.navCtrl.navigateRoot('inicio'); // Ajusta el nombre de la ruta según sea necesario
  }

}
