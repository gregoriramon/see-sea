import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol, IonButton, IonRefresher, IonRefresherContent, IonReorderGroup, IonReorder, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { ItemReorderEventDetail } from '@ionic/angular';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { PlayaComponent } from 'src/app/shared/components/playa/playa.component';
import { Playa } from 'src/app/models/playa';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { SeoService } from 'src/app/core/services/seo/seo.service';
import { RefresherCustomEvent } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-favoritas',
  templateUrl: 'favoritas.page.html',
  styleUrls: ['favoritas.page.scss'],
  imports: [IonRefresherContent, IonRefresher, IonContent, HeaderComponent, IonGrid, IonCol, PlayaComponent, IonButton, IonReorderGroup, IonReorder, IonIcon, IonSpinner, TranslatePipe],
})
export class FavoritasPage implements OnInit {
  private localRepositoryService = inject(LocalRepositoryService);
  private supabaseService = inject(Supabase);
  private router = inject(Router);
  private seo = inject(SeoService);

  public favoritas: Playa[] = [];
  public isLoading = true;

  private applySeo(): void {
    this.seo.setPage({
      title: 'Mis playas favoritas',
      description: 'Tus playas favoritas con previsión marítima (viento, oleaje, temperatura del agua) actualizada.',
      canonicalPath: '/tabs/favoritas',
      robots: 'noindex,follow',
    });
  }

  ngOnInit() {
    this.applySeo();
    this.localRepositoryService.favoritas$.subscribe((favoritas) => {
      this.favoritas = favoritas;
    });
  }

  ionViewWillEnter() {
    this.applySeo();
    this.loadFavoritas();
  }

  async loadFavoritas() {
    this.isLoading = true;
    this.cargarFavoritas();
    try {
      await this.refreshFavoritas();
    } catch (error) {
      console.error('Error refrescando favoritas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cargarFavoritas() {
    this.favoritas = this.localRepositoryService.obtenerFavoritas();
  }

  esFavorita(playa: Playa): boolean {
    return this.localRepositoryService.esFavorita(playa);
  }

  onToggleFavorita(playa: Playa) {
      if (!this.esFavorita(playa)) {
        this.supabaseService.getPlayaByCodPlayaConPrediccion(playa.cod_playa).then((playaDetails) => {
          if (playaDetails && !Array.isArray(playaDetails)) {
            playa = playaDetails; // Actualizamos la información de la playa con los detalles completos obtenidos
          }
        });
      }
    this.localRepositoryService.toggleFavorita(playa);
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    const nuevas = ev.detail.complete([...this.favoritas]);
    this.localRepositoryService.reordenarFavoritas(nuevas);
  }

  irABuscar() {
  this.router.navigate(['/tabs/buscar']);
  }

  private static readonly TTL_MS = 12 * 60 * 60 * 1000;

  async refreshFavoritas(force = false): Promise<void> {
    if (this.favoritas.length === 0) {
      return;
    }

    const ahora = Date.now();
    const updates: Promise<void>[] = [];

    this.favoritas.forEach((playa) => {
      const ts = playa.updated_at ? Date.parse(playa.updated_at) : NaN;
      const caducada = isNaN(ts) || (ahora - ts) > FavoritasPage.TTL_MS;
      if (force || caducada) {
        const updatePromise = this.supabaseService.getPlayaByCodPlayaConPrediccion(playa.cod_playa).then((playaDetails) => {
          if (playaDetails) {
            if (!Array.isArray(playaDetails)) {
              this.localRepositoryService.refreshFavorita(playaDetails);
            } else {
              console.warn(`Se esperaba un solo resultado para cod_playa: ${playa.cod_playa}, pero se recibió una lista. No se actualizará la playa.`);
            }
          }
        }).catch((error) => {
          console.error(`Error actualizando favorita ${playa.cod_playa}:`, error);
        });

        updates.push(updatePromise);
      }
    });

    await Promise.all(updates);
  }

  handleRefresh(event: RefresherCustomEvent) {
    this.refreshFavoritas(true).finally(() => {
      event.target.complete();
    });
  }
}
