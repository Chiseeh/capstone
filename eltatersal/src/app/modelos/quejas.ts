export interface Queja {
  id: number;  // ID único para cada queja
  titulo: string;
  descripcion: string;
  categoria: 'seguridad' | 'evento deportivo' | 'infraestructura';  // Tipos de categorías como uniones literales
  idUsuario: number;  // ID del usuario al que pertenece la queja
  estado: 'en proceso' | 'resuelto';
  respuesta?: string; // Nuevo campo opcional
}

export interface QuejaConID extends Queja {
  id: number;
}
