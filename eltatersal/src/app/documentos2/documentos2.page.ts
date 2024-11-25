import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ApiService } from '../servicios/api.service';
import { Solicitud } from '../modelos/solicitud';
import { UsuarioConID, Usuario } from '../modelos/usuario';
import { Timestamp } from 'firebase/firestore'; // Importar Firestore
import jsPDF from 'jspdf'; // Importar jsPDF
import { DocumentReference } from 'firebase/firestore'; // Asegúrate de que este sea el correcto según tu estructura
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-documentos2',
  templateUrl: './documentos2.page.html',
  styleUrls: ['./documentos2.page.scss'],
})
export class Documentos2Page implements OnInit {
  isButtonDisabled = true; // Controla el estado del botón
  usuarioActual: UsuarioConID | null = null; // Usuario autenticado
  solicitudes: Solicitud[] = []; // Almacenar las solicitudes del usuario
  toastOpen = false; // Declarar la propiedad toastOpen
  esPresidenteOAdmin: boolean = false; // Nueva variable para verificar permisos
  admin: any; // Variable para almacenar datos del administrador
  firmaAdmin: any; // Variable para la imagen de la firma
  // Propiedades para el contenido del modal
  modalContent: string = '';
  isModalOpen: boolean = false;
    // Nuevas propiedades para la autorización
  correoPresidente: string = '';
  contrasenaPresidente: string = '';
  autorizado: boolean = false; // Estado de autorización


  constructor(
    private storage: AngularFireStorage,
    private apiService: ApiService,
    private toastController: ToastController,
    private modalController: ModalController,
    private afAuth: AngularFireAuth
    // otros servicios que necesites
  ) {

  }

  ngOnInit() {
    // Obtener el usuario actual
    this.apiService.ObtenerUsuarioActual().subscribe(
      (usuario) => {
        if (usuario) {  // Verificación de que el usuario no sea null
          this.usuarioActual = usuario;
          this.esPresidenteOAdmin = usuario.tipo === 'presidente'; // Verificar si el usuario es presidente o admin

          if (this.esPresidenteOAdmin) {
            // Si es presidente o admin, cargar todas las solicitudes
            this.cargarTodasLasSolicitudes();
          } else {
            // Si es un usuario normal, cargar solo sus solicitudes
            this.cargarSolicitudes(usuario.id);
          }
        } else {
          console.warn('Usuario actual es null');
        }
      },
      (error) => {
        console.error('Error al obtener el usuario actual', error);
      }
    );
  }


  // Método para cargar todas las solicitudes
  cargarTodasLasSolicitudes() {
    this.apiService.obtenerSolicitudes().subscribe((solicitudes) => { // Deshabilitar el botón al iniciar
      this.solicitudes = solicitudes.map((solicitud) => ({
        ...solicitud,
        archivoSeleccionado: false, // Inicializar estado de archivo seleccionado
        archivo: null // Inicializar el archivo
      }));

      // Cargar el usuario para cada solicitud
      this.solicitudes.forEach((solicitud) => {
        this.apiService.obtenerUsuarioPorIDFirebase(solicitud.userId).subscribe((usuario) => {
          console.log('Usuario cargado:', usuario);

          // Asegúrate de que el usuario existe antes de asignarlo
          if (usuario) {
            const solicitudIndex = this.solicitudes.findIndex(s => s.id === solicitud.id);
            if (solicitudIndex !== -1) {
              // Asignar el usuario cargado asegurándote de que es UsuarioConID
              const usuarioConID: UsuarioConID = { ...usuario, id: solicitud.userId }; // Asegúrate de tener el id
              this.solicitudes[solicitudIndex].usuario = usuarioConID; // Asignar el usuario cargado

            }
          } else {
            // Manejo si el usuario no se encuentra
            console.error(`No se encontró el usuario con ID: ${solicitud.userId}`);
          }
        });
      });
    });
  }

// Método para cargar las solicitudes del usuario
cargarSolicitudes(usuarioId: string) {
  if (usuarioId) {
    this.apiService.obtenerSolicitudesPorUsuario(usuarioId).subscribe(
      (solicitudes) => {
        this.solicitudes = solicitudes.map(solicitud => ({
          ...solicitud,
          archivoSeleccionado: false,
          archivo: null,
          documentoSubido: solicitud.documentoSubido || false, // Asegúrate de tener esta propiedad
        }));
      },
      (error) => {
        console.error('Error al obtener las solicitudes', error);
      }
    );
  } else {
    console.warn('El ID del usuario es nulo o indefinido');
  }
}

async mostrarModal(content: string) {
  this.modalContent = content; // Establecer el contenido que deseas mostrar en el modal
  this.isModalOpen = true; // Abrir el modal
}

cerrarModal() {
  this.isModalOpen = false; // Cerrar el modal
}

 // Agrega este método en tu clase Documentos2Page
 async autorizar() {
  try {
    const userCredential = await this.afAuth.signInWithEmailAndPassword(this.correoPresidente, this.contrasenaPresidente);
    console.log('Usuario autorizado:', userCredential.user?.email);
    this.autorizado = true; // Cambia el estado de autorización
    this.isButtonDisabled = false; // Habilitar el botón después de la autorización
  } catch (error) {
    console.error('Error al autorizar:', error);
    // Maneja el error según sea necesario
  }
}


// Método para autenticar al presidente
async autenticarPresidente() {
  if (!this.correoPresidente || !this.contrasenaPresidente) {
    const toast = await this.toastController.create({
      message: 'Por favor, ingresa tu correo y contraseña.',
      duration: 2000,
      color: 'warning',
      position: 'bottom',
    });
    await toast.present();
    return;
  }}


  async solicitarDocumento() {
    if (!this.usuarioActual) {
      console.error('No se encontró un usuario autenticado.');
      const toast = await this.toastController.create({
        message: 'No se encontró un usuario autenticado.',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
      return;
    }


    const nuevaSolicitud: Solicitud = {
      userId: this.usuarioActual.id,
      documentType: 'Certificado de Residencia',
      aceptada: false,
      documentoSubido: false,
      fecha: Timestamp.now()
    };

    try {
      // Enviar la solicitud a Firebase
      const documentRef = await this.apiService.solicitarDocumentos2(nuevaSolicitud);
      nuevaSolicitud.documentoId = documentRef.id; // Asignar solo el ID como string

      await this.generarPDF(nuevaSolicitud); // Llamar al método para generar el PDF

      const toast = await this.toastController.create({
        message: 'Solicitud enviada con éxito.',
        duration: 2000,
        position: 'bottom',
      });
      await toast.present();
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error al enviar la solicitud.',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    } finally {

    }
  }

  async solicitarActaReunion() {
    if (!this.usuarioActual) {
        console.error('No se encontró un usuario autenticado.');
        const toast = await this.toastController.create({
            message: 'No se encontró un usuario autenticado.',
            duration: 2000,
            color: 'danger',
            position: 'bottom',
        });
        await toast.present();
        return;
    }

    const nuevaSolicitud: Solicitud = {
        userId: this.usuarioActual.id,
        documentType: 'Acta de Reunión',
        aceptada: false,
        documentoSubido: false,
        fecha: Timestamp.now()
    };

    try {
        // Enviar la solicitud a Firebase
        const documentRef = await this.apiService.solicitarDocumentos2(nuevaSolicitud);
        nuevaSolicitud.documentoId = documentRef.id; // Asignar solo el ID como string

        await this.generarActaReunionPDF(nuevaSolicitud); // Llamar al método para generar el PDF del acta de reunión

        const toast = await this.toastController.create({
            message: 'Solicitud de Acta de Reunión enviada con éxito.',
            duration: 2000,
            position: 'bottom',
        });
        await toast.present();
    } catch (error) {
        const toast = await this.toastController.create({
            message: 'Error al enviar la solicitud de Acta de Reunión.',
            duration: 2000,
            color: 'danger',
            position: 'bottom',
        });
        await toast.present();
    }
}



  // Método para generar el PDF
  async generarPDF(solicitud: Solicitud) {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Solicitud de Documento', 10, 10);
    doc.text(`Tipo de Documento: ${solicitud.documentType}`, 10, 20);
    doc.text(`ID del Usuario: ${solicitud.userId}`, 10, 30);
    doc.text(`Fecha de Solicitud: ${solicitud.fecha.toDate().toLocaleString()}`, 10, 40);

    // Aquí puedes agregar más información al PDF según sea necesario

    const pdfOutput = doc.output('datauristring');
    // Aquí puedes subir el PDF a Firebase o hacer lo que necesites con el PDF
    console.log('PDF generado:', pdfOutput);

    // Opcional: subir el PDF a Firebase
    // await this.apiService.subirPDF(pdfOutput, solicitud.documentoId);
  }

   // Método para generar el PDF
   async generarActaReunionPDF(solicitud: Solicitud) {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Solicitud de Documento', 10, 10);
    doc.text(`Tipo de Documento: ${solicitud.documentType}`, 10, 20);
    doc.text(`ID del Usuario: ${solicitud.userId}`, 10, 30);
    doc.text(`Fecha de Solicitud: ${solicitud.fecha.toDate().toLocaleString()}`, 10, 40);

    // Aquí puedes agregar más información al PDF según sea necesario

    const pdfOutput = doc.output('datauristring');
    // Aquí puedes subir el PDF a Firebase o hacer lo que necesites con el PDF
    console.log('PDF generado:', pdfOutput);

    // Opcional: subir el PDF a Firebase
    // await this.apiService.subirPDF(pdfOutput, solicitud.documentoId);
  }

  // Método para mostrar el toast
  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: 'warning', // Puedes cambiar el color según prefieras
      position: 'bottom',
    });
    await toast.present();
  }



  async subirDocumentoParaSolicitud(solicitud: Solicitud) {

    if (!this.esPresidenteOAdmin) {
      console.error('Error: El usuario actual no tiene los permisos necesarios.');
      const toast = await this.toastController.create({
        message: 'No tienes permisos para subir este documento.',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
      return;
    }

    // Crear un nuevo PDF
    const pdf = new jsPDF();
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Obtener la fecha actual y formatearla
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.toLocaleString('es-ES', { month: 'long' });
    const año = fechaActual.getFullYear();

    // Agregar la fecha en el formato requerido
    pdf.setFontSize(12);
    pdf.text(`Santiago ${dia} de ${mes} del ${año}`, pageWidth - margin - 90, 10, { align: 'right' });

    // Título y encabezado
    pdf.setFontSize(18);
    pdf.text('CERTIFICADO DE RESIDENCIA', pageWidth / 2, 30, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(
      'La Junta de Vecinos “EL TATTERSAL”, RUT 65.027.007-k, Personalidad Jurídica N° 1131 de la comuna de El Bosque,',
      margin, 40, { maxWidth: pageWidth }
    );
    pdf.text('Certifica que:', margin, 60);

    // Obtener el usuario de la solicitud
    const usuario = solicitud.usuario;

    // Datos del solicitante
    const spaceBetween = 5;
    const señorYRutY = 80;
    const señorText = `Señor(a): ${usuario?.nombre} ${usuario?.apellido}`;
    const rutText = `Rut: ${usuario?.rut}`;

    // Calcular posiciones para "Señor(a)" y "Rut"
    const señorWidth = pdf.getTextDimensions(señorText).w;
    pdf.text(señorText, margin, señorYRutY);
    pdf.text(rutText, margin + señorWidth + 20, señorYRutY);

    pdf.text('Mantiene Domicilio Vigente en:', margin, señorYRutY + spaceBetween);
    const direccionText = ` ${usuario?.direccion || 'Dirección no disponible'}`;
    pdf.text(direccionText, margin, señorYRutY + spaceBetween * 2 + 30);
    pdf.text('Comuna de El Bosque,', margin, señorYRutY + spaceBetween * 2 + 20);

    // Información adicional y firma
    pdf.text(
      'Se extiende el presente certificado a solicitud del interesado para los fines que estime conveniente',
      margin, señorYRutY + spaceBetween * 3 + 40, { maxWidth: pageWidth }
    );
    pdf.text('para los efectos de acreditar domicilio.', margin, señorYRutY + spaceBetween * 3 + 60);
    pdf.text(
      'La validez del certificado es de tres meses a contar de la fecha de su emisión.',
      margin, señorYRutY + spaceBetween * 3 + 80
    );

    // Cambia el texto fijo por el nombre y apellido del administrador
    const nombreCompletoPresidente = `${this.usuarioActual?.nombre} ${this.usuarioActual?.apellido}`;
    pdf.text(nombreCompletoPresidente, pageWidth / 2, 210, { align: 'center' });
    pdf.text('Presidente', pageWidth / 2, 220, { align: 'center' });
    pdf.text('Junta de Vecinos El Tattersal', pageWidth / 2, 230, { align: 'center' });
    pdf.text('Personalidad Jurídica N° 1131 de la comuna de El Bosque', pageWidth / 2, 240, { align: 'center' });

    // Cargar la firma
    const img = new Image();
    const firma = this.usuarioActual?.firma;

    if (firma) {
      img.src = firma;
    } else {
      console.error('Error: La firma del usuario no está disponible.');
      return;
    }

    img.onload = async () => {
      pdf.addImage(img, 'JPEG', (pageWidth - 100) / 2, 250, 100, 50);
      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], 'documento.pdf', { type: 'application/pdf' });

      const storageRef = this.storage.ref(`documentos/${pdfFile.name}`);
      await storageRef.put(pdfFile);

      const downloadURL = await storageRef.getDownloadURL().toPromise();

      // Verifica que 'id' no sea undefined
      if (!solicitud.id) {
        console.error('Error: La solicitud no tiene un id válido.');
        return; // Salir si 'id' es undefined
      }

      await this.apiService.actualizarSolicitud(solicitud.id, {
        documentoSubido: downloadURL,
        aceptada: true,
      });

      const toast = await this.toastController.create({
        message: 'Documento subido exitosamente.',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
    };
  }

  async subirActaReunionParaSolicitud(solicitud: Solicitud) {
    if (!this.esPresidenteOAdmin) {
        console.error('Error: El usuario actual no tiene los permisos necesarios.');
        const toast = await this.toastController.create({
            message: 'No tienes permisos para subir este documento.',
            duration: 2000,
            color: 'danger',
            position: 'bottom',
        });
        await toast.present();
        return;
    }

    const pdf = new jsPDF();
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Fecha actual
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = fechaActual.toLocaleString('es-ES', { month: 'long' });
    const año = fechaActual.getFullYear();
    pdf.setFontSize(12);
    pdf.text(`Santiago ${dia} de ${mes} del ${año}`, pageWidth - margin - 90, 10, { align: 'right' });

    // Título principal
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('ASOCIACION DE VECINOS DE VILLANUEVA DE AVILA D. JOSE ROBLES', pageWidth / 2, margin + 20, { align: 'center' });

    // Subtítulo
    pdf.setFontSize(12);
    pdf.text('Acta de Reunión de Junta Directiva', pageWidth / 2, margin + 30, { align: 'center' });

    // Introducción
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
        'En Villanueva de Ávila, siendo las 19:00 horas del día 21 de Junio de 2014 se reúne la Junta Directiva de la Asociación de Vecinos D. José Robles, en el domicilio social, previa citación realizada y con la asistencia de los siguientes miembros:',
        margin, margin + 40
    );

    // Asistentes
    pdf.setFont("helvetica", "bold");
    pdf.text('Presidente:', margin, margin + 60);
    pdf.setFont("helvetica", "normal");
    pdf.text('D. Juan Parro García', margin + 30, margin + 60);

    pdf.setFont("helvetica", "bold");
    pdf.text('Tesorera:', margin, margin + 70);
    pdf.setFont("helvetica", "normal");
    pdf.text('Dª María Dolores Dávila de Andrés', margin + 30, margin + 70);

    pdf.setFont("helvetica", "bold");
    pdf.text('Secretario:', margin, margin + 80);
    pdf.setFont("helvetica", "normal");
    pdf.text('D. José Manuel Cabrera Gómez', margin + 30, margin + 80);

    // Inasistencias
    pdf.setFont("helvetica", "bold");
    pdf.text('INASISTENCIAS', margin, margin + 95);

    pdf.setFont("helvetica", "bold");
    pdf.text('Vicepresidenta:', margin, margin + 105);
    pdf.setFont("helvetica", "normal");
    pdf.text('Dª María José Ciudad Carrasco', margin + 30, margin + 105);

    pdf.setFont("helvetica", "bold");
    pdf.text('Vocal:', margin, margin + 115);
    pdf.setFont("helvetica", "normal");
    pdf.text('D. José Antonio Muñoz Fernández', margin + 30, margin + 115);

    // Orden del Día
    pdf.setFont("helvetica", "bold");
    pdf.text('Orden del Día', pageWidth / 2, margin + 130, { align: 'center' });
    pdf.setFont("helvetica", "normal");
    pdf.text('1. Revisión, previa al cierre de ejercicio, del Estado de Ingresos y Gastos, así como de la cuenta de Tesorería.', margin, margin + 140);
    pdf.text('2. Planificación de la tradicional Verbena de las fiestas patronales.', margin, margin + 150);
    pdf.text('3. Ruegos y preguntas.', margin, margin + 160);

    // Desarrollo de los puntos
    pdf.setFont("helvetica", "bold");
    pdf.text('Punto 1.', margin, margin + 175);
    pdf.setFont("helvetica", "normal");
    pdf.text(
        'La Sra. Tesorera presenta el Estado de Ingresos y Gastos así como la cuenta de Tesorería, respaldados con sus correspondientes justificantes...',
        margin + 10, margin + 185
    );

    pdf.setFont("helvetica", "bold");
    pdf.text('Punto 2.', margin, margin + 205);
    pdf.setFont("helvetica", "normal");
    pdf.text(
        'El Sr. Presidente informa a la Junta Directiva sobre las gestiones y contrataciones realizadas...',
        margin + 10, margin + 215
    );

    pdf.text(
        'Y no habiendo más asuntos que tratar, siendo las 20:00 horas del día señalado en el encabezamiento se da por finalizada la reunión.',
        margin, margin + 235
    );

    // Firma del secretario
    pdf.setFont("helvetica", "bold");
    pdf.text('El Secretario.', margin, margin + 250);

    // Firma del presidente
    const nombreCompletoPresidente = `${this.usuarioActual?.nombre} ${this.usuarioActual?.apellido}`;
    pdf.text(nombreCompletoPresidente, pageWidth / 2, margin + 260, { align: 'center' });
    pdf.text('Presidente', pageWidth / 2, margin + 270, { align: 'center' });

    // Cargar la firma y agregar al PDF
    const img = new Image();
    const firma = this.usuarioActual?.firma;

    if (firma) {
        img.src = firma;
    } else {
        console.error('Error: La firma del usuario no está disponible.');
        return;
    }

    img.onload = async () => {
        pdf.addImage(img, 'JPEG', (pageWidth - 100) / 2, margin + 280, 100, 50);
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], 'acta_reunion.pdf', { type: 'application/pdf' });

        const storageRef = this.storage.ref(`documentos/${pdfFile.name}`);
        await storageRef.put(pdfFile);

        const downloadURL = await storageRef.getDownloadURL().toPromise();

        if (!solicitud.id) {
            console.error('Error: La solicitud no tiene un id válido.');
            return;
        }

        await this.apiService.actualizarSolicitud(solicitud.id, {
            documentoSubido: downloadURL,
            aceptada: true,
        });

        const toast = await this.toastController.create({
            message: 'Acta de reunión subida exitosamente.',
            duration: 2000,
            color: 'success',
            position: 'bottom',
        });
        await toast.present();
    };
}





 // Método para descargar o abrir el documento
 descargarDocumento(solicitud: Solicitud) {
  const url = solicitud.documentoSubido; // Obtiene la URL del documento

  if (typeof url === 'string' && url) { // Verifica que 'url' sea una cadena no vacía
    window.open(url, '_blank'); // Abre la URL en una nueva pestaña
  } else {
    this.presentToast('El documento no está disponible.'); // Muestra un toast si no hay documento
  }
}
}


