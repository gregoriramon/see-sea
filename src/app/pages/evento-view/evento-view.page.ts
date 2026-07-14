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
import { EventoComponent } from 'src/app/shared/components/evento/evento.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-evento-view',
  templateUrl: './evento-view.page.html',
  styleUrls: ['./evento-view.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonSpinner,
    EventoComponent,
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

  private favoritosSub?: Subscription;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : NaN;
    if (!id || isNaN(id)) {
      return;
    }
    this.isLoading = true;
    this.supabaseService.getEventoById(id)
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
