import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol, IonButton, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { PlayaComponent } from 'src/app/shared/components/playa/playa.component';
import { Playa } from 'src/app/models/playa';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { RefresherCustomEvent } from '@ionic/angular';


@Component({
  selector: 'app-favoritas',
  templateUrl: 'favoritas.page.html',
  styleUrls: ['favoritas.page.scss'],
  imports: [IonRefresherContent, IonRefresher, IonContent, HeaderComponent, IonGrid, IonRow, IonCol, PlayaComponent, IonButton],
})
export class FavoritasPage implements OnInit {
  private localRepositoryService = inject(LocalRepositoryService);
  private supabaseService = inject(Supabase);
  private router = inject(Router);

  public favoritas: Playa[] = [];
  public isLoading = true;

  async ngOnInit() {
    // Suscribirse a cambios en favoritas
    this.localRepositoryService.favoritas$.subscribe((favoritas) => {
      this.favoritas = favoritas;
    });

    await this.loadFavoritas();
  }

  async loadFavoritas() {
    this.isLoading = true;
    this.cargarFavoritas();
    await this.refreshFavoritas().then(() => {
      this.isLoading = false;
    });

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

  irABuscar() {
    this.router.navigate(['/tabs/buscar']);
  }

  async refreshFavoritas(): Promise<void> {
    if (this.favoritas.length === 0) {
      return;
    }

    const fechaActual = new Date().setHours(0, 0, 0, 0);
    const updates: Promise<void>[] = [];

    this.favoritas.forEach((playa) => {
      const fechaAComparar = this.getFecha(playa.aemet_date).setHours(0, 0, 0, 0);
      if (fechaAComparar < fechaActual) {
        console.log(`La playa ${playa.playa} tiene datos desactualizados, actualizando...`);
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
  private getFecha(fechaStr: string): Date {
    const anio = parseInt(fechaStr.substring(0, 4));
    const mes = parseInt(fechaStr.substring(4, 6)) - 1; // Restamos 1 porque los meses van de 0 a 11
    const dia = parseInt(fechaStr.substring(6, 8));

    const fechaAComparar = new Date(anio, mes, dia);
    return fechaAComparar;

  }

    handleRefresh(event: RefresherCustomEvent) {
    this.refreshFavoritas().then(() => {
      event.target.complete();
    });
  }
}
