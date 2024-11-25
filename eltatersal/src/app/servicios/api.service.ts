import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { Queja, QuejaConID } from '../modelos/quejas';
import {Evento} from '../modelos/eventos'
import { Usuario,UsuarioConID } from '../modelos/usuario';
import { Reporte, ReporteConID } from '../modelos/reporte';
import { map,mergeMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {Noticias, NoticiaConID} from '../modelos/noticia';
import { Solicitud } from '../modelos/solicitud';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { doc, getDoc } from 'firebase/firestore';
import { catchError, switchMap } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore
import { Local, LocalConID } from '../modelos/local';
import { MascotaPerdida,MascotaPerdidaConID } from '../modelos/mascotaperdida';
import { getAuth } from 'firebase/auth';
import * as QRCode from 'qrcode'; // Importa la librería QRCode
import { Asamblea,AsambleaConID } from '../modelos/asamblea';




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
  private asambleaCollection = this.firestore.collection<Asamblea>('asamblea')
  private apiUFUrl = 'https://mindicador.cl/api/uf';
  private apiCliUrl = 'http://api.weatherapi.com/v1/current.json?key=b6c92938cf8f42438d114912242610&q=El%20Bosque%20Region%20Santiago%20de%20Chile&aqi=no'
  private farmaciaApiUrl = 'https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php';





  constructor(private http: HttpClient, private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,private storage: AngularFireStorage ) {}

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

  public ObtenerIdUsuario(): string | null {
    const usuarioActual = localStorage.getItem('usuarioActual');

    // Si no se encuentra el usuario, retorna null
    if (!usuarioActual) {
      return null;
    }

    try {
      const usuario = JSON.parse(usuarioActual);
      return usuario.id ? usuario.id.toString() : null; // Devuelve el ID del usuario como cadena
    } catch (error) {
      console.error('Error al parsear el usuario actual desde localStorage:', error);
      return null;
    }
  }

  public obtenerUsuarioPorIdFirebase(id: string): Observable<Usuario | null> {
    return this.firestore.collection('usuarios').doc(id).get().pipe(
      map(doc => {
        return doc.exists ? (doc.data() as Usuario) : null;
      })
    );
  }

  ObtenerUsuarioActual(): Observable<UsuarioConID | null> {
    return this.afAuth.user.pipe(
      switchMap((user) => {
        if (user) {
          return this.firestore.collection<Usuario>(`usuarios`).doc<Usuario>(user.uid).valueChanges().pipe(
            map((usuario) => {
              if (usuario) {
                return { id: user.uid, ...usuario } as UsuarioConID;
              }
              return null; // Si no se encuentra el usuario en Firestore
            })
          );
        }
        return of(null); // Si no hay usuario, devuelve null
      }),
      catchError((error) => {
        console.error('Error al obtener el usuario actual', error);
        return of(null);
      })
    );
}


  // Método para subir archivos a Firebase Storage
  public subirArchivo(archivo: File): Observable<string> {
    const filePath = `quejas/${new Date().getTime()}_${archivo.name}`;
    const fileRef = this.storage.ref(filePath);
    return new Observable(observer => {
      const task = this.storage.upload(filePath, archivo);
      task.snapshotChanges().subscribe({
        complete: () => {
          fileRef.getDownloadURL().subscribe(url => {
            observer.next(url); // Retornar la URL del archivo subido
            observer.complete();
          });
        },
        error: err => observer.error(err)
      });
    });
  }



  public agregarQueja(queja: Queja, videoBase64?: string): Observable<void> {
    const quejaConID = { ...queja, id: this.firestore.createId() };

    // Si hay un video en base64, convierte a Blob y luego a File, y sube el video
    if (videoBase64) {
      const blob = this.base64ToBlob(videoBase64); // Convertir base64 a Blob
      const file = new File([blob], `video_${quejaConID.id}.mp4`, { type: 'video/mp4' }); // Crear un File a partir del Blob

      return this.subirArchivo(file).pipe(
        mergeMap(videoUrl => {
          quejaConID.archivoAdjunto = videoUrl; // Agrega la URL del video a la queja
          return from(this.quejasCollection.doc(quejaConID.id).set(quejaConID)); // Convierte la promesa en observable
        })
      );
    } else {
      // Si no hay video, simplemente guarda la queja
      return from(this.quejasCollection.doc(quejaConID.id).set(quejaConID)); // Convierte la promesa en observable
    }
  }

  // Función para convertir base64 a Blob
  private base64ToBlob(base64: string, type = 'video/mp4'): Blob {
    const byteCharacters = atob(base64.split(',')[1]); // Decodifica base64
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }


  public actualizarQueja(queja: Queja): Observable<Queja> {
    return this.http.put<Queja>(`${this.URL_QUEJAS}/${queja.id}`, queja, {
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
  }
  // Método para listar las quejas
  listarQuejas(): Observable<QuejaConID[]> {
    return this.quejasCollection.valueChanges({ idField: 'id' }).pipe(
      tap((data) => {
        console.log('Datos de quejas obtenidos:', data); // Verifica qué datos se están obteniendo
      })
    ) as Observable<QuejaConID[]>;
  }

  public listarUsuarios(): Observable<UsuarioConID[]> {
    return this.http.get<UsuarioConID[]>(this.URL_USUARIO);
  }

  // Método para listar eventos
  listarEventos(): Observable<Evento[]> {
    return this.eventosCollection.valueChanges() as Observable<Evento[]>;
  }

   // Método para agregar un evento
   agregarEvento(evento: Evento): Observable<void> {
    const eventoConID = { ...evento, id: this.firestore.createId() };
    return new Observable(observer => {
      this.eventosCollection.doc(eventoConID.id).set(eventoConID)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }

  // Método para obtener un evento por ID
  obtenerEventoPorID(idEvento: string): Observable<Evento | undefined> {
    return this.eventosCollection.doc(idEvento).valueChanges();
  }

 // Método para actualizar un evento
 editarEvento(evento: Evento): Observable<void> {
  return new Observable(observer => {
    this.eventosCollection.doc(evento.id).update(evento)
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch(err => observer.error(err));
  });
}
 // Método para eliminar un evento
 eliminarEvento(idEvento: string): Observable<void> {
  return new Observable(observer => {
    this.eventosCollection.doc(idEvento).delete()
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch(err => observer.error(err));
  });
}


listarNoticias(): Observable<Noticias[]> {
  return this.noticiasCollection.valueChanges({ idField: 'id' }) as Observable<Noticias[]>;
}

  agregarNoticia(newNoticia: Noticias): Observable<void> {
    const noticiaConID = { ...newNoticia, id: this.firestore.createId() };
    return new Observable(observer => {
      this.noticiasCollection.doc(noticiaConID.id).set(noticiaConID)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }

  getNoticiasID(idNoticia: string): Observable<Noticias | undefined> {
    return this.noticiasCollection.doc(idNoticia).valueChanges();
  }



  public listarSolicitudes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/solicitudes');
  }

  private generarId(): string {
    return Math.random().toString(36).substr(2, 9); // Genera un ID aleatorio
  }
  solicitarDocumentos(usuario: UsuarioConID) {
    const nuevaSolicitud: Solicitud = {
      userId: usuario.id,
      documentType: 'Certificado de Residencia',
      aceptada: false,
      documentoId: '', // O deja en undefined si no hay documento todavía
      fecha: Timestamp.now()


    };

    return this.firestore.collection('solicitudes').add(nuevaSolicitud).then((docRef) => {
      // Obtener el ID generado por Firestore
      const idGenerado = docRef.id;

      // Actualizar la solicitud con el ID
      return docRef.update({ id: idGenerado });
    });
  }

  public agregarUsuarioFirebase(usuario: Usuario) {
    return this.afAuth.createUserWithEmailAndPassword(usuario.correo || '', usuario.clave)
      .then((userCredential) => {
        // Almacenar datos adicionales en Firestore bajo la colección "usuarios"
        return this.firestore.collection('usuarios').doc(userCredential.user?.uid).set({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rut: usuario.rut,
          correo: usuario.correo, // Añade el correo aquí
          quejas: usuario.quejas,
          direccion: usuario.direccion,
          admin: usuario.admin,
          qrCode: usuario.qrCode,
        });
      })
      .catch(error => {
        console.error("Error al registrar el usuario:", error.code, error.message);

        // Opcional: Agregar mensajes específicos basados en el código de error
        switch (error.code) {
          case 'auth/email-already-in-use':
            console.error("El correo electrónico ya está en uso.");
            break;
          case 'auth/invalid-email':
            console.error("El correo electrónico es inválido.");
            break;
          case 'auth/operation-not-allowed':
            console.error("El método de autenticación no está habilitado.");
            break;
          case 'auth/weak-password':
            console.error("La contraseña es demasiado débil.");
            break;
          default:
            console.error("Error desconocido:", error);
        }

        throw error; // Propaga el error para manejarlo en el componente
      });
  }

  // Método de inicio de sesión con Firebase
  public async iniciarSesionFirebase(email: string, password: string) {
    const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user?.uid;

    if (uid) {
      // Obtener datos adicionales desde Firestore
      const userDoc = await this.firestore.collection('usuarios').doc(uid).ref.get();
      return userDoc.exists ? userDoc.data() : null;
    }

    return null;
  }

  // Método para agregar reporte a Firebase
  agregarReporte(reporte: Reporte): Observable<void> {
    const reporteConID = { ...reporte, id: this.firestore.createId() };
    return new Observable(observer => {
      this.reportesCollection.doc(reporteConID.id).set(reporteConID)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }

  // Método para listar reportes desde Firebase
  listarReportes(): Observable<Reporte[]> {
    return this.reportesCollection.valueChanges() as Observable<Reporte[]>;
  }

    // Método para obtener reportes desde Firestore
    getReportes(): Observable<Reporte[]> {
      return this.firestore.collection<Reporte>('reportes').valueChanges(); // Cambia 'reportes' por el nombre de tu colección
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
obtenerSolicitudesPorUsuario(userId: string): Observable<Solicitud[]> {
  return this.firestore
    .collection<Solicitud>('solicitudes', ref => ref.where('userId', '==', userId))
    .valueChanges();
}

public actualizarLocal(id: string, data: Partial<Local>): Observable<void> {
  return from(this.firestore.collection('locales').doc(id).update(data)); // Cambia a `from` si utilizas Promises
}

  // Obtener el usuario logueado
  getUsuarioLogueado() {
    const user = getAuth().currentUser;
    return user ? user.uid : null;
  }

// Obtener el local asociado al usuario logueado
async getLocalDeUsuario() {
  const usuarioId = this.getUsuarioLogueado();
  if (!usuarioId) return null;

  // Using Firebase v9+ API's doc() to get DocumentReference
  const localRef = doc(this.firestore.firestore, 'locales', usuarioId); // Use .firestore to access Firebase SDK
  const docSnap = await getDoc(localRef);

  if (docSnap.exists()) {
    return docSnap.data() as LocalConID;
  } else {
    return null;
  }
}




  // Método para obtener los locales
  obtenerLocales(): Observable<any[]> {
    return this.firestore.collection<Local>('local').valueChanges(); // Cambia el endpoint según tu API
  }

  getLocal(localId: string): Observable<Local> {
    return this.firestore.collection<Local>('locales').doc(localId).valueChanges().pipe(
      map(local => {
        // Si local es undefined, lanza un error o devuelve un valor por defecto
        if (!local) {
          throw new Error('Local no encontrado');
        }
        return local;
      })
    );
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


  // Confirmar asistencia a un evento
  public confirmarAsistencia(eventoId: string, usuarioId: string): Observable<void> {
    const docRef = this.eventosCollection.doc(eventoId);
    return from(docRef.get().toPromise()).pipe(
      switchMap((doc) => {
        if (doc && doc.exists) {
          const data = doc.data() as Evento;
          const asistentes = data.asistentes ? [...data.asistentes, usuarioId] : [usuarioId];
          const asistentesCount = (data.asistentesCount || 0) + 1;

          return docRef.update({
            asistentes: asistentes,
            asistentesCount: asistentesCount,
          }).then(() => {
            return;
          });
        } else {
          throw new Error('Evento no encontrado');
        }
      }),
      catchError((error) => {
        console.error("Error al procesar la asistencia:", error);
        throw error;
      })
    );
  }


// SERVICIOS DE API
  getUF(): Observable<any> {
    return this.http.get<any>(this.apiUFUrl);
  }

  getCurrentWeather(): Observable<any> {
    return this.http.get<any>(this.apiCliUrl);
  }

  getLocalesTurnos(): Observable<any[]> {
    return this.http.get<any[]>(this.farmaciaApiUrl).pipe(
      map(data => data.filter(item => item.comuna_nombre === 'EL BOSQUE'))
    );
  }
    // Obtener usuario por ID desde Firebase
    public obtenerUsuarioPorIDFirebase(id: string): Observable<Usuario | null> {
      return this.firestore.collection('usuarios').doc(id).get().pipe(
        map(doc => {
          return doc.exists ? (doc.data() as Usuario) : null;
        })
      );
    }

    obtenerAlertas(): Observable<any> {
      return this.firestore.collection('alertas', ref => ref.orderBy('timestamp', 'desc').limit(1)).valueChanges();
    }

// Método para registrar una mascota perdida
public registrarMascotaPerdida(mascota: MascotaPerdida, imagen?: File): Observable<void> {
  const mascotaConID = { ...mascota, id: this.firestore.createId() };

  // Convertir la fechaPerdida a Timestamp si es un Date
  if (mascotaConID.fechaPerdida instanceof Date) {
    mascotaConID.fechaPerdida = Timestamp.fromDate(mascotaConID.fechaPerdida);  // Convierte Date a Timestamp
  }

  if (imagen) {
    const filePath = `mascotas-perdidas/${new Date().getTime()}_${imagen.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, imagen);

    return from(task).pipe(
      switchMap(() => fileRef.getDownloadURL()),
      mergeMap((url) => {
        mascotaConID.imagenAdjunta = url;
        return from(this.mascotasCollection.doc(mascotaConID.id).set(mascotaConID));
      })
    );
  } else {
    return from(this.mascotasCollection.doc(mascotaConID.id).set(mascotaConID));
  }
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

// Método para generar un QR con la información del usuario
generarQRCode(usuario: Usuario): Promise<string> {
  const usuarioInfo = {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rut: usuario.rut,
    correo: usuario.correo,
    direccion: usuario.direccion,
    tipo: usuario.tipo,
  };

  return QRCode.toDataURL(JSON.stringify(usuarioInfo)); // Genera un QR con la información
}

// Método para agregar un local en Firebase
public agregarAsamblea(Asamblea: Asamblea): Observable<any> {
  return from(this.firestore.collection('asamblea').add(Asamblea));
}

 // Método para listar las quejas
 listarAsamblea(): Observable<AsambleaConID[]> {
  return this.asambleaCollection.valueChanges({ idField: 'id' }).pipe(
    tap((data) => {
      console.log('Datos de quejas obtenidos:', data); // Verifica qué datos se están obteniendo
    })
  ) as Observable<AsambleaConID[]>;
}

public obtenerAsamblea(id: string): Observable<Asamblea | null> {
  return this.asambleaCollection.doc(id).get().pipe(
    map(doc => {
      return doc.exists ? (doc.data() as Asamblea) : null;
    }),
    catchError(error => {
      console.error('Error al obtener la asamblea', error);
      return of(null);
    })
  );
}

public actualizarAsamblea(asamblea: Asamblea): Observable<void> {
  return new Observable(observer => {
    this.asambleaCollection.doc(asamblea.id).update(asamblea)
      .then(() => {
        observer.next();
        observer.complete();
      })
      .catch(err => observer.error(err));
  });
}

public obtenerAsambleaPorId(idAsamblea: string): Observable<Asamblea | undefined> {
  return this.asambleaCollection.doc(idAsamblea).valueChanges();
}


}
