import { Queja } from "./quejas";

export interface Usuario {

  nombre: string;
  apellido:string;
  rut: string;
  clave: string;
  quejas: Queja[];  // Relación de uno a muchos (un usuario puede tener muchas quejas)
  admin: boolean;
  correo: string; // Campo de correo opcional
  direccion: string;
  firma?: string;
  tipo?: 'presidente' | 'admin' | 'usuario'; // Nuevo campo para rol del usuario
  qrCode?: string; // URL o string del QR generado
  idAsamblea?: string; // Aquí guardas la ID de la asamblea asociada
}

export interface UsuarioConID extends Usuario {
  id: string;
}
