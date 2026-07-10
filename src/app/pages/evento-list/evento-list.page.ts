import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { Evento } from 'src/app/models/evento';
import { EventoComponent } from 'src/app/shared/components/evento/evento.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import {
  FiltroEventosComponent,
  FiltroEventos,
  RangoFecha,
} from 'src/app/shared/components/filtro-eventos/filtro-eventos.component';
import { normalizeSearch } from 'src/app/shared/utils/templateUtils';
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
  private destroy$ = new Subject<void>();

  public eventos: Evento[] = [];
  private eventosFiltrados: Evento[] = [];
  private eventosAll: Evento[] = [];
  public patterName: string = '';
  public rangoFecha: RangoFecha = '3m';
  public distanciaMin: number | null = null;
  public distanciaMax: number | null = null;
  public codProvincia: string = '**';
  public isLoading: boolean = false;

  private readonly pageSize = 25;
  public visibleCount = this.pageSize;
  public skeletonRows: number[] = Array.from({ length: 6 });

  ngOnInit() {
    this.cargarEventos(this.rangoFecha);
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

  private cargarEventos(rango: RangoFecha) {
    const { meses, esPasado } = this.rangoToInterval(rango);
    const hoy = new Date();
    const otra = new Date();
    otra.setMonth(otra.getMonth() + (esPasado ? -meses : meses));
    const hoyStr = hoy.toISOString().slice(0, 10);
    const otraStr = otra.toISOString().slice(0, 10);
    const fechaIni = esPasado ? otraStr : hoyStr;
    const fechaFin = esPasado ? hoyStr : otraStr;

    const query = esPasado
      ? this.supabaseService.getEventoPasadoByDescripcionAndFecha('', fechaIni, fechaFin)
      : this.supabaseService.getEventoByDescripcionAndFecha('', fechaIni, fechaFin);

    this.isLoading = true;
    query
      .then((eventos) => {
        this.eventosAll = eventos;
        this.refrescarEventos();
        this.isLoading = false;
      })
      .catch((reason) => {
        console.log(reason);
        this.isLoading = false;
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
    const q = normalizeSearch(this.patterName ?? '');
    const min = this.distanciaMin;
    const max = this.distanciaMax;
    const hayMin = min !== null && min !== undefined && !isNaN(min);
    const hayMax = max !== null && max !== undefined && !isNaN(max);

    const filtraProvincia = this.codProvincia && this.codProvincia !== '**';
    const codProvinciaNorm = this.normalizaCodProvincia(this.codProvincia);

    this.eventosFiltrados = this.eventosAll.filter((e) => {
      if (filtraProvincia && this.normalizaCodProvincia(e.cod_provincia) !== codProvinciaNorm) return false;
      if (q) {
        const coincide =
          normalizeSearch(e.descripcion ?? '').includes(q) ||
          normalizeSearch(e.lugar_evento ?? '').includes(q) ||
          normalizeSearch(e.municipio ?? '').includes(q) ||
          normalizeSearch(e.provincia ?? '').includes(q);
        if (!coincide) return false;
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

  onFiltroChange(f: FiltroEventos) {
    const rangoCambio = f.rangoFecha !== this.rangoFecha;
    this.patterName = f.patterName;
    this.distanciaMin = f.distanciaMin;
    this.distanciaMax = f.distanciaMax;
    this.rangoFecha = f.rangoFecha;
    this.codProvincia = f.codProvincia;

    if (rangoCambio) {
      this.cargarEventos(this.rangoFecha);
    } else {
      this.refrescarEventos();
    }
  }
}
