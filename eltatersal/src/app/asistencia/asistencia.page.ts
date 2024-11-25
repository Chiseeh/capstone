import { Component, ViewChild, OnInit } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { UsuarioConID } from '../modelos/usuario';
import { AlertController,  ToastController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service';
import * as QRCode from 'qrcode'; // Asegúrate de importar QRCode
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Asamblea,AsambleaConID } from '../modelos/asamblea';
import { NavController } from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  @ViewChild(ZXingScannerComponent) scanner!: ZXingScannerComponent;
  public asamblea: Asamblea = {
    id: '',  // Asegúrate de que id siempre tenga un valor
    titulo: '',
    descripcion: '',
    fecha: Timestamp.now(), // Cambiar de Timestamp[] a un solo Timestamp
    hora: 0,
    ubicacion: '',
    participantes: [],
    estado: 'Planeada',
    mostrarQR: false,  // O el valor por defecto que sea apropiado
  };

  usuarioActual: UsuarioConID | null = null; // Usuario actual
  scannedData: string | null = null; // Almacena los datos del QR escaneado
  isScanning: boolean = false; // Controla si el escáner está activo
  allowedFormats = [BarcodeFormat.QR_CODE]; // Solo formatos QR
  qrCodeData: string | null = null; // QR generado
  asambleaForm: FormGroup;
  asambleas: (AsambleaConID & { isScanning: boolean })[] = [];  // Añadimos el campo 'isScanning'
  formVisible: boolean = false; // Controla la visibilidad del formulario

  constructor(private apiSerivce: ApiService, navCTRL: NavController, private fb: FormBuilder,private alertController:AlertController,private toastController: ToastController ) {
    this.asambleaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(300)]],
      fecha: ['', Validators.required],
      hora: [null, [Validators.required, Validators.min(0), Validators.max(23)]],
      ubicacion: ['', Validators.required],
      estado: ['Planeada', Validators.required],
    });
  }

  ngOnInit() {
    // Cargar datos del usuario actual cuando la página se inicialice
    this.obtenerUsuarioActual();
    this.listarAsamblea();
  }

  obtenerUsuarioActual() {
    this.apiSerivce.ObtenerUsuarioActual().subscribe((usuario: UsuarioConID | null) => {
      if (usuario) {
        this.usuarioActual = usuario; // Asignamos el usuario actual
        const asamblea = this.asamblea;  // Obtén la asamblea completa
        if (asamblea) {
          this.generarCodigoQR(usuario, asamblea); // Pasamos la asamblea completa a la función
        } else {
          console.log('No se encontró la asamblea');
        }
      } else {
        console.log('No se encontró usuario actual');
        this.usuarioActual = null;
      }
    });
  }

  async crearAsamblea() {
    if (this.asambleaForm.valid) {
      const nuevaAsamblea = this.asambleaForm.value;
      console.log('Asamblea creada:', nuevaAsamblea);
       this.apiSerivce.agregarAsamblea(nuevaAsamblea)
       const toast = await this.toastController.create({
        message: 'Asamblea generada',
        duration: 2000,
      });
        toast.present()
        this.asambleaForm.reset()
    } else {
      console.log('Formulario no válido');
    }
  }

  listarAsamblea() {
    this.apiSerivce.listarAsamblea().subscribe(
      async (datos) => {
        if (datos) {
          // Añadir el campo isScanning para cada asamblea
          this.asambleas = datos.map(asamblea => ({
            ...asamblea,
            mostrarQR: false,  // Inicializa mostrarQR como false para cada asamblea
            qrdata: `${asamblea.id}`,  // Asigna el ID de la asamblea para el código QR
            isScanning: false  // Inicializamos el estado de escaneo
          }));
          console.log('asambleas', datos);
        }
      },
      (error) => {
        console.error('Error al obtener la lista de asambleas', error);
      }
    );
  }


  generarCodigoQR(usuario: UsuarioConID, asamblea: Asamblea) {
    // Creamos un objeto JSON con los datos del usuario
    const usuarioDatos = {
      asambleaId: asamblea.ubicacion,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rut: usuario.rut,
      correo: usuario.correo
    };

    // Convertimos el objeto JSON a una cadena JSON para el código QR
    const usuarioDatosJSON = JSON.stringify(usuarioDatos);

    // Generamos el código QR con los datos en formato JSON
    QRCode.toDataURL(usuarioDatosJSON)
      .then((qrDataUrl) => {
        this.qrCodeData = qrDataUrl; // Guardamos la URL del QR generado
      })
      .catch((error) => {
        console.error('Error al generar el código QR:', error);
      });
  }



  toggleQrScan(asambleaId: string) {
    // Cambiar el estado de escaneo solo para la asamblea correspondiente
    this.asambleas = this.asambleas.map(asamblea => {
      // Solo cambia el estado de escaneo si el id de la asamblea coincide
      if (asamblea.id === asambleaId) {
        asamblea.isScanning = !asamblea.isScanning;
      } else {
        asamblea.isScanning = false;  // Desactiva el escáner para otras asambleas
      }
      return asamblea;
    });
  }

  onCodeResult(result: string) {
    console.log('Contenido escaneado:', result);
    this.scannedData = result;

    try {
      const usuarioData = JSON.parse(result);
      if (usuarioData && usuarioData.rut) {
        console.log('Datos del usuario escaneado:', usuarioData);

        // Intentar obtener la asamblea desde las asambleas disponibles
        const asambleaSeleccionada = this.asambleas.find(asamblea => asamblea.id === this.asamblea.id);

        if (!asambleaSeleccionada) {
          console.error('No se encontró la asamblea para agregar el participante');
          return;
        }

        this.agregarParticipante(asambleaSeleccionada.id, usuarioData); // Ahora pasamos la asamblea seleccionada
      } else {
        console.error('El QR no contiene un "rut" válido.');
      }
    } catch (error) {
      console.error('Error al parsear el contenido del QR:', error);
    }
  }





   // Función para mostrar/ocultar el formulario
   toggleForm() {
    this.formVisible = !this.formVisible;
  }

  agregarParticipante(asambleaId: string, usuario: UsuarioConID) {
    this.apiSerivce.obtenerAsamblea(asambleaId).subscribe(
      (asamblea) => {
        if (asamblea) {
          // Verificar si el participante ya está registrado en la asamblea
          const yaRegistrado = asamblea.participantes.some(
            (participante: UsuarioConID) => participante.rut === usuario.rut
          );

          if (!yaRegistrado) {
            // Si el usuario no está registrado, se lo agrega a la lista de participantes
            asamblea.participantes.push(usuario);

            // Actualizar la asamblea con el nuevo participante
            this.apiSerivce.actualizarAsamblea(asamblea).subscribe(
              async () => {
                console.log('Participante agregado correctamente');
                const toast = await this.toastController.create({
                  message: `Asistencia marcada para ${usuario.nombre}`,
                  duration: 2000,
                });
                toast.present();
              },
              (error) => {
                console.error('Error al actualizar la asamblea:', error);
              }
            );
          } else {
            console.log('El usuario ya está registrado en esta asamblea.');
          }
        } else {
          console.error('No se encontró la asamblea.');
        }
      },
      (error) => {
        console.error('Error al obtener la asamblea:', error);
      }
    );
  }


}


