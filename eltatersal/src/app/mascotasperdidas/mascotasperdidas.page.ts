import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../servicios/api.service';
import { MascotaPerdida, Comentario } from '../modelos/mascotaperdida';
import { MascotasService } from '../servicios/mascotas.service';


@Component({
  selector: 'app-mascotasperdidas',
  templateUrl: './mascotasperdidas.page.html',
  styleUrls: ['./mascotasperdidas.page.scss'],
})
export class MascotasperdidasPage implements OnInit {
  mascotaForm: FormGroup;
  mascotasPerdidas: MascotaPerdida[] = [];
  imagenSeleccionada: File | undefined;
  mostrarFormulario: boolean = false;  // Variable para controlar la visibilidad del formulario


  constructor(private fb: FormBuilder, private apiService: ApiService,private mascotasService: MascotasService) {
    this.mascotaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechaPerdida: ['', Validators.required],
      contacto: ['', Validators.required],
      ubicacionPerdida: ['', Validators.required],
      raza:['',Validators.required]
    });
   }

  ngOnInit() {
    this.listarMascotasPerdidas();
  }

  onSubmit() {
    if (this.mascotaForm.valid) {
      const nuevaMascota: MascotaPerdida = this.mascotaForm.value;
      this.apiService
        .registrarMascotaPerdida(nuevaMascota, this.imagenSeleccionada ?? undefined)
        .subscribe(() => {
          this.mascotaForm.reset();
          this.imagenSeleccionada = undefined;
          this.listarMascotasPerdidas(); // Refresca la lista después de agregar
          this.toggleFormulario();  // Cierra el formulario después de registrar
        });
    }
  }

  onImageSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.imagenSeleccionada = event.target.files[0];
    }
  }

  listarMascotasPerdidas() {
    this.apiService.listarMascotasPerdidas().subscribe((mascotas) => {
      this.mascotasPerdidas = mascotas;
    });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;  // Cambia el valor para mostrar u ocultar el formulario
  }

 // Función para mostrar u ocultar el formulario de comentario
 mostrarFormularioComentario(mascota: MascotaPerdida) {
  mascota.mostrarComentarioFormulario = !mascota.mostrarComentarioFormulario;
}

agregarComentario(mascota: MascotaPerdida) {
  if (mascota.nuevoComentario && mascota.nuevoComentario.trim()) {
    // Verificar que la mascota tenga un ID válido
    if (!mascota.id) {
      console.error('La mascota no tiene un id válido');
      return;
    }
    this.mascotasService.agregarComentario(mascota, mascota.nuevoComentario.trim());
    mascota.nuevoComentario = ''; // Limpiar el campo
    mascota.mostrarComentarioFormulario = false; // Ocultar el formulario
  }
}


}
