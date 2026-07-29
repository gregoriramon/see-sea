import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
} from '@ionic/angular/standalone';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { SeoService } from 'src/app/core/services/seo/seo.service';
import { Playa } from 'src/app/models/playa';
import { PlayaComponent } from 'src/app/shared/components/playa/playa.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-playa-view',
  templateUrl: './playa-view.page.html',
  styleUrls: ['./playa-view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
    PlayaComponent,
    TranslatePipe,
  ],
})
export class PlayaViewPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(Supabase);
  localRepositoryService = inject(LocalRepositoryService);
  private seo = inject(SeoService);

  public playa?: Playa;
  public isLoading: boolean = false;
  public esFav: boolean = false;

  private favoritasSub?: Subscription;

  ngOnInit(): void {
    const slugOrCod = this.route.snapshot.paramMap.get('slug');
    if (!slugOrCod) {
      return;
    }
    const esCodigoLegacy = /^\d+$/.test(slugOrCod);
    this.isLoading = true;
    const fetch = esCodigoLegacy
      ? this.supabaseService.getPlayaByCodPlayaConPrediccion(slugOrCod)
      : this.supabaseService.getPlayaBySlugConPrediccion(slugOrCod);
    fetch
      .then((playaDetails) => {
        if (playaDetails && !Array.isArray(playaDetails) && playaDetails.cod_playa) {
          this.playa = playaDetails;
          this.esFav = this.localRepositoryService.esFavorita(this.playa);
          if (esCodigoLegacy && this.playa.slug) {
            // Redirect cliente al slug (Fase 4 lo moverá a 301 en el Worker).
            this.router.navigate(['/tabs/playa', this.playa.slug], { replaceUrl: true });
            return;
          }
          this.seo.setPage({
            title: `Previsión marítima de ${this.playa.playa}`,
            description: `Estado del mar y previsión meteorológica de la playa ${this.playa.playa}${this.playa.municipio ? ' (' + this.playa.municipio + ')' : ''}: viento, oleaje, temperatura del agua y UV.`,
            canonicalPath: `/tabs/playa/${this.playa.slug ?? this.playa.cod_playa}`,
            ogType: 'article',
          });
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
