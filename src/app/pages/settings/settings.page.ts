import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonSelect, IonSelectOption, IonToggle } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';

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
    HeaderComponent,
  ],
})
export class SettingsPage {
  private localRepository = inject(LocalRepositoryService);

  lang: 'es' | 'en' = this.localRepository.obtenerIdioma();
  notificaciones: boolean = this.localRepository.obtenerNotificaciones();

  onLangChange(event: CustomEvent) {
    const value = event.detail.value as 'es' | 'en';
    this.localRepository.guardarIdioma(value);
  }

  onNotificacionesChange(event: CustomEvent) {
    this.localRepository.guardarNotificaciones(!!event.detail.checked);
  }
}
