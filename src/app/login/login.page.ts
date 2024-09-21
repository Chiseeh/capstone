import {Component, OnInit } from '@angular/core';
import { FormGroup,FormControl,Validators,FormBuilder } from '@angular/forms'; //imports para formulario.
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formulariologin: FormGroup;

  constructor(public fb: FormBuilder,private alertController: AlertController,private NavCtrl: NavController) {
    this.formulariologin = this.fb.group({
      'nombre': new FormControl("",Validators.required),
      'clave': new FormControl("",Validators.required)
    })
   }

  ngOnInit() {

  }

async Ingresar() {
  var f = this.formulariologin.value;
  var usuarioString = localStorage.getItem('usuario');
  if (usuarioString !== null) {
    var usuario = JSON.parse(usuarioString);
    if (usuario.nombre == f.nombre && usuario.password == f.clave) {
      console.log('Ingresado');
      localStorage.setItem('ingresado', 'true');
      this.NavCtrl.navigateRoot('inicio');


    } else {
      const alert = await this.alertController.create({
        header: 'Datos incorrectos',
        message: 'Tienes que llenar todos los datos',
        buttons: ['Aceptar'],
      });
      await alert.present();
    }
  } else {
    // Manejo de caso cuando no se encuentra el valor en localStorage
  }
}}
