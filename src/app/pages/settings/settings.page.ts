import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonSelect, IonSelectOption, IonToggle, IonButton, IonInput, IonNote } from '@ionic/angular/standalone';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { LocalRepositoryService, TabInicial } from 'src/app/core/services/local-repository/local-repository.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    IonContent,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonButton,
    IonInput,
    IonNote,
    HeaderComponent,
  ],
})
export class SettingsPage {
  private localRepository = inject(LocalRepositoryService);
  private location = inject(Location);

  lang: 'es' | 'en' = this.localRepository.obtenerIdioma();
  notificaciones: boolean = this.localRepository.obtenerNotificaciones();
  tabInicial: TabInicial = this.localRepository.obtenerTabInicial();
  email: string = this.localRepository.obtenerEmail();
  emailInvalido = false;

  readonly tabsDisponibles: { value: TabInicial; labelKey: string }[] = [
    { value: 'favoritas', labelKey: 'tabs.prevision' },
    { value: 'buscar', labelKey: 'tabs.playas' },
    { value: 'eventos', labelKey: 'tabs.travesias' },
    { value: 'calendario', labelKey: 'tabs.calendario' },
    { value: 'feedback', labelKey: 'tabs.feedback' },
  ];

  onLangChange(event: CustomEvent) {
    const value = event.detail.value as 'es' | 'en';
    this.localRepository.guardarIdioma(value);
  }

  onNotificacionesChange(event: CustomEvent) {
    this.localRepository.guardarNotificaciones(!!event.detail.checked);
  }

  onTabInicialChange(event: CustomEvent) {
    this.localRepository.guardarTabInicial(event.detail.value as TabInicial);
  }

  onEmailChange(event: CustomEvent) {
    const value = ((event.detail.value as string) ?? '').trim();
    this.email = value;
    if (!value) {
      this.emailInvalido = false;
      this.localRepository.guardarEmail('');
      return;
    }
    if (!EMAIL_REGEX.test(value)) {
      this.emailInvalido = true;
      return;
    }
    this.emailInvalido = false;
    this.localRepository.guardarEmail(value);
  }

  cerrar() {
    this.location.back();
  }
}
