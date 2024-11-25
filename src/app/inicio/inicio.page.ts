import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables, ChartType } from 'chart.js';
import { ApiService } from '../servicios/api.service';
import { NavController } from '@ionic/angular'; // Para navegación
import { Queja } from '../modelos/quejas';
import { QuejaConID } from '../modelos/quejas';
import { Reporte } from '../modelos/reporte';
import { Evento } from '../modelos/eventos';
import { EventoDAO } from '../modelos/eventos';
import { AlertController } from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';
import { LoadingController } from '@ionic/angular';
import { MascotaPerdida } from '../modelos/mascotaperdida';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})

export class InicioPage implements OnInit {

  // Propiedades de estadísticas
  cantidadSeguridad: number = 0;
  cantidadEventoDeportivo: number = 0;
  cantidadInfraestructura: number = 0;
  cantidadAccidente: number = 0;
  cantidadActitudSospechosa: number = 0;
  cantidadIncendio: number = 0;
  cantidadMascota: number = 0;
  cantidadRobo: number = 0;
  cantidadRuidosMolestos: number = 0;
  cantidadSalud: number = 0;
  chartQuejas: any;
  chartReportes: any;
  chartQuejasMensuales: any;
  tipoGraficoQuejas: ChartType = 'bar';
  tipoGraficoReportes: ChartType = 'bar';
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  chartQuejasPie: Chart<'pie'> | undefined;
  chartQuejasLine: Chart<'line'> | undefined;
  seccionVisible: string = 'quejas';
  chartReportesMensuales: any;
  chartReportesPie: Chart<'pie'> | undefined;
  chartReportesLine: Chart<'line'> | undefined;
  chartReportesSemanal: any;
  chartReportesDiario: Chart<'line'> | undefined;
  chartReportesCategoria: any;
  chartQuejasSemanal: Chart | null = null;
  chartAsistentes: Chart | null = null;
  mascotasPerdidas: MascotaPerdida[] = [];

  selectedImage: File | null = null;
  reportesDeHoy: Reporte[] = [];
  // Propiedades para modales y reportes
  public modalAbierto: boolean = false;
  public modalDetalleAbierto: boolean = false;
  nuevoReporte: any = {
    direccion: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
  };
  categorias = ['Accidente', 'Robo', 'Salud', 'Incendio', 'Mascota', 'Ruidos Molestos'];
  public reporteSeleccionado: Reporte = {
    id: '',
    direccion: '',
    descripcion: '',
    categoria: '',
    imagenUrl: '',
    fecha: Timestamp.now(),
  };

  isEditMode: boolean = false;
  reporteActualId: string | null = null;




  quejas: Queja[] = [];
  quejasConID: QuejaConID[] = [];
  quejasFiltradas: QuejaConID[] = [];
  quejasFiltradasPorCategoria: { [key: string]: number } = {};
  totalQuejasPendientes: number = 0;
  quejasPendientesPorCategoria: any = {
    seguridad: 0,
    'evento deportivo': 0,
    infraestructura: 0
  };
  quejaSeleccionada: QuejaConID | null = null;
  respuestaAdmin: string = '';
  quejasEnProceso: number = 0;
  quejasResueltas: number = 0;
  isLoading = false;
  searchTerm: string = '';

  // Propiedades del menú
  public sidebarOpen = false;

  eventosProximos: EventoDAO[] = [];
  conteoEventosProximos: number = 0;

  solicitudesPendientes: number = 0;  // Contador de solicitudes pendientes

  constructor(private apiService: ApiService, private navCtrl: NavController, private alertController: AlertController, private loadingController: LoadingController ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.modalDetalleAbierto = false;
    this.obtenerQuejasPendientes();
    this.obtenerReportesDeHoy();
    this.obtenerQuejasParaInicio();;
    this.obtenerEventosProximos();
    this.listarMascotasPerdidas();
    this.cargarSolicitudesPendientes();
  }

  filtrarQuejas() {
    const term = this.searchTerm.toLowerCase();
    this.quejasFiltradas = this.quejas.filter(queja =>
      queja.titulo.toLowerCase().includes(term) ||
      queja.descripcion.toLowerCase().includes(term) ||
      (queja.nombreUsuario && `${queja.nombreUsuario.nombre} ${queja.nombreUsuario.apellido}`.toLowerCase().includes(term))
    );
  }

    // Función para obtener las solicitudes pendientes
    cargarSolicitudesPendientes() {
      this.apiService.obtenerSolicitudes().subscribe(solicitudes => {
        // Filtra las solicitudes no aceptadas
        const solicitudesNoAceptadas = solicitudes.filter(solicitud => !solicitud.aceptada);
        this.solicitudesPendientes = solicitudesNoAceptadas.length;
      });
    }


  obtenerEventosProximos() {
    const hoy = new Date();
    const rangoSemanas = 2;
    const fechaLimite = new Date();
    fechaLimite.setDate(hoy.getDate() + rangoSemanas * 7); // Define el rango de 2 semanas

    this.apiService.listarEventosFirebase().subscribe((eventos) => {
      this.eventosProximos = eventos.filter((evento) => {
        const fechaEvento = new Date(evento.horaInicio); // Usa `horaInicio` como fecha
        return fechaEvento >= hoy && fechaEvento <= fechaLimite;
      });
      this.conteoEventosProximos = this.eventosProximos.length;
    });
  }



  obtenerQuejasParaInicio() {
    this.apiService.listarQuejasFirebase().subscribe((quejas: QuejaConID[]) => {
      // Filtrar las quejas según el estado o cualquier otra condición que necesites
      this.quejasFiltradas = quejas.filter(queja => queja.estado === 'en proceso');
      // Si también necesitas ordenar o aplicar otros filtros adicionales, puedes hacerlo aquí
    });
  }

  obtenerQuejasPendientes() {
    this.apiService.listarQuejasFirebase().subscribe((quejas: QuejaConID[]) => {
      this.quejasConID = quejas; // Asignar las quejas con ID obtenidas
      this.calcularQuejasPendientes();
    });
  }



  calcularQuejasPendientes() {
    // Calcular el total de quejas pendientes
    this.totalQuejasPendientes = this.quejasConID.filter(queja => queja.estado === 'en proceso').length;

    // Calcular las quejas pendientes por categoría
    this.quejasPendientesPorCategoria = this.quejasConID.reduce((acc, queja) => {
      if (queja.estado === 'en proceso') {
        acc[queja.categoria]++;
      }
      return acc;
    }, {
      seguridad: 0,
      'evento deportivo': 0,
      infraestructura: 0
    });
  }

  verDetalleQueja(queja: QuejaConID) {
    this.quejaSeleccionada = queja;
    this.modalDetalleAbierto = true;
    this.respuestaAdmin = '';
  }

  cerrarDetalleQueja() {
    this.quejaSeleccionada = null;
    this.modalDetalleAbierto = false;
  }

  contarQuejasPorEstado() {
    this.quejasEnProceso = this.quejas.filter(queja => queja.estado === 'en proceso').length;
    this.quejasResueltas = this.quejas.filter(queja => queja.estado === 'resuelto').length;
  }

  getFormattedDate(timestamp: any): string {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();  // Devuelve la fecha en un formato legible
  }


  async cargarQuejas() {
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Cargando quejas...',
    });
    await loading.present();

    this.apiService.listarQuejasFirebase().subscribe(
      async (data: QuejaConID[]) => {
        this.quejas = data;

        await Promise.all(
          this.quejas.map(async (queja) => {
            const usuario = await this.apiService.obtenerUsuarioPorIDFirebase(queja.idUsuario).toPromise();
            queja.nombreUsuario = usuario || {
              id: '',
              rut: '',
              correo: '',
              clave: '',
              nombre: '',
              apellido: '',
              quejas: []
            };
          })
        );

        this.contarQuejasPorEstado();
        this.quejasFiltradas = this.quejas;
        this.isLoading = false;
        loading.dismiss();
      },
      (error: any) => {
        console.error('Error al cargar quejas', error);
        this.isLoading = false;
        loading.dismiss();
      }
    );
  }

  cerrarCaso() {
    if (this.quejaSeleccionada) {
      this.quejaSeleccionada.respuesta = this.respuestaAdmin;
      this.quejaSeleccionada.estado = 'resuelto';

      this.apiService.actualizarQuejaFirebase(this.quejaSeleccionada).subscribe(
        () => {
          console.log('Queja actualizada exitosamente');
          this.cerrarDetalleQueja();
          this.cargarQuejas();
        },
        (error: any) => {
          console.error('Error al actualizar la queja', error);
        }
      );
    }
  }

  async eliminarQueja(quejaId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta queja?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.eliminarQuejaFirebase(quejaId).subscribe(
              () => {
                this.quejas = this.quejas.filter(q => q.id !== quejaId);
                this.quejasFiltradas = this.quejasFiltradas.filter(q => q.id !== quejaId);
              },
              (error: any) => {
                console.error('Error eliminando queja:', error);
              }
            );
          },
        },
      ],
    });

    await alert.present();
  }

    // Función para filtrar reportes del día de hoy
    obtenerReportesDeHoy() {
      const today = new Date();
      this.apiService.listarReportesFirebase().subscribe(reportes => {
        this.reportesDeHoy = reportes.filter(reporte => {
          const fechaReporte = new Date(reporte.fecha.toDate());
          return fechaReporte.toDateString() === today.toDateString(); // Compara solo la fecha (sin la hora)
        });
      });
    }

    contarReportesPorCategoria(categoria: string): number {
      return this.reportesDeHoy.filter(reporte => reporte.categoria === categoria).length;
    }

    listarMascotasPerdidas() {
      this.apiService.listarMascotasPerdidas().subscribe((mascotas) => {
        this.mascotasPerdidas = mascotas;
      });
    }

    eliminarMascota(mascota: any) {
      this.alertController.create({
        header: 'Confirmar Eliminación',
        message: `¿Estás seguro de dar por perdido a ${mascota.nombre}?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              console.log('Eliminación cancelada');
            }
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: () => {
              // Eliminar de la lista local
              const index = this.mascotasPerdidas.indexOf(mascota);
              if (index > -1) {
                this.mascotasPerdidas.splice(index, 1);
              }

              // Llamar al servicio para eliminar de la base de datos
              this.apiService.eliminarMascota(mascota.id).subscribe({
                next: () => {
                  console.log(`Mascota con ID ${mascota.id} eliminada correctamente.`);
                },
                error: (err) => {
                  console.error('Error al eliminar la mascota:', err);
                }
              });
            }
          }
        ]
      }).then(alert => {
        alert.present();
      });
    }



    registrarReporte() {
      if (this.isEditMode) {
        console.log('Actualizar reporte:', this.nuevoReporte);
      } else {
        console.log('Nuevo reporte:', this.nuevoReporte);
      }
      this.guardarReporte(); // Llama a la función para guardar o actualizar
      this.cerrarFormulario();
    }

      // Función para ver el detalle de un reporte
  verDetalleReporte(reporte: Reporte) {
    this.reporteSeleccionado = reporte;
    this.modalDetalleAbierto = true;  // Muestra un modal con los detalles del reporte
  }

  // Función para editar un reporte
  editarReporte(reporte: Reporte) {
    this.isEditMode = true;
    this.reporteActualId = reporte.id;
    this.nuevoReporte = { ...reporte };  // Copia del reporte para editar
    this.modalAbierto = true;  // Abre el modal de edición
  }

  // Función para eliminar un reporte
  async eliminarReporte(reporte: Reporte) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Desea eliminar el reporte de ${reporte.direccion}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.eliminarReporteFirebase(reporte.id).subscribe(() => {
              this.obtenerReportesDeHoy();  // Refrescar la lista de reportes después de eliminar
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private resetFormulario() {
    this.nuevoReporte = {
      id: '',
      direccion: '',
      descripcion: '',
      categoria: '',
      imagenUrl: '',
      fecha: Timestamp.now(),
    };
    this.selectedImage = null;
    this.isEditMode = false;
    this.reporteActualId = null;
    this.listarReportes();
  }

  private guardarReporte() {
    if (this.isEditMode && this.reporteActualId !== null) {
        this.apiService.actualizarReporteFirebase(this.nuevoReporte).subscribe(
            () => {
                this.resetFormulario();
            },
            (error) => {
                console.error('Error al actualizar el reporte', error);
            }
        );
    } else {
        this.apiService.agregarReporteFirebase(this.nuevoReporte).subscribe(
            () => {
                this.resetFormulario();
            },
            (error) => {
                console.error('Error al registrar el reporte', error);
            }
        );
    }
}

    // Métodos para abrir y cerrar modales
    abrirFormulario() {
      this.modalAbierto = true;
    }

    cerrarFormulario() {
      this.modalAbierto = false;
      this.nuevoReporte = { direccion: '', descripcion: '', categoria: '', imagenUrl: '' };
    }

    cerrarDetalle() {
      this.modalDetalleAbierto = false;
    }

        // Método para manejar la selección de un archivo
    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.nuevoReporte.imagenUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }



  ngAfterViewInit() {
    this.listarQuejas();
    this.listarReportes();
    this.generarGraficoQuejasMensuales([]); // Inicializa con un arreglo vacío
    this.generarGraficoReportesMensuales([]);
    this.generarGraficoQuejas([]);
    this.generarGraficoReportes();
    this.obtenerEventosProximos();
  }



  // Método para alternar el menú
  toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
      if (menu.classList.contains('open')) {
        menu.classList.remove('open');
      } else {
        menu.classList.add('open');
      }
    } else {
      console.warn('Menu element not found');
    }
  }

  // Función para alternar entre secciones
  mostrarSeccion(seccion: string) {
    this.seccionVisible = seccion;

    if (seccion === 'quejas') {
      this.listarQuejas();
    } else if (seccion === 'reportes') {
      this.listarReportes();
    } else if (seccion === 'eventos') {
      this.listarEventos();
    }

  }

  // Navegación a diferentes páginas
  irAInicio() {
    this.navCtrl.navigateForward('/inicio');
  }

  irAQuejas() {
    this.navCtrl.navigateForward('/quejasadm');
  }

  irAEventos() {
    this.navCtrl.navigateForward('/eventosadm');
  }

  irANoticias() {
    this.navCtrl.navigateForward('/noticiasadm');
  }

  irAReportarSituacion() {
    this.navCtrl.navigateForward('/reportesadm');
  }

  volverAlLogin() {
    this.navCtrl.navigateRoot('/login'); // Asegúrate de que la ruta '/login' sea la correcta
  }

  irAGestionUsuarios() {
    this.navCtrl.navigateForward('/usuariosadm'); // Asegúrate de que esta ruta es la correcta para el CRUD
  }

  irADocumentos() {
    this.navCtrl.navigateForward('/documentosadmfire');
  }

  irALocales() {
    this.navCtrl.navigateForward('/localesadm'); // Ajusta la ruta según corresponda
  }



  listarQuejas() {
    this.apiService.listarQuejasFirebase().subscribe((datos) => {
      this.cantidadSeguridad = datos.filter(queja => queja.categoria === 'seguridad').length;
      this.cantidadEventoDeportivo = datos.filter(queja => queja.categoria === 'evento deportivo').length;
      this.cantidadInfraestructura = datos.filter(queja => queja.categoria === 'infraestructura').length;
      this.generarGraficoQuejas(datos);
      this.generarGraficoQuejasMensuales(datos);
      this.generarGraficoQuejasSemanal(datos);
    });
  }



  listarReportes() {
    this.apiService.listarReportesFirebase ().subscribe((datos) => {
      this.cantidadAccidente = datos.filter(reporte => reporte.categoria === 'Accidente').length;
      this.cantidadActitudSospechosa = datos.filter(reporte => reporte.categoria === 'Actitud Sospechosa').length;
      this.cantidadIncendio = datos.filter(reporte => reporte.categoria === 'Incendio').length;
      this.cantidadMascota = datos.filter(reporte => reporte.categoria === 'Mascota').length;
      this.cantidadRobo = datos.filter(reporte => reporte.categoria === 'Robo').length;
      this.cantidadRuidosMolestos = datos.filter(reporte => reporte.categoria === 'Ruidos Molestos').length;
      this.cantidadSalud = datos.filter(reporte => reporte.categoria === 'Salud').length;
      this.generarGraficoReportesSemanal(datos);
      this.generarGraficoReportesDiario(datos);
      this.generarGraficoReportes();
      this.generarGraficoReportesMensuales(datos);
      this.generarGraficoReportesPorCategoria(datos);
    });
  }

  listarEventos() {
    this.apiService.listarEventosFirebase().subscribe((datos) => {
        this.generarGraficoAsistentes(datos);
    });
}

generarGraficoQuejas(quejas: Queja[]) {
  const ctxBar = document.getElementById('myChartQuejasBarra') as HTMLCanvasElement;

  if (!ctxBar) {
      console.error('El elemento de gráfico de barras no se encontró.');
      return;
  }

  // Si existe un gráfico previo, lo destruimos
  if (this.chartQuejas) {
      this.chartQuejas.destroy();
  }

  // Filtrar quejas en estado 'en proceso'
  const quejasEnProceso = quejas.filter(queja => queja.estado === 'en proceso'); // Filtra solo las quejas en proceso

  // Contar quejas por categoría
  const cantidadSeguridad = quejasEnProceso.filter(queja => queja.categoria === 'seguridad').length;
  const cantidadEventoDeportivo = quejasEnProceso.filter(queja => queja.categoria === 'evento deportivo').length;
  const cantidadInfraestructura = quejasEnProceso.filter(queja => queja.categoria === 'infraestructura').length;

  // Generar gráfico de barras
  this.chartQuejas = new Chart(ctxBar, {
      type: 'bar',
      data: {
          labels: ['Seguridad', 'Evento Deportivo', 'Infraestructura'],
          datasets: [{
              label: 'Cantidad de Quejas en Proceso por Categoría',
              data: [cantidadSeguridad, cantidadEventoDeportivo, cantidadInfraestructura],
              backgroundColor: [
                  'rgba(255, 99, 132)', // Color sólido para Seguridad
                  'rgba(54, 162, 235)', // Color sólido para Evento Deportivo
                  'rgba(75, 192, 192)'  // Color sólido para Infraestructura
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
                  ticks: {
                      stepSize: 1,
                      callback: function(tickValue: string | number) {
                          const numValue = Number(tickValue);
                          return Number.isInteger(numValue) ? numValue : null;
                      }
                  }
              }
          }
      }
  });
}


  generarGraficoReportes() {
    const ctxBar = document.getElementById('myChartReportesBar') as HTMLCanvasElement;
    const ctxPie = document.getElementById('myChartReportesPie') as HTMLCanvasElement;
    const ctxLine = document.getElementById('myChartReportesLine') as HTMLCanvasElement;

    if (!ctxBar || !ctxPie || !ctxLine) {
      console.error('Uno o más elementos de gráfico no se encontraron.');
      return;
    }

    if (this.chartReportes) {
      this.chartReportes.destroy();
    }
    if (this.chartReportesPie) {
      this.chartReportesPie.destroy();
    }
    if (this.chartReportesLine) {
      this.chartReportesLine.destroy();
    }

    this.chartReportes = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Accidente', 'Actitud Sospechosa', 'Incendio', 'Mascota', 'Robo', 'Ruidos Molestos', 'Salud'],
        datasets: [{
          label: 'Cantidad de Reportes por Categoría',
          data: [
            this.cantidadAccidente,
            this.cantidadActitudSospechosa,
            this.cantidadIncendio,
            this.cantidadMascota,
            this.cantidadRobo,
            this.cantidadRuidosMolestos,
            this.cantidadSalud,
          ],
          backgroundColor: [
            'rgba(255, 99, 132)', // Color sólido
            'rgba(54, 162, 235)',
            'rgba(75, 192, 192)',
            'rgba(255, 206, 86)',
            'rgba(153, 102, 255)',
            'rgba(255, 159, 64)',
            'rgba(100, 100, 200)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(100, 100, 200, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(tickValue: string | number) {
                const numValue = Number(tickValue);
                return Number.isInteger(numValue) ? numValue : null;
              }
            }
          }
        }
      }
    });

    this.chartReportesPie = new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels: ['Accidente', 'Actitud Sospechosa', 'Incendio', 'Mascota', 'Robo', 'Ruidos Molestos', 'Salud'],
        datasets: [{
          data: [
            this.cantidadAccidente,
            this.cantidadActitudSospechosa,
            this.cantidadIncendio,
            this.cantidadMascota,
            this.cantidadRobo,
            this.cantidadRuidosMolestos,
            this.cantidadSalud,
          ],
          backgroundColor: [
            'rgba(255, 99, 132)', // Color sólido
            'rgba(54, 162, 235)',
            'rgba(75, 192, 192)',
            'rgba(255, 206, 86)',
            'rgba(153, 102, 255)',
            'rgba(255, 159, 64)',
            'rgba(100, 100, 200)'
          ]
        }]
      },
      options: {}
    });

    this.chartReportesLine = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Accidente', 'Actitud Sospechosa', 'Incendio', 'Mascota', 'Robo', 'Ruidos Molestos', 'Salud'],
        datasets: [{
          label: 'Cantidad de Reportes por Categoría',
          data: [
            this.cantidadAccidente,
            this.cantidadActitudSospechosa,
            this.cantidadIncendio,
            this.cantidadMascota,
            this.cantidadRobo,
            this.cantidadRuidosMolestos,
            this.cantidadSalud,
          ],
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
        }]
      },
      options: {
        elements: {
          line: {
            fill: false
          }
        }
      }
    });
  }

  generarGraficoQuejasMensuales(quejas: Queja[]) {
    const ctx = document.getElementById('myChartQuejasMensuales') as HTMLCanvasElement;
    const diasDelMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(); // Obtiene el número de días del mes actual
    const datosMensuales: number[] = Array(diasDelMes).fill(0); // Inicializa con ceros para cada día del mes actual

    // Obtener el mes actual
    const mesActual = new Date().getMonth(); // Mes actual (0-11)

    // Calcular la cantidad de quejas no resueltas por día del mes actual
    quejas.forEach(queja => {
        const fecha = queja.fecha.toDate(); // Convierte a Date
        const mesQueja = fecha.getMonth(); // Obtiene el mes de la queja (0-11)
        const diaQueja = fecha.getDate(); // Obtiene el día de la queja (1-31)

        // Solo contar si la queja es del mes actual y está "en proceso"
        if (mesQueja === mesActual && queja.estado === 'en proceso') {
            datosMensuales[diaQueja - 1]++; // Incrementa el contador para el día correspondiente
        }
    });

    // Generar gráfico
    if (!ctx) {
        console.error('El elemento del gráfico mensual no se encontró.');
        return;
    }

    if (this.chartQuejasMensuales) {
        this.chartQuejasMensuales.destroy();
    }

    this.chartQuejasMensuales = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: diasDelMes }, (_, i) => (i + 1).toString()), // Crea etiquetas del 1 al número de días del mes
            datasets: [{
                label: 'Quejas No Resueltas por Día del Mes',
                data: datosMensuales,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cantidad de Quejas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Días del Mes'
                    }
                }
            }
        }
    });
}
// Método para generar gráfico de reportes por mes
generarGraficoReportesMensuales(reportes: Reporte[]) {
  const reportesPorMes: number[] = new Array(12).fill(0); // Inicializa un arreglo de 12 meses con 0

  reportes.forEach(reporte => {
    const fecha = new Date(reporte.fecha.toDate());
    const mes = fecha.getMonth(); // Obtiene el mes (0-11)
    reportesPorMes[mes]++; // Incrementa el contador para el mes correspondiente
  });

  // Dibuja el gráfico de reportes mensuales
  const ctx = document.getElementById('myChartReportesMensuales') as HTMLCanvasElement;

  if (!ctx) {
    console.error('El elemento del gráfico de reportes mensuales no se encontró.');
    return; // Detener la ejecución si no se encontró el elemento
  }

  if (this.chartReportesMensuales) {
    this.chartReportesMensuales.destroy();
  }

  this.chartReportesMensuales = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: this.meses,
      datasets: [{
        label: 'Reportes por Mes',
        data: reportesPorMes,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}



  // Gráfico de reportes semanales
  generarGraficoReportesSemanal(reportes: Reporte[]) {
    const ctxSemanal = document.getElementById('myChartReportesSemanal') as HTMLCanvasElement;
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const reportesPorDia = new Array(7).fill(0); // Iniciar en cero para cada día de la semana

    const semanaActual = getWeekNumber(new Date()); // Obtener el número de la semana actual

    reportes.forEach(reporte => {
      const fechaReporte = new Date(reporte.fecha.toDate()); // Asegúrate de que el campo de fecha es correcto
      const semanaReporte = getWeekNumber(fechaReporte); // Obtener el número de semana del reporte

      // Solo contar los reportes de la semana actual
      if (semanaReporte === semanaActual) {
        const diaSemana = fechaReporte.getDay(); // Obtener el día de la semana (0 = domingo)
        reportesPorDia[diaSemana === 0 ? 6 : diaSemana - 1]++; // Ajustar para que 0 sea lunes y 6 sea domingo
      }
    });

    if (this.chartReportesSemanal) {
      this.chartReportesSemanal.destroy();
    }

    this.chartReportesSemanal = new Chart(ctxSemanal, {
      type: 'bar',
      data: {
        labels: diasSemana,
        datasets: [{
          label: 'Reportes Semanales',
          data: reportesPorDia,
          backgroundColor: 'rgba(75, 192, 192)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(value: string | number) {
                return Number.isInteger(value) ? value : null;
              }
            }
          }
        }
      }
    });
  }

  // Gráfico de reportes diarios
  generarGraficoReportesDiario(reportes: Reporte[]) {
    const ctxDiario = document.getElementById('myChartReportesDiario') as HTMLCanvasElement;
    const horasDia = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const reportesPorHora = new Array(24).fill(0); // Inicializar el array con 24 horas

    reportes.forEach(reporte => {
      const fechaReporte = new Date(reporte.fecha.toDate()); // Asegúrate de que el campo de fecha es correcto
      const horaReporte = fechaReporte.getHours();
      reportesPorHora[horaReporte]++;
    });

    if (this.chartReportesDiario) {
      this.chartReportesDiario.destroy();
    }

    this.chartReportesDiario = new Chart(ctxDiario, {
      type: 'line',
      data: {
        labels: horasDia,
        datasets: [{
          label: 'Reportes Diarios',
          data: reportesPorHora,
          fill: false,
          borderColor: 'rgba(153, 102, 255)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  generarGraficoReportesPorCategoria(reportes: Reporte[]) {
    const ctxCategoria = document.getElementById('myChartReportesCategoria') as HTMLCanvasElement;
    const categorias = ['Accidente', 'Robo', 'Salud', 'Actitud Sospechosa', 'Incendio', 'Mascota', 'Ruidos Molestos'];
    const colores = [
      'rgba(255, 99, 132, 0.6)',  // Accidente
      'rgba(54, 162, 235, 0.6)',  // Robo
      'rgba(75, 192, 192, 0.6)',   // Salud
      'rgba(255, 206, 86, 0.6)',   // Actitud Sospechosa
      'rgba(255, 159, 64, 0.6)',    // Incendio
      'rgba(153, 102, 255, 0.6)',  // Mascota
      'rgba(255, 99, 71, 0.6)'      // Ruidos Molestos
    ];

    const reportesPorCategoria = new Array(categorias.length).fill(0); // Inicializar en cero para cada categoría

    // Filtrar los reportes que fueron generados hoy
    const reportesDeHoy = reportes.filter(reporte => esReporteDeHoy(new Date(reporte.fecha.toDate())));

    // Contar reportes por categoría
    reportesDeHoy.forEach(reporte => {
      const categoriaIndex = categorias.indexOf(reporte.categoria);
      if (categoriaIndex !== -1) {
        reportesPorCategoria[categoriaIndex]++;
      }
    });

    if (this.chartReportesCategoria) {
      this.chartReportesCategoria.destroy();
    }

    this.chartReportesCategoria = new Chart(ctxCategoria, {
      type: 'bar',
      data: {
        labels: categorias,
        datasets: [{
          label: 'Reportes por Categoría (Hoy)',
          data: reportesPorCategoria,
          backgroundColor: colores, // Asignar diferentes colores a cada barra
          borderColor: colores.map(color => color.replace('0.6', '1')),
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(value: string | number) {
                return Number.isInteger(value) ? value : null;
              }
            }
          }
        }
      }
    });
  }

  generarGraficoQuejasSemanal(datos: Queja[]) {
    const ctx = document.getElementById('myChartQuejasSemanal') as HTMLCanvasElement;

    if (!ctx) {
        console.error('Elemento de gráfico no encontrado.');
        return;
    }

    // Si el gráfico ya existe, lo destruimos antes de crear uno nuevo
    if (this.chartQuejasSemanal) {
        this.chartQuejasSemanal.destroy();
    }

    // Obtener el número de la semana actual
    const semanaActual = getWeekNumber(new Date());

    // Filtrar las quejas para incluir solo las de la semana actual
    const quejasSemanaActual = datos.filter(queja => {
        const fechaQueja = new Date(queja.fecha.toDate());
        return getWeekNumber(fechaQueja) === semanaActual;
    });

    // Procesar los datos para obtener la cantidad de quejas por cada día de la semana
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const quejasPorDia = new Array(7).fill(0); // Inicializa un array con 7 ceros (uno por cada día)

    quejasSemanaActual.forEach(queja => {
        const fechaQueja = new Date(queja.fecha.toDate());
        const dia = fechaQueja.getDay(); // Obtiene el día de la semana (0 = Domingo, 1 = Lunes, etc.)

        // Ajusta para que 0 (Domingo) sea al final del array
        const diaSemanaIndex = (dia === 0) ? 6 : dia - 1;
        quejasPorDia[diaSemanaIndex]++;
    });

    // Generar el gráfico de barras
    this.chartQuejasSemanal = new Chart(ctx, {
        type: 'bar', // Cambiado a 'bar' para un gráfico de barras
        data: {
            labels: diasSemana,
            datasets: [{
                label: 'Cantidad de Quejas por Día de la Semana',
                data: quejasPorDia,
                backgroundColor: 'rgba(75, 192, 192, 0.5)', // Color de fondo de las barras
                borderColor: 'rgba(75, 192, 192, 1)', // Color del borde de las barras
                borderWidth: 1 // Ancho del borde
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1, // Asegúrate de que los incrementos sean enteros
                        callback: function(tickValue: string | number) {
                            const numValue = Number(tickValue);
                            return Number.isInteger(numValue) ? numValue : null;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true, // Muestra la leyenda
                },
                tooltip: {
                    enabled: true, // Habilita los tooltips
                }
            }
        }
    });
}

generarGraficoAsistentes(eventos: Evento[]) {
  const ctxBar = document.getElementById('myChartAsistentes') as HTMLCanvasElement; // Asegúrate de que el ID sea correcto
  if (this.chartAsistentes) {
    this.chartAsistentes.destroy();
  }

  this.chartAsistentes = new Chart(ctxBar, {
    type: 'bar', // O el tipo de gráfico que necesites
    data: {
      labels: eventos.map(evento => evento.nombreEvento), // Cambié a nombreEvento
      datasets: [{
        label: 'Asistentes',
        data: eventos.map(evento => Math.floor(evento.asistentesCount || 0)), // Usa Math.floor y proporciona un valor predeterminado
        backgroundColor: 'rgba(75, 192, 192, 1)', // Color sólido
        borderColor: 'rgba(75, 192, 192, 1)', // Color de borde sólido
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              const numericValue = typeof value === 'string' ? parseFloat(value) : value; // Asegura que el valor sea numérico
              return Math.floor(numericValue); // Asegura que los valores sean enteros
            }
          }
        }
      }
    }
  });
}


  // Método para alternar el tipo de gráfico de quejas
  toggleTipoGraficoQuejas() {
    this.tipoGraficoQuejas = this.tipoGraficoQuejas === 'bar' ? 'pie' : this.tipoGraficoQuejas === 'pie' ? 'line' : 'bar';
    this.generarGraficoQuejas([]);
  }

  // Método para alternar el tipo de gráfico de reportes
  toggleTipoGraficoReportes() {
    this.tipoGraficoReportes = this.tipoGraficoReportes === 'bar' ? 'pie' : this.tipoGraficoReportes === 'pie' ? 'line' : 'bar';
    this.generarGraficoReportes();
  }

}


  //FUNCIONES

  // Función global mejorada para obtener el número de semana según ISO-8601
  function getWeekNumber(date: Date): number {
    const day = date.getUTCDay() || 7;  // Obtener el día de la semana (Lunes = 1, Domingo = 7)
    date.setUTCDate(date.getUTCDate() + 4 - day);  // Ajustar para que la semana comience en lunes
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));  // Primer día del año
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);  // Calcular el número de semana
    return weekNo;
}

// Función para verificar si el reporte es de hoy
function esReporteDeHoy(fecha: Date): boolean {
  const hoy = new Date();
  return fecha.getDate() === hoy.getDate() &&
         fecha.getMonth() === hoy.getMonth() &&
         fecha.getFullYear() === hoy.getFullYear();
}

