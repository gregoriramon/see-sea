import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent, IonTitle, IonList, IonItem, IonMenuToggle, AlertController } from '@ionic/angular/standalone';
import { LocalRepositoryService } from './core/services/local-repository/local-repository.service';
import { take } from 'rxjs/operators';
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
  }
}




