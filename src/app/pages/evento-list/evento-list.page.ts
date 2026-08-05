import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSkeletonText,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import type { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { SeoService } from 'src/app/core/services/seo/seo.service';
import { Evento } from 'src/app/models/evento';
import { EventoComponent } from 'src/app/shared/components/evento/evento.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import {
  FiltroEventosComponent,
  FiltroEventos,
  RangoFecha,
} from 'src/app/shared/components/filtro-eventos/filtro-eventos.component';
import { normalizeSearch, tokenizeSearch } from 'src/app/shared/utils/templateUtils';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-evento-list',
  templateUrl: './evento-list.page.html',
  styleUrls: ['./evento-list.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSkeletonText,
    IonItem,
    IonLabel,
    EventoComponent,
    HeaderComponent,
    FiltroEventosComponent,
    TranslatePipe,
  ],
})
export class EventoListPage implements OnInit, OnDestroy {
  private supabaseService = inject(Supabase);
  private localRepositoryService = inject(LocalRepositoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private seo = inject(SeoService);
  private destroy$ = new Subject<void>();

  public eventos: Evento[] = [];
  private eventosFiltrados: Evento[] = [];
  private eventosAll: Evento[] = [];
  public patterName: string = '';
  public rangoFecha: RangoFecha = '1m';
  public distanciaMin: number | null = null;
  public distanciaMax: number | null = null;
  public codProvincia: string = '**';
  public soloCompeticion: boolean = false;
  public isLoading: boolean = false;

  private readonly pageSize = 25;
  public visibleCount = this.pageSize;
  public skeletonRows: number[] = Array.from({ length: 6 });

  private applySeo(): void {
    this.seo.setPage({
      title: 'Próximas travesías a nado en aguas abiertas',
      description: 'Calendario de travesías a nado en aguas abiertas por España: distancias, fechas y localidades. Encuentra tu próxima carrera.',
      canonicalPath: '/tabs/eventos',
    });
  }

  ngOnInit() {
    this.applySeo();
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      this.patterName = q;
    }
    // Carga inicial diferida a ionViewDidEnter para evitar race con la
    // navegación inicial de AppComponent y la hidratación del cliente Supabase.
  }

  ionViewWillEnter() {
    this.applySeo();
  }

  ionViewDidEnter() {
    if (this.eventosAll.length === 0 && !this.isLoading) {
      this.cargarEventos(this.rangoFecha, 1);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private rangoToInterval(r: RangoFecha): { meses: number; esPasado: boolean } {
    const esPasado = r.startsWith('-');
    const meses = parseInt(r.replace('-', '').replace('m', ''), 10);
    return { meses, esPasado };
  }

  private cargarEventos(rango: RangoFecha, reintentos: number = 0) {
    const { meses, esPasado } = this.rangoToInterval(rango);
    const hoy = new Date();
    const otra = new Date();
    otra.setMonth(otra.getMonth() + (esPasado ? -meses : meses));
    const hoyStr = hoy.toISOString().slice(0, 10);
    const otraStr = otra.toISOString().slice(0, 10);
    const fechaIni = esPasado ? otraStr : hoyStr;
    const fechaFin = esPasado ? hoyStr : otraStr;

    const query = esPasado
      ? this.supabaseService.getEventoPasadoByDescripcionAndFecha('', fechaIni, fechaFin, this.soloCompeticion)
      : this.supabaseService.getEventoByDescripcionAndFecha('', fechaIni, fechaFin, this.soloCompeticion);

    console.log('[evento-list] cargarEventos', { rango, fechaIni, fechaFin, esPasado, t: Date.now() });
    this.isLoading = true;
    query
      .then((eventos) => {
        console.log('[evento-list] cargarEventos OK', { rango, count: eventos.length, reintentos, t: Date.now() });
        if (eventos.length === 0 && reintentos > 0) {
          setTimeout(() => this.cargarEventos(rango, reintentos - 1), 500);
          return;
        }
        this.eventosAll = eventos;
        this.refrescarEventos();
        this.isLoading = false;
      })
      .catch((reason) => {
        console.log('[evento-list] cargarEventos ERROR', reason, { reintentos });
        if (reintentos > 0) {
          setTimeout(() => this.cargarEventos(rango, reintentos - 1), 500);
        } else {
          this.isLoading = false;
        }
      });
  }

  private parseDistancias(raw: string | null | undefined): number[] {
    return raw?.match(/\d+/g)?.map(Number) ?? [];
  }

  private normalizaCodProvincia(cod: string | number | null | undefined): string {
    if (cod === null || cod === undefined || cod === '') return '';
    return String(cod).padStart(2, '0');
  }

  private refrescarEventos() {
    const tokens = tokenizeSearch(this.patterName);
    const min = this.distanciaMin;
    const max = this.distanciaMax;
    const hayMin = min !== null && min !== undefined && !isNaN(min);
    const hayMax = max !== null && max !== undefined && !isNaN(max);

    const filtraProvincia = this.codProvincia && this.codProvincia !== '**';
    const codProvinciaNorm = this.normalizaCodProvincia(this.codProvincia);

    this.eventosFiltrados = this.eventosAll.filter((e) => {
      if (filtraProvincia && this.normalizaCodProvincia(e.cod_provincia) !== codProvinciaNorm) return false;
      if (tokens.length > 0) {
        const haystack = [e.descripcion, e.lugar_evento, e.municipio, e.provincia]
          .map((v) => normalizeSearch(v ?? ''))
          .join(' | ');
        const todosCoinciden = tokens.every((t) => haystack.includes(t));
        if (!todosCoinciden) return false;
      }
      if (hayMin || hayMax) {
        const dists = this.parseDistancias(e.distancia);
        if (dists.length === 0) return false;
        const encaja = dists.some(
          (d) => (!hayMin || d >= (min as number)) && (!hayMax || d <= (max as number)),
        );
        if (!encaja) return false;
      }
      return true;
    });
    this.visibleCount = this.pageSize;
    this.eventos = this.eventosFiltrados.slice(0, this.visibleCount);
  }

  public hayMas(): boolean {
    return this.visibleCount < this.eventosFiltrados.length;
  }

  public onInfinite(ev: InfiniteScrollCustomEvent) {
    this.visibleCount = Math.min(
      this.visibleCount + this.pageSize,
      this.eventosFiltrados.length,
    );
    this.eventos = this.eventosFiltrados.slice(0, this.visibleCount);
    ev.target.complete();
  }

  esFavorito(evento: Evento): boolean {
    return this.localRepositoryService.esFavoritoEvento(evento);
  }

  onToggleFavorito(evento: Evento) {
    this.localRepositoryService.toggleFavoritoEvento(evento);
  }

  onEventoClick(evento: Evento) {
    const path = evento.slug ? ['/tabs/travesia', evento.slug] : ['/tabs/evento', evento.id];
    this.router.navigate(path, { queryParams: { fecha: evento.fecha_evento, origen: 'eventos' } });
  }

  onFiltroChange(f: FiltroEventos) {
    const rangoCambio = f.rangoFecha !== this.rangoFecha;
    const competicionCambio = f.soloCompeticion !== this.soloCompeticion;
    this.patterName = f.patterName;
    this.distanciaMin = f.distanciaMin;
    this.distanciaMax = f.distanciaMax;
    this.rangoFecha = f.rangoFecha;
    this.codProvincia = f.codProvincia;
    this.soloCompeticion = f.soloCompeticion;

    if (rangoCambio || competicionCambio) {
      this.cargarEventos(this.rangoFecha);
    } else {
      this.refrescarEventos();
    }
  }
}
