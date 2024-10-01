export interface Evento {
  idEvento: number;
  nombreEvento: string;
  descripcion: string;
  tipoEvento: 'Reuniones Mensuales' | 'Talleres y Charlas'
              |'Actividades Recreativas'|'Limpieza de la Comunidad'
              |'Ferias y Mercados'|'Eventos Culturales'
              |'Campañas de Seguridad'|'Celebraciones Festivas';//categorias
  horaInicio: Date,
  usuario: number;
}
