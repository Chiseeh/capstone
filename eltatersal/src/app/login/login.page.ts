import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'; // imports para formulario.
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service'; // Importar ApiService

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
    private apiService: ApiService // Inyección del servicio
  ) {
    this.formulariologin = this.fb.group({
      'nombre': new FormControl("", Validators.required),
      'clave': new FormControl("", Validators.required)
    });


  }

  ngOnInit() {}

  async Ingresar() {
    const f = this.formulariologin.value;

    // Validar si los campos están vacíos
    if (!f.nombre || !f.clave) {
      const alert = await this.alertController.create({
        header: 'Campos Vacíos',
        message: 'Por favor, complete todos los campos antes de continuar.',
        buttons: ['Aceptar'],
      });
      await alert.present();
      return; // Detener ejecución si hay campos vacíos
    }

    // Llamar a la API para obtener el usuario
    this.apiService.obtenerUsuarioPorNombreYContra(f.nombre, f.clave).subscribe(async usuario => {
      if (usuario) {
        console.log('Ingresado');
        localStorage.setItem('ingresado', 'true');
        localStorage.setItem('usuarioActual', JSON.stringify(usuario)); // Guarda el usuario con su ID
        this.navCtrl.navigateRoot('inicio');
      } else {
        const alert = await this.alertController.create({
          header: 'Datos incorrectos',
          message: 'Usuario o contraseña incorrectos.',
          buttons: ['Aceptar'],
        });
        await alert.present();
      }
    }, async error => {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al intentar ingresar.',
        buttons: ['Aceptar'],
      });
      await alert.present();
    });
  }
  }



