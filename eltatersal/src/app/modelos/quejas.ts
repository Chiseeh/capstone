
import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore



export interface Queja {
  id: string;  // ID único para cada queja
  titulo: string;
  descripcion: string;
  categoria: 'seguridad' | 'evento deportivo' | 'infraestructura';  // Tipos de categorías como uniones literales
  idUsuario: string;  // ID del usuario al que pertenece la queja
  estado: 'en proceso' | 'resuelto';
  respuesta?: string; // Nuevo campo opcional
  archivoAdjunto?: string ;
  nombreUsuario?: string;  // Añadir este campo opcional para el nombre del usuario
  fecha: Timestamp;
}

export interface QuejaConID extends Queja {
  id: string;
}
