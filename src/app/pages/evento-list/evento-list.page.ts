import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
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
    IonSpinner,
    IonIcon,
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
  private eventosAll: Evento[] = [];
  public patterName: string = '';
  public rangoFecha: RangoFecha = '3m';
  public distanciaMin: number | null = null;
  public distanciaMax: number | null = null;
  public codProvincia: string = '**';
  public isLoading: boolean = false;

  ngOnInit() {
    this.cargarEventos(this.rangoFecha);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mesesFromRango(r: RangoFecha): number {
    return r === '3m' ? 3 : r === '6m' ? 6 : 12;
  }

  private cargarEventos(rango: RangoFecha) {
    const hoy = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + this.mesesFromRango(rango));
    const fechaIni = hoy.toISOString().slice(0, 10);
    const fechaFin = fin.toISOString().slice(0, 10);

    this.isLoading = true;
    this.supabaseService
      .getEventoByDescripcionAndFecha('', fechaIni, fechaFin)
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

    this.eventos = this.eventosAll.filter((e) => {
      if (filtraProvincia && this.normalizaCodProvincia(e.cod_provincia) !== codProvinciaNorm) return false;
      if (q) {
        const coincide =
          normalizeSearch(e.descripcion ?? '').includes(q) ||
          normalizeSearch(e.lugar_evento ?? '').includes(q) ||
          normalizeSearch(e.organizador ?? '').includes(q);
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
