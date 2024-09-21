import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  constructor(private router: Router,private toastController: ToastController) { }

  ngOnInit() {
  }
  async cerrarSesion() {
    // Elimina todos los datos del localStorage
    localStorage.clear();

    // Muestra un toast notificando que la sesión se ha cerrado
    const toast = await this.toastController.create({
      message: 'Sesión cerrada correctamente.',
      duration: 2000, // Duración del toast en milisegundos
      color: 'success' // Puedes ajustar el color según tu preferencia
    });
    toast.present();

    // Redirige al usuario a la página de inicio de sesión o a otra página
    this.router.navigate(['/login']); // Asegúrate de que la ruta '/login' sea la correcta
  }

}
