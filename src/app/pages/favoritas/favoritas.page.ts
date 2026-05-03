import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonGrid, IonRow, IonCol, IonButton } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { PlayaComponent } from 'src/app/shared/components/playa/playa.component';
import { Playa } from 'src/app/models/playa';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';



@Component({
  selector: 'app-favoritas',
  templateUrl: 'favoritas.page.html',
  styleUrls: ['favoritas.page.scss'],
  imports: [IonContent, HeaderComponent, IonGrid, IonRow, IonCol, PlayaComponent, IonButton],
})
export class FavoritasPage implements OnInit {
  public favoritas: Playa[] = [];

  constructor(
  private localRepositoryService: LocalRepositoryService,
    private supabaseService: Supabase,
    private router: Router
  ) { }

  ngOnInit() {
    // Suscribirse a cambios en favoritas
    this.localRepositoryService.favoritas$.subscribe((favoritas) => {
      this.favoritas = favoritas;
    });
    this.refreshFavoritas();
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

  refreshFavoritas() {
     if (this.favoritas.length != 0) {
        const fechaActual = new Date().setHours(0, 0, 0, 0); // Normalizamos la fecha actual a medianoche para comparar solo la fecha sin hora
        this.favoritas.forEach(playa => {
          const fechaAComparar = this.getFecha(playa.aemet_date).setHours(0, 0, 0, 0); // Normalizamos la fecha de la playa a medianoche para comparar solo la fecha sin hora
          // Comparar usando operadores lógicos
          if (fechaAComparar < fechaActual) {
            console.log("La playa ".concat(playa.playa).concat(" tiene datos desactualizados, actualizando..."));
            this.supabaseService.getPlayaByCodPlayaConPrediccion(playa.cod_playa).then((playaDetails) => {
              if (playaDetails) {
                    if (!Array.isArray(playaDetails)) {
                      this.localRepositoryService.refreshFavorita(playaDetails);
                    } else {
                      console.warn("Se esperaba un solo resultado para cod_playa: ".concat(playa.cod_playa).concat(", pero se recibió una lista. No se actualizará la playa."));
                    }               }
            });
          }
        });
      }
  }
  private getFecha(fechaStr: string): Date {
    const anio = parseInt(fechaStr.substring(0, 4));
    const mes = parseInt(fechaStr.substring(4, 6)) - 1; // Restamos 1 porque los meses van de 0 a 11
    const dia = parseInt(fechaStr.substring(6, 8));

    const fechaAComparar = new Date(anio, mes, dia);
    return fechaAComparar;

  }
}
