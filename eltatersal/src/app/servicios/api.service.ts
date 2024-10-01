import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Queja } from '../modelos/quejas';
import {Evento} from '../modelos/eventos'
import { Usuario,UsuarioConID } from '../modelos/usuario';
import { Reporte } from '../modelos/reporte';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {Noticias} from '../modelos/noticia';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private URL_QUEJAS = 'http://localhost:3000/quejas'; // Ruta del archivo Json Local
  private URL_USUARIO = 'http://localhost:3000/usuarios'; // Ruta del archivo Json Local
  private URL_REPORTES = 'http://localhost:3000/reportes'; // Ruta del archivo Json Local
  private URL_EVENTO = 'http://localhost:3000/evento';
  private URL_NOTICIA = 'http://localhost:3000/noticias';

  constructor(private http: HttpClient) {}

  public agregarUsuario(usuario: Usuario) {
    return this.http.post<Usuario>(this.URL_USUARIO, usuario, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
  }

  public obtenerUsuarioPorNombreYContra(nombre: string, contrasena: string): Observable<UsuarioConID | null> {
    return this.http.get<UsuarioConID[]>(`${this.URL_USUARIO}?nombre=${nombre}&clave=${contrasena}`).pipe(
      map(usuarios => {
        // Filtramos los usuarios para encontrar uno que coincida con el nombre y la contraseña
        const usuario = usuarios.find(u => u.nombre === nombre && u.clave === contrasena);
        return usuario ? usuario : null; // Retornamos el usuario si existe, de lo contrario null
      })
    );
  }

//metodo para obtener id automatica del usuario actual
  public ObtenerIdUsuario(): number {
    const usuarioActual = localStorage.getItem('usuarioActual'); // Asegúrate de que el usuario se almacene correctamente
    return usuarioActual ? JSON.parse(usuarioActual).id : 0; // Devuelve el ID del usuario actual o 0 si no hay usuario
  }

  public obtenerUsuarioPorID(id: number): Observable<Usuario | null> {
    return this.http.get<Usuario[]>(`${this.URL_USUARIO}?id=${id}`).pipe(
      map(usuarios => usuarios.length > 0 ? usuarios[0] : null)
    );
  }


  //metodo para agregar quejas
  agregarQueja(queja: Queja): Observable<any>{
    //insercion a la base de datos json
    return this.http.post(this.URL_QUEJAS, queja, {
      headers: {'Content-Type': 'application/json;charset=utf-8'}
    });
  }
  public actualizarQueja(queja: Queja): Observable<Queja> {
    return this.http.put<Queja>(`${this.URL_QUEJAS}/${queja.id}`, queja, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
  }
  // Método para listar las quejas
  listarQuejas(): Observable<Queja[]> {
    return this.http.get<Queja[]>(this.URL_QUEJAS);
  }

  public listarUsuarios(): Observable<UsuarioConID[]> {
    return this.http.get<UsuarioConID[]>(this.URL_USUARIO);
  }
  agregarReporte(reporte: Reporte): Observable<any> {
    return this.http.post(`${this.URL_REPORTES}`, reporte);
  }

  listarReportes(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.URL_REPORTES}`);
  }

  // traemos un arreglo que tenga todo el json
  listarEventos():Observable<Evento[]>{
    return this.http.get<Evento[]>(this.URL_EVENTO);
  }

  // creamos un evento
  crearEventos(newEvento: Evento): Observable<Evento>{
    return this.http.post<Evento>(`${this.URL_EVENTO}`, newEvento);
  }

  // nos traermos un evento para mostrarle el detalle
  getEventosByID(idEvento: Number): Observable<Evento>{
    return this.http.get<Evento>(`${this.URL_EVENTO}/?idEvento=${idEvento}`);
  }

  // actualizamos un evento
  editarEvento(eventoss:any): Observable<Evento>{
    return this.http.put<Evento>(`${environment.apiURL}/evento/${eventoss.idEvento}`, eventoss);
  }
  // eliminamos un evento
  eliminarUnEvento(eventoUno:any):Observable<Evento>{
    return this.http.delete<Evento>(`${environment.apiURL}/evento/${eventoUno.idEvento}`);
  }

  // listamos todas las noticias
  listarNoticias():Observable<Noticias[]>{
    return this.http.get<Noticias[]>(this.URL_NOTICIA);
  }

  // agregamos una noticia
  agregarNoticia(newNoticia: Noticias): Observable<Noticias> {
    return this.http.post<Noticias>(`${this.URL_NOTICIA}`, newNoticia);
  }

  // traemos una noticia por el ID
  getNoticiasID(idNoticia: Number): Observable<Noticias> {
    return this.http.get<Noticias>(`${this.URL_NOTICIA}/?idNoticia=${idNoticia}`);
  }
}
