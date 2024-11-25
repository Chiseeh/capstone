import firebase from 'firebase/compat/app';
import { UsuarioConID } from './usuario';

export interface Evento {
  id: string;
  nombreEvento: string;
  descripcion: string;
  tipoEvento:
    | 'Reuniones Mensuales'
    | 'Talleres y Charlas'
    | 'Actividades Recreativas'
    | 'Limpieza de la Comunidad'
    | 'Ferias y Mercados'
    | 'Eventos Culturales'
    | 'Campañas de Seguridad'
    | 'Celebraciones Festivas'; // categorías
  horaInicio: Date;
  imagen: string;
  usuario: string;
  asistentesCount?: number;
  asistentes?: string[];
}

export interface EventoDAO extends Evento {
  id: string; // Cambiar a 'number' en minúsculas
}

export interface EventoParcial extends Partial<Evento> {

}

export interface EventoConUsuario extends UsuarioConID {

}
