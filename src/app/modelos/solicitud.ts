import { Usuario, UsuarioConID } from './usuario';
import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore

export interface Solicitud {
  id?: string;               // ID único de la solicitud
  userId: string;           // ID del usuario que hizo la solicitud
  documentoId?: string;     // ID del documento, si lo necesitas
  documentType: string;     // Tipo de documento solicitado
  aceptada?: boolean;       // Estado de la solicitud
  usuario?: UsuarioConID;        // Información del usuario que realizó la solicitud
  documentoSubido?: boolean; // Nueva propiedad para indicar si se subió un documento
  documentoUrl?: string;    // Nueva propiedad para almacenar la URL del documento
  fecha: Timestamp;
  archivo?: File | null; // Añadir esta línea para almacenar el archivo
  archivoSeleccionado?: boolean; // Añadir esta línea para indicar si se ha seleccionado un archivo
}
