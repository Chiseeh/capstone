import { Component, OnInit } from '@angular/core';
import { ApiService } from '../servicios/api.service';
import { Queja, QuejaConID } from '../modelos/quejas';
import { NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Timestamp } from 'firebase/firestore'; // Importar Firestore

@Component({
  selector: 'app-quejas',
  templateUrl: './quejas.page.html',
  styleUrls: ['./quejas.page.scss'],
})
export class QuejasPage implements OnInit {
  nuevaQuejaForm: FormGroup;
  quejas: QuejaConID[] = [];
  public modalAbierto: boolean = false;
  public quejaSeleccionada: Queja | null = null; // Inicialización a null
  usuarioActual: any = null;
  modalDetalleAbierto: boolean = false; // Para controlar la visibilidad del modal
  respuestaAdmin: string = ''; // Para almacenar la respuesta del administrador
  mostrarFecha: boolean = false;
  quejasEnProceso: number = 0;
  quejasResueltas: number = 0;
  mensajeConfirmacion: string | null = null;

  // Nueva propiedad para manejar la búsqueda
  searchText: string = '';

  constructor(
    private apiService: ApiService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private afAuth: AngularFireAuth
  ) {
    this.nuevaQuejaForm = this.formBuilder.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      categoria: ['seguridad', Validators.required],
      archivoAdjunto: [''],
      fecha: [Timestamp.now()]
    });
  }

  ngOnInit() {
    this.obtenerUsuarioActual();
    this.listarQuejas();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.nuevaQuejaForm.patchValue({
          archivoAdjunto: reader.result as string // Asegúrate de que sea un string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  obtenerUsuarioActual() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.usuarioActual = {
          id: user.uid,
          correo: user.email, // Si necesitas el correo
        };
        console.log('Usuario actual:', this.usuarioActual); // Verifica que se obtenga correctamente
      } else {
        this.usuarioActual = null; // No hay usuario autenticado
      }
    });
  }

  abrirFormulario() {
    this.modalAbierto = true;
  }

  cerrarFormulario() {
    this.modalAbierto = false;
    this.nuevaQuejaForm.reset();
    this.mensajeConfirmacion = null; // Limpiar el mensaje de confirmación
  }

  registrarQueja() {
    if (this.nuevaQuejaForm.valid && this.usuarioActual) {
      const nuevaQueja: Queja = {
        id: '',
        titulo: this.nuevaQuejaForm.value.titulo,
        descripcion: this.nuevaQuejaForm.value.descripcion,
        categoria: this.nuevaQuejaForm.value.categoria,
        idUsuario: this.usuarioActual.id,
        estado: 'en proceso',
        archivoAdjunto: this.nuevaQuejaForm.value.archivoAdjunto || null, // Mantén esto como string base64
        fecha: Timestamp.now()
      };

      // Llama al servicio de agregar queja
      this.apiService.agregarQueja(nuevaQueja, nuevaQueja.archivoAdjunto).subscribe(
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
          const usuarios = await this.apiService.listarUsuarios().toPromise();

          if (usuarios) {
            this.quejas = datos.map(queja => {
              const usuario = usuarios.find(u => u.id === queja.idUsuario);
              return {
                ...queja,
                nombreUsuario: usuario ? usuario.nombre : 'Usuario desconocido'
              };
            });
          } else {
            this.quejas = datos; // No hay usuarios, solo asigna los datos
          }
        } else {
          this.quejas = datos.filter(queja => queja.idUsuario === String(this.usuarioActual.id));
        }

        this.contarQuejasPorEstado();
      },
      (error) => {
        console.error('Error al obtener la lista de quejas', error);
      }
    );
  }

  contarQuejasPorEstado() {
    this.quejasEnProceso = this.quejas.filter(queja => queja.estado === 'en proceso').length;
    this.quejasResueltas = this.quejas.filter(queja => queja.estado === 'resuelto').length;
  }

  responderQueja(queja: QuejaConID) {
    const prompt = window.prompt("¿Cuál es su respuesta a la queja?");

    if (prompt !== null && prompt.trim() !== "") {
      queja.estado = 'resuelto';
      queja.respuesta = prompt;

      this.quejas.forEach(q => {
        if (q.idUsuario === queja.idUsuario && !this.usuarioActual.admin) {
          q.estado = 'resuelto';
          q.respuesta = prompt;
        }
      });

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

  volverAtras() {
    this.navCtrl.back();
  }

  abrirModal(queja: QuejaConID) {
    this.quejaSeleccionada = queja; // Asigna la queja seleccionada
    this.modalAbierto = true; // Abre el modal
  }

  cerrarModal() {
    this.modalAbierto = false; // Cierra el modal
    this.quejaSeleccionada = null; // Reinicia la queja seleccionada
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

  getBorderColorForCategory(categoria: string): string {
    switch (categoria) {
      case 'seguridad':
        return '#ffb3b3'; // Rojo
      case 'evento deportivo':
        return '#b3ffb3'; // Verde
      case 'infraestructura':
        return '#b3d1ff'; // Azul claro
      default:
        return '#cccccc'; // Color por defecto
    }
  }

  getColorForCategory(categoria: string): string {
    switch (categoria) {
      case 'seguridad':
        return '#ffb3b3'; // Rojo
      case 'evento deportivo':
        return '#b3ffb3'; // Verde
      case 'infraestructura':
        return '#b3d1ff';
      default:
        return '#cccccc';
    }
  }

  verDetalleQueja(queja: QuejaConID) {
    this.quejaSeleccionada = queja; // Asigna la queja seleccionada
    this.modalDetalleAbierto = true; // Abre el modal
    this.respuestaAdmin = ''; // Resetea la respuesta del administrador
  }

  cerrarDetalleQueja() {
    this.quejaSeleccionada = null; // Limpia la queja seleccionada
    this.modalDetalleAbierto = false; // Cierra el modal
  }

  filtrarQuejas() {
    if (this.searchText.trim()) {
      this.quejas = this.quejas.filter(queja =>
        queja.titulo.toLowerCase().includes(this.searchText.toLowerCase()) ||
        queja.descripcion.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.listarQuejas(); // Reestablece la lista si no hay texto en la búsqueda
    }
  }
}
