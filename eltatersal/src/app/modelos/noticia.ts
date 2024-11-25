
import { Timestamp } from 'firebase/firestore';  // Importa Timestamp desde Firestore

export interface Noticias {
  idNoticia: string,
  video:string,
  titulo: string,
  imagen?: string,
  descripcion: string,
  fecha: Timestamp;
  verMas?: boolean;
}

export interface NoticiaConID extends  Noticias {
  id: string;
}

export interface Feria {
  comuna: string;
  nombreFeria: string;
  callePrincipal: string;
  calleInicial: string;
  calleFinal: string;
  diasFuncionamiento: string;
  horarioFuncionamiento: string;
}






















