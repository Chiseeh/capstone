import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class noIngresadoGuard implements CanActivate {
  constructor(private navCtrl: NavController) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isRegistered = localStorage.getItem('isRegistered');
    const isLoggedIn = localStorage.getItem('ingresado');

    // Si el usuario está autenticado y el registro no está marcado
    if (isLoggedIn && !isRegistered) {
      this.navCtrl.navigateRoot('inicio');
      return false;
    } else {
      return true;
    }
  }
}
