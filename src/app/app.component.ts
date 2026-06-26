import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent, IonTitle, IonList, IonItem, IonMenuToggle, AlertController, ToastController } from '@ionic/angular/standalone';
import { SwUpdate } from '@angular/service-worker';
import { LocalRepositoryService } from './core/services/local-repository/local-repository.service';
import { filter, take } from 'rxjs/operators';
import { Supabase } from './core/services/supabase/supabase';
import { IosInstallBannerComponent } from './shared/components/ios-install-banner/ios-install-banner.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonItem, IonList, IonTitle, IonContent, IonToolbar, IonHeader, IonApp, IonRouterOutlet, IonMenu, IonMenuToggle, IosInstallBannerComponent],
})
export class AppComponent implements OnInit  {
  private localRepository = inject(LocalRepositoryService);
  private supabaseService = inject(Supabase);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private swUpdate = inject(SwUpdate);

  private readonly INTERVALO_COMPROBACION_MS = 6 * 60 * 60 * 1000;


  async mostrarAcercaDe() {
    const alert = await this.alertController.create({
      header: 'Acerca de',
      message: 'Esto es al acerca de',
      buttons: [{ text: 'Cerrar', role: 'cancel' }],
    });
    await alert.present();
  }

  ngOnInit() {
    this.localRepository.deviceId$.pipe(take(1)).subscribe((deviceId) => {
      try {
        this.supabaseService.registraDispositivo({id_dispositivo: deviceId, accion: 'LOGIN'})
          .then(() => console.log('Dispositivo registrado en Supabase'))
          .catch((error) => console.error('Error al registrar dispositivo en Supabase:', error));
      } catch (error) {
        console.error('Error inesperado registrando dispositivo:', error);
      }
    });

    this.inicializarActualizacionPwa();
  }

  private inicializarActualizacionPwa() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((evt) => evt.type === 'VERSION_READY'))
      .subscribe(() => this.mostrarToastActualizacion());

    this.swUpdate.unrecoverable.subscribe(() => this.mostrarToastRecargaForzada());

    this.swUpdate.checkForUpdate().catch((err) =>
      console.error('Error comprobando actualizacion PWA:', err)
    );
    setInterval(() => {
      this.swUpdate.checkForUpdate().catch((err) =>
        console.error('Error comprobando actualizacion PWA:', err)
      );
    }, this.INTERVALO_COMPROBACION_MS);
  }

  private async mostrarToastActualizacion() {
    const toast = await this.toastController.create({
      message: 'Hay una nueva versión disponible',
      duration: 0,
      position: 'bottom',
      color: 'primary',
      buttons: [
        {
          text: 'Recargar',
          role: 'info',
          handler: () => {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
          },
        },
        { text: 'Ahora no', role: 'cancel' },
      ],
    });
    await toast.present();
  }

  private async mostrarToastRecargaForzada() {
    const toast = await this.toastController.create({
      message: 'La aplicación necesita recargarse para continuar',
      duration: 0,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'Recargar',
          role: 'info',
          handler: () => document.location.reload(),
        },
      ],
    });
    await toast.present();
  }
}




