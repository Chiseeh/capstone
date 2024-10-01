import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service'; // Asegúrate de importar ApiService
import { Usuario } from '../modelos/usuario'; // Asegúrate de que el modelo Usuario esté importado

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  formularioregistro: FormGroup;

  constructor(
    public fb: FormBuilder,
    private alertController: AlertController,
    private navCtrl: NavController,
    private apiService: ApiService // Inyección de ApiService
  ) {
    this.formularioregistro = this.fb.group({
      'nombre': new FormControl("", Validators.required),
      'clave': new FormControl("", Validators.required),
      'confirmarclave': new FormControl("", Validators.required)
    });
  }

  ngOnInit() {}

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

    // Verifica que las contraseñas coincidan
    if (f.clave !== f.confirmarclave) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    const usuario: Usuario = {
      nombre: f.nombre,
      clave: f.clave,
      quejas: [], // Inicializa con un array vacío si es necesario
      admin: false
    };

    // Guardar el usuario en la base de datos local
    this.apiService.agregarUsuario(usuario).subscribe(
      async (response) => {
        const alert = await this.alertController.create({
          header: 'Registro Exitoso',
          message: 'El usuario ha sido registrado con éxito.',
          buttons: ['Aceptar']
        });
        await alert.present();
        this.navCtrl.navigateRoot('login');
      },
      async (error) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al registrar el usuario.',
          buttons: ['Aceptar']
        });
        await alert.present();
      }
    );
  }
}
