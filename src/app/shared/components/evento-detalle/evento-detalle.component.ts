import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import {
  AlertController,
  ToastController,
  ActionSheetController,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Evento } from 'src/app/models/evento';
import { FechaPipe } from '../../pipes/fecha-pipe';
import { ColorFechaPipe } from '../../pipes/color-fecha-pipe';
import { fechaEsPasada } from '../../utils/templateUtils';
import { addIcons } from 'ionicons';
import {
  calendar, calendarOutline, openOutline, shareSocialOutline, logoWhatsapp, mailOutline, copyOutline,
  logoFacebook, logoInstagram, logoTwitter, logoYoutube, logoTiktok,
  informationCircleOutline, createOutline, peopleOutline, trophyOutline, documentTextOutline, earthOutline, globeOutline,
} from 'ionicons/icons';
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
  private actionSheetController = inject(ActionSheetController);
  private translate = inject(TranslateService);

  @Input() evento!: Evento;
  @Input() esParticularFavorito: boolean = false;
  @Input() mostrarBotonFavorito: boolean = false;
  @Output() toggleFavorito = new EventEmitter<Evento>();

  public diaSemana: string = '';
  public esFinde: boolean = false;
  public colorCalendario: string = 'medium';
  public esPasado: boolean = false;
  public redesSociales: { url: string; icono: string; label: string }[] = [];

  constructor() {
    addIcons({
      calendar, calendarOutline, openOutline, shareSocialOutline, logoWhatsapp, mailOutline, copyOutline,
      logoFacebook, logoInstagram, logoTwitter, logoYoutube, logoTiktok,
      informationCircleOutline, createOutline, peopleOutline, trophyOutline, documentTextOutline, earthOutline, globeOutline,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evento']) {
      const fecha = this.parsearFecha(this.evento?.fecha_evento);
      this.diaSemana = this.computarDiaSemana(fecha);
      this.esFinde = this.computarEsFinde(fecha);
      this.esPasado = fechaEsPasada(this.evento?.fecha_evento);
      this.redesSociales = this.parsearRedesSociales(this.evento?.url_redes_sociales);
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

  private parsearRedesSociales(raw: string | undefined | null): { url: string; icono: string; label: string }[] {
    if (!raw) return [];
    const partes = raw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const vistos = new Set<string>();
    const resultado: { url: string; icono: string; label: string }[] = [];
    for (const url of partes) {
      let host = '';
      try {
        host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
      } catch {
        continue;
      }
      const clave = `${host}|${url.replace(/\/$/, '').toLowerCase()}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      const info = this.iconoDeHost(host);
      resultado.push({ url, icono: info.icono, label: info.label });
    }
    const porLabel = new Map<string, { url: string; icono: string; label: string }>();
    for (const item of resultado) {
      if (!porLabel.has(item.label)) porLabel.set(item.label, item);
    }
    return Array.from(porLabel.values());
  }

  private iconoDeHost(host: string): { icono: string; label: string } {
    if (host.includes('facebook.com') || host === 'fb.com') return { icono: 'logo-facebook', label: 'Facebook' };
    if (host.includes('instagram.com')) return { icono: 'logo-instagram', label: 'Instagram' };
    if (host.includes('twitter.com') || host === 'x.com') return { icono: 'logo-twitter', label: 'Twitter' };
    if (host.includes('youtube.com') || host === 'youtu.be') return { icono: 'logo-youtube', label: 'YouTube' };
    if (host.includes('tiktok.com')) return { icono: 'logo-tiktok', label: 'TikTok' };
    return { icono: 'globe-outline', label: host };
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

  async compartir(event: Event): Promise<void> {
    event.stopPropagation();

    const url = this.evento.url_info || this.evento.url_inscripcion || '';
    const fecha = new FechaPipe().transform(this.evento.fecha_evento);
    const lugar = this.evento.municipio
      ? `${this.evento.municipio}${this.evento.provincia ? ' (' + this.evento.provincia + ')' : ''}`
      : (this.evento.lugar_evento ?? '');

    const title = this.translate.instant('components.evento.share.title');
    const text = this.translate.instant('components.evento.share.body', {
      descripcion: this.evento.descripcion ?? '',
      fecha,
      lugar,
      url,
    });

    const appUrl = typeof window !== 'undefined' ? window.location.origin : undefined;

    if (typeof navigator !== 'undefined' && (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({ title, text, url: appUrl });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    const sheet = await this.actionSheetController.create({
      header: title,
      buttons: [
        {
          text: this.translate.instant('components.evento.share.whatsapp'),
          icon: 'logo-whatsapp',
          handler: () => {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          },
        },
        {
          text: this.translate.instant('components.evento.share.email'),
          icon: 'mail-outline',
          handler: () => {
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`;
          },
        },
        {
          text: this.translate.instant('components.evento.share.copy'),
          icon: 'copy-outline',
          handler: async () => {
            try {
              await navigator.clipboard.writeText(text);
              this.presentToast(this.translate.instant('components.evento.share.copied'));
            } catch {
              // ignore
            }
          },
        },
        {
          text: this.translate.instant('common.cancel'),
          role: 'cancel',
        },
      ],
    });

    await sheet.present();
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
