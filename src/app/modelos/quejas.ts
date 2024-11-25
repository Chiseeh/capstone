import { Timestamp } from 'firebase/firestore';
import { Usuario } from './usuario'; // Importa el modelo de Usuario

export interface Queja {
  id: string;  // ID único de la queja (esencial para Firebase)
  titulo: string;
  descripcion: string;
  categoria: 'seguridad' | 'evento deportivo' | 'infraestructura';  // Tipos de categorías como uniones literales
  idUsuario: string;  // ID del usuario al que pertenece la queja
  estado: 'en proceso' | 'resuelto';
  respuesta?: string; // Nuevo campo opcional
  archivoAdjunto?: string | null; // Nuevo campo opcional para almacenar la imagen o video
  nombreUsuario?: Usuario;  // Añadir este campo opcional para el nombre del usuario
  fecha: Timestamp;
}

export interface QuejaConID extends Queja {
  id: string;
}
