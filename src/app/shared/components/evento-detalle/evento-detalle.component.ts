import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import {
  AlertController,
  ToastController,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Evento } from 'src/app/models/evento';
import { FechaPipe } from '../../pipes/fecha-pipe';
import { ColorFechaPipe } from '../../pipes/color-fecha-pipe';
import { fechaEsPasada } from '../../utils/templateUtils';
import { addIcons } from 'ionicons';
import { calendar, calendarOutline, openOutline } from 'ionicons/icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-evento-detalle',
  templateUrl: './evento-detalle.component.html',
  styleUrls: ['./evento-detalle.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonIcon, FechaPipe, ColorFechaPipe, TranslatePipe],
})
export class EventoDetalleComponent implements OnChanges {
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private translate = inject(TranslateService);

  @Input() evento!: Evento;
  @Input() esParticularFavorito: boolean = false;
  @Input() mostrarBotonFavorito: boolean = false;
  @Output() toggleFavorito = new EventEmitter<Evento>();

  public diaSemana: string = '';
  public esFinde: boolean = false;
  public colorCalendario: string = 'medium';
  public esPasado: boolean = false;

  constructor() {
    addIcons({ calendar, calendarOutline, openOutline });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evento']) {
      const fecha = this.parsearFecha(this.evento?.fecha_evento);
      this.diaSemana = this.computarDiaSemana(fecha);
      this.esFinde = this.computarEsFinde(fecha);
      this.esPasado = fechaEsPasada(this.evento?.fecha_evento);
    }
    if (changes['evento'] || changes['esParticularFavorito']) {
      this.colorCalendario = this.computarColorCalendario();
    }
  }

  private computarColorCalendario(): string {
    if (!this.esParticularFavorito) return 'medium';
    return fechaEsPasada(this.evento.fecha_evento) ? 'danger' : 'success';
  }

  private parsearFecha(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
      const str = String(value);
      if (str.length === 8) {
        return new Date(parseInt(str.substring(0, 4), 10), parseInt(str.substring(4, 6), 10) - 1, parseInt(str.substring(6, 8), 10));
      }
      return new Date(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (/^\d{8}$/.test(trimmed)) {
        return new Date(parseInt(trimmed.substring(0, 4), 10), parseInt(trimmed.substring(4, 6), 10) - 1, parseInt(trimmed.substring(6, 8), 10));
      }
      return new Date(trimmed);
    }
    return null;
  }

  private computarDiaSemana(fecha: Date | null): string {
    if (!fecha || isNaN(fecha.getTime())) return '';
    const lang = this.translate.getCurrentLang() || this.translate.getFallbackLang() || 'es';
    const locale = lang === 'en' ? 'en-US' : 'es-ES';
    const nombre = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(fecha);
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  private computarEsFinde(fecha: Date | null): boolean {
    if (!fecha || isNaN(fecha.getTime())) return false;
    const d = fecha.getDay();
    return d === 0 || d === 6;
  }

  abrirUrl(event: Event, url: string | undefined | null): void {
    event.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
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

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'middle',
      color: 'primary',
    });
    await toast.present();
  }
}
