import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
} from '@ionic/angular/standalone';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { Evento } from 'src/app/models/evento';
import { EventoDetalleComponent } from 'src/app/shared/components/evento-detalle/evento-detalle.component';
import { TranslatePipe } from '@ngx-translate/core';

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
  private supabaseService = inject(Supabase);
  localRepositoryService = inject(LocalRepositoryService);

  public evento?: Evento;
  public isLoading: boolean = false;
  public esFav: boolean = false;
  public backHref: string = '/tabs/eventos';

  private favoritosSub?: Subscription;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!id || isNaN(id)) {
      return;
    }
    const fechaParam = this.route.snapshot.queryParamMap.get('fecha');
    const origen = this.route.snapshot.queryParamMap.get('origen');
    this.backHref = origen === 'calendario' ? '/tabs/calendario' : '/tabs/eventos';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const esPasado = fechaParam ? new Date(fechaParam) < hoy : false;
    this.isLoading = true;
    const promesa = esPasado
      ? this.supabaseService.getEventoPasadoById(id)
      : this.supabaseService.getEventoById(id);
    promesa
      .then((evento) => {
        if (evento) {
          this.evento = evento;
          this.esFav = this.localRepositoryService.esFavoritoEvento(this.evento);
        }
      })
      .catch((err) => console.error('Error cargando evento:', err))
      .finally(() => { this.isLoading = false; });

    this.favoritosSub = this.localRepositoryService.favoritosEventos$.subscribe(() => {
      if (this.evento) {
        this.esFav = this.localRepositoryService.esFavoritoEvento(this.evento);
      }
    });
  }

  ngOnDestroy(): void {
    this.favoritosSub?.unsubscribe();
  }

  onToggleFavorito(evento: Evento): void {
    this.localRepositoryService.toggleFavoritoEvento(evento);
  }
}
