import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service'; // Asegúrate de importar ApiService
import { Usuario } from '../modelos/usuario'; // Asegúrate de que el modelo Usuario esté importado
import * as QRCode from 'qrcode'; // Importa la librería QRCode

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  formularioregistro: FormGroup;
  firmaBase64!: string; // Indica que la propiedad será inicializada más tarde
  qrCodeBase64!: string; // Propiedad para almacenar el código QR en base64
  constructor(
    public fb: FormBuilder,
    private alertController: AlertController,
    private navCtrl: NavController,
    private apiService: ApiService // Inyección de ApiService
  ) {
    this.formularioregistro = this.fb.group({
      'nombre': new FormControl("", Validators.required),
      'apellido': new FormControl("", Validators.required), // Agregado apellido
      'rut': new FormControl("", Validators.required), // Agregado RUT
      'correo': new FormControl("", Validators.email), // Campo de correo opcional
      'clave': new FormControl("", Validators.required),
      'confirmarclave': new FormControl("", Validators.required),
      'direccion': new FormControl("",Validators.required),
    });
  }

  ngOnInit() {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement; // Asegúrate de que target es un HTMLInputElement
    const file = input.files?.[0]; // Usa la opción segura para acceder al primer archivo
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.firmaBase64 = reader.result as string; // Almacena la firma en base64
      };
      reader.readAsDataURL(file); // Lee el archivo como una URL de datos
    }
  }

  async guardar() {
    const f = this.formularioregistro.value;

    if (this.formularioregistro.invalid) {
      const alert = await this.alertController.create({
        header: 'Datos Incompletos!!',
        message: 'Tienes que completar los datos.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    if (f.clave !== f.confirmarclave) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    if (!f.correo) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'El campo de correo es obligatorio para el registro en Firebase.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    const usuario: Usuario = {
      nombre: f.nombre,
      apellido: f.apellido,
      rut: f.rut,
      correo: f.correo,
      clave: f.clave,
      quejas: [],
      admin: false,
      direccion: f.direccion,
      firma: this.firmaBase64
    };

    // Crear un objeto JSON con los datos del usuario para el QR
    const datosUsuario = {

      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rut: usuario.rut,
      correo: usuario.correo,
      direccion: usuario.direccion,
    };
    console.log('Datos del QR:', datosUsuario);
this.qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(datosUsuario));
    try {
      // Generar el código QR a partir de los datos en formato JSON
      this.qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(datosUsuario));
    } catch (error) {
      console.error('Error generando el código QR:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al generar el código QR.',
        buttons: ['Aceptar']
      });
      await alert.present();
      return;
    }

    // Agregar el código QR generado al objeto de usuario
    usuario.qrCode = this.qrCodeBase64;

    // Llamar al servicio para agregar el usuario a Firebase
    this.apiService.agregarUsuarioFirebase(usuario)
      .then(async () => {
        const alert = await this.alertController.create({
          header: 'Registro Exitoso',
          message: 'El usuario ha sido registrado con éxito.',
          buttons: ['Aceptar']
        });
        await alert.present();
        this.navCtrl.navigateRoot('login');
      })
      .catch(async (error) => {
        console.error('Error registrando al usuario:', error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Hubo un problema al registrar el usuario.',
          buttons: ['Aceptar']
        });
        await alert.present();
      });
  }



}
