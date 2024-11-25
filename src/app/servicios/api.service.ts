import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { Queja, QuejaConID } from '../modelos/quejas';
import { Evento, EventoDAO } from '../modelos/eventos';
import { Local } from '../modelos/local';
import { Solicitud } from '../modelos/solicitud';
import { Usuario, UsuarioConID } from '../modelos/usuario';
import { Reporte } from '../modelos/reporte';
import { MascotaPerdida,MascotaPerdidaConID } from '../modelos/mascotaperdida';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Noticias } from '../modelos/noticia';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Timestamp } from 'firebase/firestore';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private URL_QUEJAS = 'http://localhost:3000/quejas'; // Ruta del archivo Json Local
  private URL_USUARIO = 'http://localhost:3000/usuarios'; // Ruta del archivo Json Local
  private URL_REPORTES = 'http://localhost:3000/reportes'; // Ruta del archivo Json Local
  private URL_EVENTO = 'http://localhost:3000/evento';
  private URL_NOTICIA = 'http://localhost:3000/noticias';
  private quejasCollection = this.firestore.collection<Queja>('quejas');
  private reportesCollection = this.firestore.collection<Reporte>('reportes');
  private noticiasCollection = this.firestore.collection<Noticias>('noticias');
  private eventosCollection = this.firestore.collection<Evento>('eventos');
  private localesCollection = this.firestore.collection<Local>('local');
  private mascotasCollection = this.firestore.collection<MascotaPerdida>('mascotas-perdidas');

  constructor(private http: HttpClient, private afAuth: AngularFireAuth, private firestore: AngularFirestore) {}

  // Método para agregar usuario a Firebase
  public agregarUsuarioFirebase(usuario: Usuario): Observable<any> {
    return from(this.firestore.collection('usuarios').add(usuario));
  }

  // Inicio de sesión con Firebase
  public async iniciarSesionFirebase(email: string, password: string) {
    const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user?.uid;
    if (uid) {
      const userDoc = await this.firestore.collection('usuarios').doc(uid).ref.get();
      return userDoc.exists ? userDoc.data() : null;
    }
    return null;
  }

  // Obtener usuario por ID desde Firebase
  public obtenerUsuarioPorIDFirebase(id: string): Observable<Usuario | null> {
    return this.firestore.collection('usuarios').doc(id).get().pipe(
      map(doc => {
        return doc.exists ? (doc.data() as Usuario) : null;
      })
    );
  }

  // Agregar una queja
  agregarQueja(queja: Queja): Observable<any> {
    return this.http.post(this.URL_QUEJAS, queja, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
  }

  // Eliminar una queja
  eliminarQuejaFirebase(quejaId: string): Observable<void> {
    return from(this.firestore.doc(`quejas/${quejaId}`).delete() as Promise<void>);
  }

  // Actualizar una queja
  public actualizarQuejaFirebase(queja: QuejaConID): Observable<Queja> {
    return from(this.firestore.collection('quejas').doc(queja.id).update(queja) as Promise<void>).pipe(
      map(() => queja)
    );
  }

  // Listar quejas
  listarQuejasFirebase(): Observable<QuejaConID[]> {
    return this.firestore.collection('quejas').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Queja;
        const id = a.payload.doc.id;
        return { ...data, id }; // El campo id ahora se agrega después, sin sobreescribir el campo existente
      }))

    );
  }

  // Listar usuarios desde Firebase
public listarUsuariosFirebase(): Observable<UsuarioConID[]> {
  return this.firestore.collection('usuarios').snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data() as Usuario;
      const id = a.payload.doc.id;
      return { ...data, id };
    }))
  );
}

  // Agregar reporte
  agregarReporte(reporte: Reporte): Observable<any> {
    return this.http.post(`${this.URL_REPORTES}`, reporte);
  }

  // Listar reportes
  listarReportes(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${this.URL_REPORTES}`);
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.URL_USUARIO}/${id}`);
  }

  public obtenerUsuarioPorIdFirebase(id: string): Observable<Usuario | null> {
    return this.firestore.collection('usuarios').doc(id).get().pipe(
      map(doc => {
        return doc.exists ? (doc.data() as Usuario) : null;
      })
    );
  }

    // Agregar reporte a Firebase
    public agregarReporteFirebase(reporte: Reporte): Observable<any> {
      return from(this.reportesCollection.add(reporte));
    }

    // Listar reportes desde Firebase
    public listarReportesFirebase(): Observable<Reporte[]> {
      return this.reportesCollection.snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Reporte;
          const id = a.payload.doc.id;
          return { ...data, id };
        }))
      );
    }

    createId(): string {
      return this.firestore.createId();
    }

    // Actualizar reporte en Firebase
    public actualizarReporteFirebase(reporte: Reporte): Observable<void> {
      return from(this.reportesCollection.doc(reporte.id).update(reporte));
    }

    // Eliminar reporte desde Firebase
    public eliminarReporteFirebase(id: string): Observable<void> {
      return from(this.reportesCollection.doc(id).delete());
    }

  // Listar eventos desde Firebase
  public listarEventosFirebase(): Observable<EventoDAO[]> {
    return this.eventosCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Evento;
        const id = a.payload.doc.id;
        return { ...data, id }; // Agrega el ID al evento
      }))
    );
  }

    // Agregar evento a Firebase
    createEvento(evento: Evento): Observable<void> {
      const id = this.firestore.createId(); // Genera un ID único
      const eventoConID: EventoDAO = { ...evento, id }; // Crea un evento con ID
      return from(this.eventosCollection.doc(id).set(eventoConID)); // Guarda el evento con su ID
    }


  // Obtener evento por ID desde Firebase
  getEventoByIDFirebase(id: string): Observable<any> {
    return this.firestore.collection('eventos').doc(id).valueChanges();
  }


  // Actualizar evento en Firebase
  actualizarEventoFirebase(id: string, evento: any): Promise<void> {
    return this.firestore.collection('eventos').doc(id).update(evento) as Promise<void>;
  }

  // Eliminar evento desde Firebase
  eliminarEventoFirebase(id: string): Observable<void> {
    return new Observable<void>((observer) => {
      this.firestore.collection('eventos').doc(id).delete()
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Listar noticias
  listarNoticias(): Observable<Noticias[]> {
    return this.http.get<Noticias[]>(this.URL_NOTICIA);
  }

  // Agregar noticia
  agregarNoticia(newNoticia: Noticias): Observable<Noticias> {
    return this.http.post<Noticias>(`${this.URL_NOTICIA}`, newNoticia);
  }

    // Agregar noticia a Firebase
  public agregarNoticiaFirebase(noticia: Noticias): Observable<any> {
    return from(this.noticiasCollection.add(noticia));
  }


  // Actualizar noticia
  actualizarNoticia(id: number, noticia: Noticias): Observable<Noticias> {
    return this.http.put<Noticias>(`${this.URL_NOTICIA}/${id}`, noticia, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
  }

    // Actualizar noticia en Firebase
  public actualizarNoticiaFirebase(id: string, noticia: Noticias): Observable<void> {
    return from(this.firestore.collection('noticias').doc(id).update(noticia));
  }


  // Eliminar noticia
  eliminarNoticia(id: number): Observable<any> {
    return this.http.delete(`${this.URL_NOTICIA}/${id}`);
  }

    // Eliminar noticia desde Firebase
  public eliminarNoticiaFirebase(id: string): Observable<void> {
    return from(this.firestore.collection('noticias').doc(id).delete());
  }


  // Obtener noticia por ID
  getNoticiasID(idNoticia: Number): Observable<Noticias> {
    return this.http.get<Noticias>(`${this.URL_NOTICIA}/?idNoticia=${idNoticia}`);
  }

    // Obtener noticia por ID desde Firebase
  public obtenerNoticiaPorIDFirebase(id: string): Observable<Noticias | undefined> {
    return this.firestore.collection('noticias').doc(id).valueChanges() as Observable<Noticias | undefined>;
  }


  // Actualizar usuario en Firebase
  public actualizarUsuarioFirebase(usuario: UsuarioConID): Observable<void> {
   return from(this.firestore.collection('usuarios').doc(usuario.id).update(usuario));
}

  // Eliminar usuario desde Firebase
  public eliminarUsuarioFirebase(id: string): Observable<void> {
    return from(this.firestore.collection('usuarios').doc(id).delete());
}

// Método para agregar un local en Firebase
public agregarLocalFirebase(local: Local): Observable<any> {
  return from(this.firestore.collection('locales').add(local));
}

// Método para listar locales de Firebase
public listarLocalesFirebase(): Observable<Local[]> {
  return this.firestore.collection('locales').snapshotChanges().pipe(
    map(actions => actions.map(a => {
      const data = a.payload.doc.data() as Local;
      const id = a.payload.doc.id;
      return { ...data, id };
    }))
  );
}

  // Actualizar un local existente
actualizarLocalFirebase(localId: string, localData: any): Observable<void> {
  return from(this.firestore.collection('locales').doc(localId).update(localData));
}

  // Eliminar un local
eliminarLocalFirebase(localId: string): Observable<void> {
  return from(this.firestore.collection('locales').doc(localId).delete());
}

guardarDocumento(documento: { nombre: string; url: string }) {
  return this.firestore.collection('documentos').add(documento);
}

obtenerDocumentos() {
  return this.firestore.collection('documentos').valueChanges();
}
// Obtener todas las solicitudes
obtenerSolicitudes() {
  return this.firestore.collection<Solicitud>('solicitudes').valueChanges({ idField: 'id' });
}

// Actualizar una solicitud
actualizarSolicitud(id: string, data: Partial<Solicitud>) {
  return this.firestore.collection('solicitudes').doc(id).update(data);
}

solicitarDocumentos2(solicitud: Solicitud) {
return this.firestore.collection('solicitudes').add(solicitud);
}

// Método para listar las mascotas perdidas
public listarMascotasPerdidas(): Observable<MascotaPerdidaConID[]> {
  return this.mascotasCollection.snapshotChanges().pipe(
    switchMap(actions => {
      return new Observable<MascotaPerdidaConID[]>((observer) => {
        const mascotas: MascotaPerdidaConID[] = actions.map(action => {
          const data = action.payload.doc.data() as MascotaPerdida;
          const id = action.payload.doc.id;

          // Convertir la fechaPerdida a Date si es un Timestamp
          if (data.fechaPerdida instanceof Timestamp) {
            data.fechaPerdida = data.fechaPerdida.toDate();  // Convierte Timestamp a Date
          }

          return { ...data, id };
        });

        observer.next(mascotas);
        observer.complete();
      });
    })
  );
}

// Método para eliminar una mascota perdida
public eliminarMascota(id: string): Observable<void> {
  return new Observable<void>((observer) => {
    this.mascotasCollection
      .doc(id)
      .delete()
      .then(() => {
        console.log(`Mascota con ID ${id} eliminada exitosamente.`);
        observer.next();
        observer.complete();
      })
      .catch((error) => {
        console.error(`Error al eliminar la mascota con ID ${id}:`, error);
        observer.error(error);
      });
  });
}


}

