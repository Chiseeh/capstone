import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Queja } from '../modelos/quejas';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-quejas',
  templateUrl: './quejas.page.html',
  styleUrls: ['./quejas.page.scss'],
})
export class QuejasPage implements OnInit {
  nuevaQuejaForm: FormGroup;
  quejas: any[] = []; // Cambia a any[] para que acepte el campo nombreUsuario
  public modalAbierto: boolean = false;
  usuarioActual: any = null;

  constructor(
    private apiService: ApiService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder
  ) {
    this.nuevaQuejaForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      categoria: ['seguridad', Validators.required],
    });
  }

  ngOnInit() {
    this.obtenerUsuarioActual();
    this.listarQuejas();
  }

  obtenerUsuarioActual() {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }
  }

  abrirFormulario() {
    this.modalAbierto = true;
  }

  cerrarFormulario() {
    this.modalAbierto = false;
    this.nuevaQuejaForm.reset();
  }

  registrarQueja() {
    if (this.nuevaQuejaForm.valid && this.usuarioActual) {
      const nuevaQueja: Queja = {
        id: Date.now(),
        titulo: this.nuevaQuejaForm.value.titulo,
        descripcion: this.nuevaQuejaForm.value.descripcion,
        categoria: this.nuevaQuejaForm.value.categoria,
        idUsuario: this.usuarioActual.id,
        estado: 'en proceso'  // Establece el estado por defecto aquí
      };

      this.apiService.agregarQueja(nuevaQueja).subscribe(
        () => {
          this.listarQuejas();
          this.cerrarFormulario();
        },
        (error) => {
          console.error('Error al registrar la queja', error);
        }
      );
    } else {
      console.error('Formulario inválido o usuario no autenticado.');
    }
  }


  listarQuejas() {
    this.apiService.listarQuejas().subscribe(
      async (datos) => {
        if (this.usuarioActual && this.usuarioActual.admin) {
          // Obtener la lista de usuarios
          const usuarios = await this.apiService.listarUsuarios().toPromise();

          // Comprobar si usuarios es undefined o no
          if (usuarios) {
            // Mapear las quejas para agregar el nombre del usuario
            this.quejas = datos.map(queja => {
              const usuario = usuarios.find(u => u.id === queja.idUsuario);
              return {
                ...queja,
                nombreUsuario: usuario ? usuario.nombre : 'Usuario desconocido'
              };
            });
          } else {
            this.quejas = datos; // Si no hay usuarios, solo mostrar quejas sin nombres
          }
        } else {
          // Si no es admin, solo mostrar las quejas del usuario actual
          this.quejas = datos.filter(queja => queja.idUsuario === this.usuarioActual.id);
        }
      },
      (error) => {
        console.error('Error al obtener la lista de quejas', error);
      }
    );
  }

  responderQueja(queja: Queja) {
    const prompt = window.prompt("¿Cuál es su respuesta a la queja?");

    if (prompt !== null && prompt.trim() !== "") {
      queja.estado = 'resuelto'; // Cambia el estado de la queja actual
      queja.respuesta = prompt; // Guarda la respuesta del admin

      // Actualiza el estado de las quejas asociadas a usuarios que no son admins
      this.quejas.forEach(q => {
        if (q.idUsuario === queja.idUsuario && !this.usuarioActual.admin) {
          q.estado = 'resuelto'; // Cambia el estado a 'resuelto'
          q.respuesta = prompt; // Guarda la respuesta del admin también para estas quejas
        }
      });

      // Actualiza la queja en el backend
      this.apiService.actualizarQueja(queja).subscribe(
        () => {
          console.log('Queja actualizada con éxito');
        },
        (error) => {
          console.error('Error al actualizar la queja', error);
        }
      );
    } else {
      console.log("No se proporcionó respuesta.");
    }
  }

  volverInicio() {
    this.navCtrl.navigateRoot('inicio');
  }

    // Método para retroceder a la página anterior
    volverAtras() {
      this.navCtrl.back(); // Utilizamos el servicio NavController para retroceder
    }

  getIconForCategory(categoria: string): string {
    switch (categoria) {
      case 'seguridad':
        return 'shield-checkmark';
      case 'evento deportivo':
        return 'football';
      case 'infraestructura':
        return 'construct';
      default:
        return 'help-circle';
    }
  }

  getColorForCategory(categoria: string): string {
    switch (categoria) {
      case 'seguridad':
        return '#ad000d'; // Rojo
      case 'evento deportivo':
        return ' #28a745'; //verde
      case 'infraestructura':
        return 'purple';
      default:
        return '#6c757d';
    }
  }

}
