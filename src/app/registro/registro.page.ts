import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'; //imports para formulario.
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  formularioregistro: FormGroup;

  constructor(public fb: FormBuilder, private alertController: AlertController, private NavCtrl: NavController) {
    this.formularioregistro = this.fb.group({
      'nombre': new FormControl("", Validators.required),
      'clave': new FormControl("", Validators.required),
      'confirmarclave': new FormControl("", Validators.required)
    })
  }

  ngOnInit() {

  }

  async guardar() {
    var f = this.formularioregistro.value;

    if (this.formularioregistro.invalid) {
      const alert = await this.alertController.create({
        header: 'Datos Incompletos!!',
        message: 'Tienes que completar los datos.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }
    var usuario = {
      nombre: f.nombre,
      password: f.clave,
      confirmar: f.confirmarclave

    }
    localStorage.setItem('usuario', JSON.stringify(usuario));
    // Marca que el usuario está autenticado
    localStorage.setItem('isRegistered', 'true');
    // Limpia el estado de registro
    localStorage.removeItem('isRegistered');
    this.NavCtrl.navigateRoot('login');
  }

}

