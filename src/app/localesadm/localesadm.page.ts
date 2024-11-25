import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../servicios/api.service';
import { UsuarioConID } from '../modelos/usuario';
import { LoadingController, NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-localesadm',
  templateUrl: './localesadm.page.html',
  styleUrls: ['./localesadm.page.scss']
})
export class LocalesAdmPage implements OnInit {
  localForm: FormGroup;
  locales: any[] = [];
  usuarios: UsuarioConID[] = [];
  editandoLocal: any = null;

  constructor(private navCtrl: NavController, private fb: FormBuilder, private apiService: ApiService, private alertController: AlertController) {

    this.localForm = this.fb.group({
      nombreLocal: ['', Validators.required],
      usuarioId: ['', Validators.required],
      descripcion: [''],
      hayPan: [false]
    });
  }

  ngOnInit() {
    this.obtenerUsuarios();
    this.obtenerLocales();
  }

  obtenerUsuarios() {
    this.apiService.listarUsuariosFirebase().subscribe((usuarios) => {
      this.usuarios = usuarios;
    });
  }

  obtenerLocales() {
    this.apiService.listarLocalesFirebase().subscribe((locales) => {
      this.locales = locales;
    });
  }

  agregarLocal() {
    if (this.localForm.valid) {
      const localData = this.localForm.value;

      if (this.editandoLocal) {
        // Actualizar el local existente
        this.apiService.actualizarLocalFirebase(this.editandoLocal.id, localData).subscribe(() => {
          console.log('Local actualizado exitosamente');
          this.cancelarEdicion();
          this.obtenerLocales(); // Refrescar la lista de locales
        });
      } else {
        // Agregar un nuevo local
        this.apiService.agregarLocalFirebase(localData).subscribe(() => {
          console.log('Local agregado exitosamente');
          this.localForm.reset();
          this.obtenerLocales(); // Refrescar la lista de locales
        });
      }
    }
  }

  editarLocal(local: any) {
    this.editandoLocal = local;
    // Llenar el formulario con los datos del local seleccionado para edición
    this.localForm.patchValue(local);
  }

  cancelarEdicion() {
    this.editandoLocal = null;
    this.localForm.reset();
  }

  async eliminarLocal(localId: string) {
    // Confirmación antes de eliminar
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este local?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.eliminarLocalFirebase(localId).subscribe(() => {
              console.log('Local eliminado exitosamente');
              this.obtenerLocales(); // Refrescar la lista de locales
            });
          }
        }
      ]
    });

    await alert.present();
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
