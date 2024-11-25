import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Asegúrate de importar Firestore
import { UsuarioConID } from '../modelos/usuario';
import { NavController, AlertController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-usuariosadm',
  templateUrl: './usuariosadm.page.html',
  styleUrls: ['./usuariosadm.page.scss'],
})
export class UsuariosAdmPage implements OnInit {
  listaUsuarios: UsuarioConID[] = [];
  formularioUsuario: FormGroup;
  isEditMode = false; // Variable para cambiar entre agregar y editar
  usuarioActualId: string | null = null; // Para almacenar el ID del usuario en edición
  listaUsuariosFiltrados: UsuarioConID[] = [];  // Lista filtrada
  searchText: string = '';

  constructor(
    private firestore: AngularFirestore, // Inyectar Firestore
    private navCtrl: NavController,
    private alertController: AlertController
  ) {
    this.formularioUsuario = new FormGroup({
      nombre: new FormControl('', Validators.required),
      apellido: new FormControl('', Validators.required),
      rut: new FormControl('', [Validators.required, this.validarRUT]), // Validación de RUT
      correo: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]), // Validación de correo electrónico
      clave: new FormControl('', Validators.required),
      admin: new FormControl(false),
    });
    this.listaUsuariosFiltrados = [...this.listaUsuarios];
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  // Cargar la lista de usuarios desde Firebase
  cargarUsuarios() {
    this.firestore.collection<UsuarioConID>('usuarios').valueChanges({ idField: 'id' }).subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
      this.listaUsuariosFiltrados = [...this.listaUsuarios]; // Inicializar lista filtrada
    });
  }

  filtrarUsuarios() {
    console.log('Texto de búsqueda:', this.searchText); // Verifica el valor de búsqueda
    if (this.searchText.trim() === '') {
      this.listaUsuariosFiltrados = this.listaUsuarios;
    } else {
      this.listaUsuariosFiltrados = this.listaUsuarios.filter(usuario => {
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
        const buscarTexto = this.searchText.toLowerCase();
        const encontrado = nombreCompleto.includes(buscarTexto);
        console.log(`Buscando "${buscarTexto}" en "${nombreCompleto}": ${encontrado}`); // Verifica si el filtro funciona
        return encontrado;
      });
    }
  }


  // Guardar o actualizar un usuario en Firebase
  async guardarUsuario() {
    const usuario = this.formularioUsuario.value;

    // Validar campos del formulario
    if (this.formularioUsuario.invalid) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Favor rellenar los campos correctamente.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    const confirmAlert = await this.alertController.create({
      header: 'Confirmación',
      message: `¿Desea ${this.isEditMode ? 'modificar' : 'crear'} al usuario ${usuario.nombre} ${usuario.apellido}?`,
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            if (this.isEditMode && this.usuarioActualId) {
              const usuarioActualizado: UsuarioConID = {
                ...usuario,
                id: this.usuarioActualId,
              };
              this.firestore.collection('usuarios').doc(this.usuarioActualId).update(usuarioActualizado).then(() => {
                this.cargarUsuarios();
                this.limpiarFormulario();
              });
            } else {
              this.firestore.collection('usuarios').add(usuario).then(() => {
                this.cargarUsuarios();
                this.limpiarFormulario();
              });
            }
          },
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    await confirmAlert.present();
  }

  // Editar un usuario (cargar datos al formulario)
  editarUsuario(usuario: UsuarioConID) {
    this.isEditMode = true;
    this.usuarioActualId = usuario.id;
    this.formularioUsuario.patchValue(usuario); // Carga los datos del usuario al formulario
  }

  // Eliminar un usuario de Firebase
  async eliminarUsuario(id: string) {
    const usuario = this.listaUsuarios.find(u => u.id === id);

    if (!usuario) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Usuario no encontrado.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: `¿Desea eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`,
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.firestore.collection('usuarios').doc(id).delete().then(() => {
              this.cargarUsuarios();
            });
          },
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  // Limpiar el formulario y resetear el modo de edición
  limpiarFormulario() {
    this.formularioUsuario.reset({ admin: false });
    this.isEditMode = false;
    this.usuarioActualId = null;
  }

  volverAlMenuPrincipal() {
    this.navCtrl.navigateForward(['/inicio']); // Cambia '/inicio' a la ruta correcta para tu página de menú principal
  }

  // Función para cancelar la edición y volver al modo de agregar
  cancelarEdicion() {
    this.limpiarFormulario(); // Restablece el formulario
  }

  // Validación de RUT (sin cambios)
  validarRUT(control: AbstractControl): ValidationErrors | null {
    const rut = control.value;
    if (!rut) return null; // Si no hay valor, no hay error

    const rutRegex = /^\d{7,8}-[0-9kK]$/; // RUT con guion y sin puntos

    // Validar que el RUT tenga el formato correcto
    if (!rutRegex.test(rut)) {
      return { invalidRUT: true }; // Retorna error si el formato es incorrecto
    }

    // Separar el número del dígito verificador
    const [numero, dv] = rut.split('-');
    const suma = [...numero].reverse().reduce((acc, val, index) => {
      const numVal = parseInt(val);
      return acc + (numVal * ((index % 6) + 2)); // Cálculo del RUT
    }, 0);
    const dvCalculado = 11 - (suma % 11);

    // Determinar el dígito verificador
    const dvEsperado = dvCalculado === 10 ? 'K' : dvCalculado === 11 ? '0' : dvCalculado.toString();

    // Validar si el dígito verificador coincide
    if (dv.toUpperCase() !== dvEsperado) {
      return { invalidRUT: true }; // Retorna error si el DV es incorrecto
    }

    return null; // RUT válido
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
}
