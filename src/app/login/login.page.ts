import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UsuarioConID, Usuario } from '../modelos/usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formulariologin: FormGroup;

  constructor(
    public fb: FormBuilder,
    private alertController: AlertController,
    private navCtrl: NavController,
    private apiService: ApiService,
    private afAuth: AngularFireAuth // Inyectamos AngularFireAuth
  ) {
    this.formulariologin = this.fb.group({
      'correo': new FormControl("", [Validators.required, Validators.email]),
      'clave': new FormControl("", Validators.required)
    });
  }

  ngOnInit() {}

  async Ingresar() {
    const f = this.formulariologin.value;

    if (!f.correo || !f.clave) {
      const alert = await this.alertController.create({
        header: 'Campos Vacíos',
        message: 'Por favor, complete todos los campos antes de continuar.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return;
    }

    try {
      // Iniciar sesión con Firebase y tipar el resultado como Usuario
      const usuario = await this.apiService.iniciarSesionFirebase(f.correo, f.clave) as Usuario;

      if (usuario) {
        // Verificar si el usuario es administrador
        if (usuario.admin) {
          console.log('Ingresado con Firebase como administrador');
          localStorage.setItem('ingresado', 'true');
          localStorage.setItem('usuarioActual', JSON.stringify(usuario));
          this.navCtrl.navigateRoot('inicio'); // Redirigir a la página de inicio del admin
        } else {
          const alert = await this.alertController.create({
            header: 'Acceso Denegado',
            message: 'Solo los administradores pueden acceder.',
            buttons: ['Aceptar'],
          });
          await alert.present();
        }
      }
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error de inicio de sesión',
        message: 'Correo o contraseña incorrectos.',
        buttons: ['Aceptar'],
      });
      await alert.present();
    }
  }
}
