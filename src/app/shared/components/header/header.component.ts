import { Component, Input, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  ActionSheetController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shareOutline, logoWhatsapp, mailOutline, copyOutline } from 'ionicons/icons';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonButton, IonIcon, TranslatePipe]
})
export class HeaderComponent {

  @Input() tituloPagina!: string;
  private static nextId = 0;
  readonly maskId = `logoMask-${++HeaderComponent.nextId}`;

  private actionSheetController = inject(ActionSheetController);
  private toastController = inject(ToastController);
  private translate = inject(TranslateService);

  constructor() {
    addIcons({ shareOutline, logoWhatsapp, mailOutline, copyOutline });
  }

  async compartirApp(): Promise<void> {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const title = this.translate.instant('header.shareTitle');
    const text = this.translate.instant('header.shareBody', { url: appUrl });

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
              await navigator.clipboard.writeText(appUrl);
              const toast = await this.toastController.create({
                message: this.translate.instant('components.evento.share.copied'),
                duration: 2000,
                position: 'middle',
                color: 'primary',
              });
              await toast.present();
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

}
