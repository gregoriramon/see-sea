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
    if (!slugOrCod) return;
    const esCodigoLegacy = /^\d+$/.test(slugOrCod);

    // El resolver (playaResolver) puede haber cargado la playa antes del render.
    const preloaded = this.route.snapshot.data['playa'] as Playa | undefined;
    if (preloaded && preloaded.cod_playa) {
      this.onPlayaLoaded(preloaded, esCodigoLegacy);
      return;
    }

    this.isLoading = true;
    const fetchPromise = esCodigoLegacy
      ? this.supabaseService.getPlayaByCodPlayaConPrediccion(slugOrCod)
      : this.supabaseService.getPlayaBySlugConPrediccion(slugOrCod);
    fetchPromise
      .then((playaDetails) => {
        if (playaDetails && !Array.isArray(playaDetails) && playaDetails.cod_playa) {
          this.onPlayaLoaded(playaDetails, esCodigoLegacy);
        }
      })
      .catch((err) => console.error('Error cargando playa:', err))
      .finally(() => { this.isLoading = false; });
  }

  private onPlayaLoaded(playa: Playa, esCodigoLegacy: boolean): void {
    this.playa = playa;
    this.esFav = this.localRepositoryService.esFavorita(playa);
    if (esCodigoLegacy && playa.slug) {
      // Redirect cliente al slug (Fase 4 lo moverá a 301 en el Worker).
      this.router.navigate(['/tabs/playa', playa.slug], { replaceUrl: true });
      return;
    }
    const canonicalPath = `/tabs/playa/${playa.slug ?? playa.cod_playa}`;
    this.seo.setPage({
      title: `Previsión marítima de ${playa.playa}`,
      description: `Estado del mar y previsión meteorológica de la playa ${playa.playa}${playa.municipio ? ' (' + playa.municipio + ')' : ''}: viento, oleaje, temperatura del agua y UV.`,
      canonicalPath,
      ogType: 'article',
    });
    const lat = this.toDecimalDegrees(playa.lat);
    const lon = this.toDecimalDegrees(playa.lon);
    this.seo.setJsonLd('playa-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Beach',
      name: playa.playa,
      url: `${this.seo.getOrigin()}${canonicalPath}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: playa.municipio || undefined,
        addressRegion: playa.provincia || undefined,
        addressCountry: 'ES',
      },
      geo: (lat !== undefined && lon !== undefined) ? {
        '@type': 'GeoCoordinates',
        latitude: lat,
        longitude: lon,
      } : undefined,
      containedInPlace: playa.ccaa ? {
        '@type': 'AdministrativeArea',
        name: playa.ccaa,
      } : undefined,
    });
    this.favoritasSub = this.localRepositoryService.favoritas$.subscribe(() => {
      if (this.playa) {
        this.esFav = this.localRepositoryService.esFavorita(this.playa);
      }
    });
  }

  ngOnDestroy(): void {
    this.favoritasSub?.unsubscribe();
    this.seo.clearJsonLd('playa-jsonld');
  }

  /**
   * Convierte una coordenada a grados decimales.
   * Acepta:
   *   - number: se devuelve tal cual
   *   - string decimal (ej "42.44"): parseFloat
   *   - string DMS con º ' " (ej "42º 26' 53\"" o "-08º 52' 28\""): se convierte
   * Devuelve undefined si no es parseable.
   */
  private toDecimalDegrees(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    const raw = String(value).trim();
    const asFloat = parseFloat(raw);
    if (!isNaN(asFloat) && /^-?\d+(\.\d+)?$/.test(raw.replace(',', '.'))) return asFloat;
    const match = raw.match(/^\s*(-?)\s*(\d+)\s*[º°]\s*(\d+)\s*['′]\s*(\d+(?:\.\d+)?)\s*["″]?\s*$/);
    if (!match) return undefined;
    const [, sign, deg, min, sec] = match;
    const decimal = parseInt(deg, 10) + parseInt(min, 10) / 60 + parseFloat(sec) / 3600;
    const signed = sign === '-' ? -decimal : decimal;
    return Number.isFinite(signed) ? Number(signed.toFixed(6)) : undefined;
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
