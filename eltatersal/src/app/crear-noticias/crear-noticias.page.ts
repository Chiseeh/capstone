import { Component, OnInit } from '@angular/core';
import { Noticias } from '../modelos/noticia';
import { ApiService } from '../servicios/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-noticias',
  templateUrl: './crear-noticias.page.html',
  styleUrls: ['./crear-noticias.page.scss'],
})
export class CrearNoticiasPage  {

  newNoticia: Noticias = {
    idNoticia: 0,
    titulo: "",
    descripcion: "",
    fecha: new Date()
  }

  constructor( private noticiaServicio: ApiService,
    private router: Router) { }

    // creamos una noticio
    crearNoticia(){
      this.noticiaServicio.agregarNoticia(this.newNoticia).subscribe();
      this.router.navigateByUrl("/noticia");
    }

}
