import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore

export interface Reporte {
  id: string;
  direccion: string;
  descripcion: string;
  categoria: string;
  imagenUrl?: string; // Agrega este campo opcional
  fecha: Timestamp;
}

export interface ReporteConID extends  Reporte {
  id: string;
}
