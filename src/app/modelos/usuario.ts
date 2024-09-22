import { Queja } from "./quejas";

export interface Usuario {
  nombre: string;
  clave: string;
  quejas: Queja[];  // Relación de uno a muchos (un usuario puede tener muchas quejas)
}

export interface UsuarioConID extends Usuario {
  id: number;
}
