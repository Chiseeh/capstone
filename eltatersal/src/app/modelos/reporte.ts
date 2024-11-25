
import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore

export interface Reporte {
  id: string;
  direccion: string;
  descripcion: string;
  categoria: string;
  imagenUrl?: string; // Agrega este campo opcional
  fecha: Timestamp;
  urgente?: boolean; // Agrega la propiedad 'urgente' (booleano)
}

export interface ReporteConID extends  Reporte {
  id: string;
}
