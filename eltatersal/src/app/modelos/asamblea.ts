import { Usuario, UsuarioConID } from "./usuario";
import { Timestamp } from "firebase/firestore";

export interface Asamblea {
  id: string; // Identificador único
  titulo: string; // Nombre o título de la asamblea
  descripcion: string; // Breve descripción de la asamblea
  fecha: Timestamp;
  hora: number; // Hora de inicio
  ubicacion: string; // Lugar donde se llevará a cabo
  participantes: UsuarioConID[]; // Cambiar a UsuarioConID
  qrCodeUrl?: string; // URL del código QR generado para la asistencia
  estado: 'Planeada' | 'En curso' | 'Finalizada'; // Estado de la asamblea
  mostrarQR: Boolean;
  qrdata?: string; // Datos del QR que pueden ser usados para generarlo
}

export interface AsambleaConID extends Asamblea {
  id: string;
}
