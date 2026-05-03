import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent, IonTitle, IonList, IonItem, IonMenuToggle } from '@ionic/angular/standalone';
import { LocalRepositoryService } from './core/services/local-repository/local-repository.service';
import { async } from 'rxjs';
import { Supabase } from './core/services/supabase/supabase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonItem, IonList, IonTitle, IonContent, IonToolbar, IonHeader, IonApp, IonRouterOutlet, IonMenu, IonMenuToggle],
})
export class AppComponent implements OnInit  {
  constructor(private localRepository: LocalRepositoryService,
    private supabaseService: Supabase,
  ) {}

  ngOnInit() {
  this.localRepository.deviceId$.subscribe((deviceId) => {
      this.supabaseService.registraDispositivo({id_dispositivo: deviceId, accion: 'LOGIN'}).then(() => {
    console.log('Dispositivo registrado en Supabase');
  }).catch((error) => {
    console.error('Error al registrar dispositivo en Supabase:', error);
  });
  });

}
}




