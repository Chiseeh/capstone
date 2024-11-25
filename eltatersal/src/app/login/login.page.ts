import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formulariologin: FormGroup;
  claveType: string = 'password';

  constructor(
    public fb: FormBuilder,
    private alertController: AlertController,
    private navCtrl: NavController,
    private apiService: ApiService
  ) {
    this.formulariologin = this.fb.group({
      'correo': new FormControl("", [Validators.required, Validators.email]),
      'clave': new FormControl("", Validators.required)
    });
  }

  ngOnInit() {}


  async Ingresar() {
    const f = this.formulariologin.value;

    // Validar si los campos están vacíos
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
      // Llama a Firebase para autenticación
      const usuario = await this.apiService.iniciarSesionFirebase(f.correo, f.clave);
      if (usuario) {
        console.log('Ingresado con Firebase');
        localStorage.setItem('ingresado', 'true');
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        this.navCtrl.navigateRoot('inicio');
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
