import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
} from '@ionic/angular/standalone';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { Playa } from 'src/app/models/playa';
import { PlayaComponent } from 'src/app/shared/components/playa/playa.component';

@Component({
  selector: 'app-playa-view',
  templateUrl: './playa-view.page.html',
  styleUrls: ['./playa-view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
    PlayaComponent,
  ],
})
export class PlayaViewPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private supabaseService = inject(Supabase);
  localRepositoryService = inject(LocalRepositoryService);

  public playa?: Playa;
  public isLoading: boolean = false;
  public esFav: boolean = false;

  private favoritasSub?: Subscription;

  ngOnInit(): void {
    const codPlaya = this.route.snapshot.paramMap.get('codPlaya');
    if (!codPlaya) {
      return;
    }
    this.isLoading = true;
    this.supabaseService.getPlayaByCodPlayaConPrediccion(codPlaya)
      .then((playaDetails) => {
        if (playaDetails && !Array.isArray(playaDetails)) {
          this.playa = playaDetails;
          this.esFav = this.localRepositoryService.esFavorita(this.playa);
        }
      })
      .catch((err) => console.error('Error cargando playa:', err))
      .finally(() => { this.isLoading = false; });

    this.favoritasSub = this.localRepositoryService.favoritas$.subscribe(() => {
      if (this.playa) {
        this.esFav = this.localRepositoryService.esFavorita(this.playa);
      }
    });
  }

  ngOnDestroy(): void {
    this.favoritasSub?.unsubscribe();
  }

  onToggleFavorita(playa: Playa): void {
    const eraFavorita = this.localRepositoryService.esFavorita(playa);
    this.localRepositoryService.toggleFavorita(playa);
    if (!eraFavorita) {
      this.localRepositoryService.deviceId$.subscribe((deviceId) => {
        this.supabaseService.registraDispositivo({
          id_dispositivo: deviceId,
          accion: 'ADD-FAVORITA',
          data: playa.cod_playa,
        }).catch((error) => console.error('Error al registrar dispositivo en Supabase:', error));
      });
    }
  }
}
