export interface Local {
  nombreLocal: string;
  usuarioId: string;
  descripcion: string;
  hayPan: boolean;
}

export interface LocalConID extends Local {
  id: string;
}
