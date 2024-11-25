import { Queja } from "./quejas";

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string; // Nuevo campo
  rut: string;      // Nuevo campo
  correo: string;   // Nuevo campo
  clave: string;
  quejas: Queja[];
  admin?: boolean;
}

export interface UsuarioConID extends Usuario {}
