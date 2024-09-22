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

    this.apiService.obtenerUsuarioPorNombreYContra(f.nombre, f.clave).subscribe(async usuario => {
      if (usuario) {
        console.log('Ingresado');
        localStorage.setItem('ingresado', 'true');
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
