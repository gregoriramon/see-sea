import { Component, DOCUMENT, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
} from '@ionic/angular/standalone';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { SeoService } from 'src/app/core/services/seo/seo.service';
import { Evento } from 'src/app/models/evento';
import { EventoDetalleComponent } from 'src/app/shared/components/evento-detalle/evento-detalle.component';
import { TranslatePipe } from '@ngx-translate/core';

const JSONLD_ID = 'evento-jsonld';

@Component({
  selector: 'app-evento-view',
  templateUrl: './evento-view.page.html',
  styleUrls: ['./evento-view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
    EventoDetalleComponent,
    TranslatePipe,
  ],
})
export class EventoViewPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(Supabase);
  localRepositoryService = inject(LocalRepositoryService);
  private seo = inject(SeoService);

  constructor(@Inject(DOCUMENT) private document: Document) {}

  public evento?: Evento;
  public isLoading: boolean = false;
  public esFav: boolean = false;
  public backHref: string = '/tabs/eventos';

  private favoritosSub?: Subscription;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (!slug && (!id || isNaN(id))) {
      return;
    }

    const fechaParam = this.route.snapshot.queryParamMap.get('fecha');
    const origen = this.route.snapshot.queryParamMap.get('origen');
    this.backHref = origen === 'calendario' ? '/tabs/calendario' : '/tabs/eventos';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const esPasado = fechaParam ? new Date(fechaParam) < hoy : false;
    // El resolver puede haber cargado el evento antes del render.
    const preloaded = this.route.snapshot.data['evento'] as Evento | undefined;
    if (preloaded) {
      this.onEventoLoaded(preloaded, slug, fechaParam);
      return;
    }

    this.isLoading = true;

    const promesa: Promise<Evento | null> = slug
      ? (esPasado
          ? this.supabaseService.getEventoPasadoBySlug(slug)
          : this.supabaseService.getEventoBySlug(slug))
      : (esPasado
          ? this.supabaseService.getEventoPasadoById(id)
          : this.supabaseService.getEventoById(id));

    promesa
      .then((evento) => {
        if (evento) this.onEventoLoaded(evento, slug, fechaParam);
      })
      .catch((err) => console.error('Error cargando evento:', err))
      .finally(() => { this.isLoading = false; });
  }

  private onEventoLoaded(evento: Evento, slug: string | null, fechaParam: string | null): void {
    this.evento = evento;
    this.esFav = this.localRepositoryService.esFavoritoEvento(evento);

    // Redirect legacy /tabs/evento/:id → /tabs/travesia/:slug
    if (!slug && evento.slug) {
      const queryParams = { ...this.route.snapshot.queryParams };
      this.router.navigate(['/tabs/travesia', evento.slug], { replaceUrl: true, queryParams });
      return;
    }

    const nombre = evento.descripcion || 'Travesía a nado';
    const localidad = evento.lugar_evento || evento.municipio || '';
    const fecha = evento.fecha_evento || fechaParam || '';
    const canonicalPath = evento.slug ? `/tabs/travesia/${evento.slug}` : `/tabs/evento/${evento.id}`;

    this.seo.setPage({
      title: `Travesía a nado ${nombre}${localidad ? ' · ' + localidad : ''}`,
      description: `Información de la travesía a nado ${nombre}${localidad ? ' en ' + localidad : ''}${fecha ? ' (' + fecha + ')' : ''}. Distancia, categorías e inscripción.`,
      canonicalPath,
      ogType: 'article',
    });

    this.setJsonLd(evento, canonicalPath);

    this.favoritosSub = this.localRepositoryService.favoritosEventos$.subscribe(() => {
      if (this.evento) {
        this.esFav = this.localRepositoryService.esFavoritoEvento(this.evento);
      }
    });
  }

  ngOnDestroy(): void {
    this.favoritosSub?.unsubscribe();
    this.removeJsonLd();
  }

  onToggleFavorito(evento: Evento): void {
    this.localRepositoryService.toggleFavoritoEvento(evento);
  }

  private setJsonLd(evento: Evento, canonicalPath: string): void {
    const origin = this.document.defaultView?.location?.origin ?? '';
    const url = `${origin}${canonicalPath}`;
    const jsonld: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: evento.descripcion || 'Travesía a nado',
      sport: 'Open Water Swimming',
      url,
      startDate: evento.fecha_evento || undefined,
      location: {
        '@type': 'Place',
        name: evento.lugar_evento || evento.municipio || 'España',
        address: {
          '@type': 'PostalAddress',
          addressLocality: evento.municipio || undefined,
          addressRegion: evento.provincia || undefined,
          addressCountry: 'ES',
        },
      },
      organizer: evento.organizador ? { '@type': 'Organization', name: evento.organizador } : undefined,
      offers: evento.url_inscripcion
        ? {
            '@type': 'Offer',
            url: evento.url_inscripcion,
            price: evento.precio ?? undefined,
            priceCurrency: 'EUR',
            availability: evento.inscripciones_abiertas ? 'https://schema.org/InStock' : undefined,
          }
        : undefined,
    };

    this.removeJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSONLD_ID;
    script.text = JSON.stringify(jsonld, (_, v) => (v === undefined ? undefined : v));
    this.document.head.appendChild(script);
  }

  private removeJsonLd(): void {
    const existing = this.document.getElementById(JSONLD_ID);
    if (existing) existing.remove();
  }
}
