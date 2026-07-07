import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonAccordion,
  IonAccordionGroup,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { EventoComponent } from 'src/app/shared/components/evento/evento.component';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { Evento } from 'src/app/models/evento';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

interface GrupoMes {
  clave: string;
  titulo: string;
  eventos: Evento[];
}

@Component({
  selector: 'app-calendario',
  templateUrl: 'calendario.page.html',
  styleUrls: ['calendario.page.scss'],
  imports: [
    CommonModule,
    HeaderComponent,
    EventoComponent,
    IonContent,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    IonButton,
    TranslatePipe,
  ],
})
export class CalendarioPage implements OnInit, OnDestroy {
  private localRepository = inject(LocalRepositoryService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  irABuscar(): void {
    this.router.navigate(['/tabs/eventos']);
  }

  grupos: GrupoMes[] = [];
  mesActualClave = '';
  mesesAbiertos: string[] = [];

  private sub?: Subscription;

  ngOnInit(): void {
    const hoy = new Date();
    this.mesActualClave = this.claveMes(hoy.getFullYear(), hoy.getMonth() + 1);
    this.mesesAbiertos = [this.mesActualClave];

    this.sub = this.localRepository.favoritosEventos$.subscribe((eventos) => {
      this.grupos = this.agrupar(eventos, hoy);
    });

    this.translate.onLangChange.subscribe(() => {
      const eventos = this.grupos.reduce<Evento[]>((acc, g) => acc.concat(g.eventos), []);
      this.grupos = this.agrupar(eventos, new Date());
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onToggleFavorito(evento: Evento): void {
    this.localRepository.toggleFavoritoEvento(evento);
  }

  trackByClave(_: number, g: GrupoMes): string {
    return g.clave;
  }

  onAccordionChange(event: CustomEvent): void {
    const value = event.detail?.value;
    if (Array.isArray(value)) {
      this.mesesAbiertos = value;
    } else if (typeof value === 'string') {
      this.mesesAbiertos = [value];
    } else {
      this.mesesAbiertos = [];
    }
  }

  private agrupar(eventos: Evento[], hoy: Date): GrupoMes[] {
    const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const conFecha = eventos
      .map((ev) => ({ ev, fecha: this.parseFecha(ev.fecha_evento) }))
      .filter((x) => x.fecha && x.fecha >= primerDiaMesActual) as {
        ev: Evento;
        fecha: Date;
      }[];

    conFecha.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    const mapa = new Map<string, GrupoMes>();
    for (const { ev, fecha } of conFecha) {
      const clave = this.claveMes(fecha.getFullYear(), fecha.getMonth() + 1);
      let grupo = mapa.get(clave);
      if (!grupo) {
        grupo = {
          clave,
          titulo: fecha.toLocaleDateString(this.getLocale(), {
            month: 'long',
            year: 'numeric',
          }),
          eventos: [],
        };
        mapa.set(clave, grupo);
      }
      grupo.eventos.push(ev);
    }

    return Array.from(mapa.values());
  }

  private getLocale(): string {
    const lang = this.translate.getCurrentLang() || 'es';
    return lang === 'en' ? 'en-US' : 'es-ES';
  }

  private claveMes(anio: number, mes: number): string {
    return `${anio}-${String(mes).padStart(2, '0')}`;
  }

  private parseFecha(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
      const str = String(value);
      if (str.length === 8) return this.parseAaaaMmDd(str);
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'string') {
      const t = value.trim();
      if (/^\d{8}$/.test(t)) return this.parseAaaaMmDd(t);
      const d = new Date(t);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  private parseAaaaMmDd(str: string): Date {
    return new Date(
      parseInt(str.substring(0, 4), 10),
      parseInt(str.substring(4, 6), 10) - 1,
      parseInt(str.substring(6, 8), 10),
    );
  }
}
