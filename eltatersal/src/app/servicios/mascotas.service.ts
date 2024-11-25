import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MascotaPerdida, Comentario } from '../modelos/mascotaperdida';

@Injectable({
  providedIn: 'root',
})
export class MascotasService {
  private collectionName = 'mascotas-perdidas'; // Nombre de la colección en Firebase

  constructor(private firestore: AngularFirestore) {}

  // Método para agregar un comentario a una mascota perdida
  async agregarComentario(mascota: MascotaPerdida, textoComentario: string) {
    const nuevoComentario: Comentario = {
      texto: textoComentario,
      fecha: new Date(),
    };

    // Si ya existen comentarios, los agregamos al array, si no, creamos un nuevo array
    const updatedComentarios = mascota.comentarios ? [...mascota.comentarios, nuevoComentario] : [nuevoComentario];

    try {
      // Actualizar la mascota en la colección de Firestore con los nuevos comentarios
      await this.firestore
        .collection(this.collectionName)
        .doc(mascota.id) // Usar el ID de la mascota para actualizar el documento
        .update({ comentarios: updatedComentarios });

      console.log('Comentario guardado en Firebase');
    } catch (error) {
      console.error('Error al guardar el comentario:', error);
    }
  }
}
