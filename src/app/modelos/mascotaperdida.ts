import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore

export interface Comentario {
  texto: string;
  fecha: Date;
}

export interface MascotaPerdida {
  id: string;  // ID único para cada mascota
  nombre: string;  // Nombre de la mascota
  descripcion: string;  // Descripción de la mascota (ej. características físicas)
  raza: string;  // Raza de la mascota
  estado: 'perdido' | 'encontrado';  // Estado de la mascota
  idUsuario: string;  // ID del usuario al que pertenece la mascota
  nombreUsuario?: string;  // Nombre del usuario asociado
  ubicacionPerdida: string;  // Ubicación donde fue vista por última vez
  fechaPerdida:  Date | any; // Acepta Date o Timestamp  // Fecha en que la mascota se reportó como perdida
  imagenAdjunta?: string;  // Imagen de la mascota
  contacto?: string;  // Añadido para el contacto de la persona que reporta la mascota
  comentarios?: Comentario[]; // Cambiado de string[] a Comentario[]
  mostrarComentarioFormulario?: boolean; // Para mostrar el formulario de comentarios
  nuevoComentario?: string; // El comentario que se está escribiendo
}

export interface MascotaPerdidaConID extends MascotaPerdida {
  id: string;
}
