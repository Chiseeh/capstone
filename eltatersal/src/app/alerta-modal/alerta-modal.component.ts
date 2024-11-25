import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alerta-modal',
  templateUrl: './alerta-modal.component.html',
  styleUrls: ['./alerta-modal.component.scss'],
})
export class AlertaModalComponent implements OnInit {
  @Input() mensaje?: string; // Propiedad para recibir el mensaje

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    // Puedes usar esta función para hacer algo cuando se inicializa el modal, si es necesario
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}
