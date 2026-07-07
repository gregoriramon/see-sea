import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { Evento } from 'src/app/models/evento';
import { FechaPipe } from '../../pipes/fecha-pipe';
import { ColorFechaPipe } from '../../pipes/color-fecha-pipe';
import { fechaEsPasada } from '../../utils/templateUtils';
import { addIcons } from 'ionicons';
import { calendar, calendarOutline, informationCircleOutline } from 'ionicons/icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.scss'],
  standalone: true,
  imports: [IonicModule, FechaPipe, ColorFechaPipe, TranslatePipe],
})
export class EventoComponent {
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private translate = inject(TranslateService);

  @Input() evento!: Evento;
  @Input() esParticularFavorito: boolean = false;
  @Input() mostrarBotonFavorito: boolean = false;
  @Output() toggleFavorito = new EventEmitter<Evento>();

  constructor() {
    addIcons({ calendar, calendarOutline, informationCircleOutline });
  }

  getColorCalendario(): string {
    if (!this.esParticularFavorito) return 'medium';
    return fechaEsPasada(this.evento.fecha_evento) ? 'danger' : 'success';
  }

  async onToggleFavorito(event: Event): Promise<void> {
    event.stopPropagation();

    if (this.esParticularFavorito) {
      const alert = await this.alertController.create({
        header: this.translate.instant('alerts.removeEvento.header'),
        message: this.translate.instant('alerts.removeEvento.message', { name: this.evento.descripcion }),
        buttons: [
          { text: this.translate.instant('common.cancel'), role: 'cancel', handler: () => { } },
          {
            text: this.translate.instant('common.delete'),
            role: 'destructive',
            handler: () => {
              this.toggleFavorito.emit(this.evento);
              this.presentToast(this.translate.instant('toasts.eventoRemoved', { name: this.evento.descripcion }));
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.toggleFavorito.emit(this.evento);
      this.presentToast(this.translate.instant('toasts.eventoAdded', { name: this.evento.descripcion }));
    }
  }

  abrirInfo(event: Event): void {
    event.stopPropagation();
    const url = this.evento.url_info || this.evento.url_inscripcion;
    if (url) {
      window.open(url, '_blank');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'middle',
    });

    await toast.present();
  }
}
