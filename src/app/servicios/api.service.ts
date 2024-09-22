import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Queja } from '../modelos/quejas';
import { Usuario,UsuarioConID } from '../modelos/usuario';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private URL_QUEJAS = 'http://localhost:3000/quejas'; // Ruta del archivo Json Local
  private URL_USUARIO = 'http://localhost:3000/usuarios'; // Ruta del archivo Json Local

  constructor(private http: HttpClient) {}

  public agregarUsuario(usuario: Usuario) {
    return this.http.post<Usuario>(this.URL_USUARIO, usuario, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
  }

  public obtenerUsuarioPorNombreYContra(nombre: string, contrasena: string): Observable<UsuarioConID | null> {
    return this.http.get<UsuarioConID | null>(`${this.URL_USUARIO}?nombre=${nombre}&clave=${contrasena}`);
  }

//metodo para obtener id automatica del usuario actual
  public ObtenerIdUsuario(): number {
    return Number(sessionStorage.getItem('ID'));  // Método para obtener el ID del usuario
  }

  //metodo para agregar quejas
  agregarQueja(queja: Queja): Observable<any>{
    //insercion a la base de datos json
    return this.http.post(this.URL_QUEJAS, queja, {
      headers: {'Content-Type': 'application/json;charset=utf-8'}
    });
  }
  // Método para listar las quejas
  listarQuejas(): Observable<Queja[]> {
    return this.http.get<Queja[]>(this.URL_QUEJAS);
  }
}
