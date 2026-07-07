import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonInput, IonButton, IonSearchbar, IonSpinner } from '@ionic/angular/standalone';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { Playa } from 'src/app/models/playa';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { PlayaComponent } from "src/app/shared/components/playa/playa.component";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FiltroComponent } from "src/app/shared/components/filtro/filtro.component";
import { normalizeSearch } from "src/app/shared/utils/templateUtils";
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-buscar',
  templateUrl: 'playa-list.page.html',
  styleUrls: ['playa-list.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonSpinner, FormsModule, IonCol, IonRow, IonGrid, IonContent, IonButton, PlayaComponent, FiltroComponent, IonTitle, TranslatePipe],
})
export class PlayaListPage implements OnInit, OnDestroy {
  private supabaseService = inject(Supabase);
  localRepositoryService = inject(LocalRepositoryService);
  private router = inject(Router);

  private readonly PAGE_SIZE = 25;
  public patterName: string = "";
  public playas: Playa[] = [];
  private playasAll: Playa[] = [];
  public selectedProvincia: string = "**";
  public selectedMunicipio: string = "";
  public isLoading: boolean = false;
  public isPaginated: boolean = false;
  public visibleCount: number = this.PAGE_SIZE;
  private destroy$ = new Subject<void>();

  get hayMasPlayas(): boolean {
    return this.isPaginated && this.playas.length < this.playasAll.length;
  }

  get restantes(): number {
    return Math.max(0, this.playasAll.length - this.playas.length);
  }

  mostrarMas() {
    this.visibleCount += this.PAGE_SIZE;
    this.playas = this.playasAll.slice(0, this.visibleCount);
  }

  mostrarTodas() {
    this.playas = this.playasAll;
    this.isPaginated = false;
  }

  ngOnInit() {
    console.log("Inicializando PlayaListPage, obteniendo playas...");
    this.getPlayasAll();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPlayasAll() {
    this.isLoading = true;

    // Verificar si existen playas en almacenamiento local
    if (this.localRepositoryService.existenPlayas()) {
      this.playasAll = this.localRepositoryService.obtenerPlayas();
      console.log(`Total de playas obtenidas del almacenamiento local: ${this.playasAll.length}`);
      this.refrescarPlayas();
      this.isLoading = false;
      return;
    }

    // Si no existen en local, obtener del servicio de supabase
    this.supabaseService.getPlayaAll().
      then((playas) => {
        this.playasAll = playas;
        // Guardar en almacenamiento local
        this.localRepositoryService.guardarPlayas(playas);
        console.log(`Total de playas obtenidas del supabase y guardadas localmente: ${this.playasAll.length}`);
        this.refrescarPlayas();
        this.isLoading = false;
      })
      .catch(reason => {
        console.log(reason);
        this.isLoading = false;
      });

  }
  getPlayasAllSinFiltro() {
    this.isLoading = true;
    this.isPaginated = true;
    this.visibleCount = this.PAGE_SIZE;
    this.playas = this.playasAll.slice(0, this.visibleCount);
    console.log(`Mostrando ${this.playas.length} de ${this.playasAll.length} playas (paginado)`);
    this.isLoading = false;
  }

  getPlayasByName() {
    this.isLoading = true;
    if (!this.patterName) {
      console.log("No hay patrón de búsqueda, mostrando todas las playas");
      this.getPlayasAllSinFiltro();
      return;
    }
    const q = normalizeSearch(this.patterName);
    this.playas = this.playasAll.filter(playa =>
      normalizeSearch(playa.playa).includes(q)
      || normalizeSearch(playa.municipio).includes(q)
      || normalizeSearch(playa.provincia).includes(q));
    console.log("Total de playas de ".concat(`${this.playas.length}`).concat(" playas para patter: ").concat(this.patterName));
    this.isLoading = false;
  }

  onFiltroChange(filtro: { provincia: string; municipio: string; patterName: string; }) {
    const esReset = !!this.patterName && !filtro.patterName;
    const pocosElementosPrevios = this.playas.length > 0 && this.playas.length <= 25;

    this.selectedProvincia = filtro.provincia;
    this.selectedMunicipio = filtro.municipio;
    this.patterName = filtro.patterName;

    if (esReset && pocosElementosPrevios) {
      // Mostrar spinner para que el usuario perciba el refresco al pasar de pocos a muchos resultados
      this.isLoading = true;
      this.playas = [];
      setTimeout(() => this.refrescarPlayas(), 50);
    } else {
      this.refrescarPlayas();
    }
  }

  private refrescarPlayas() {
    // Si hay municipio seleccionado, filtrar por municipio
    // Si solo hay provincia, filtrar por provincia
    // Si no hay nada, mostrar playas por nombre
    if (this.selectedMunicipio) {
      this.isPaginated = false;
      this.getPlayaByNameAndCodMunicipio(this.patterName, this.selectedMunicipio);
    } else if (this.selectedProvincia) {
      console.log("Provincia seleccionada:" + this.selectedProvincia + " con length:" + this.selectedProvincia.length + ", filtrando por provincia y nombre");
      this.isPaginated = false;
      this.getPlayaByNameAndCodProvincia(this.patterName, this.selectedProvincia);
    } else if (this.patterName) {
      console.log("No hay provincia ni municipio seleccionados, filtrando por nombre");
      this.isPaginated = false;
      this.getPlayasByName();
    } else {
      console.log("No hay filtros seleccionados, mostrando todas las playas");
      this.getPlayasAllSinFiltro();
    }
  }

  private getPlayasByProvincia(codProvincia: string) {
    // Aquí debes usar el método correspondiente del servicio Supabase
    // Si no existe, necesitarás agregarlo al servicio
    this.isLoading = true;
    this.playas = this.playasAll.filter(playa => playa.cod_provincia === codProvincia);
    console.log(`Total de playas para provincia ${codProvincia}: ${this.playas.length}`);
    this.isLoading = false;
    /*     this.supabaseService.getPlayasByProvincia(codProvincia).then((playas) => {
          this.playas = playas;
          console.log(`Total de playas para provincia ${codProvincia}: ${this.playas.length}`);
          this.isLoading = false;
        }).catch(reason => {
          console.log(reason);
          this.isLoading = false;
        }); */
  }

  private getPlayasByMunicipio(codMunicipio: string) {
    // Aquí debes usar el método correspondiente del servicio Supabase
    // Si no existe, necesitarás agregarlo al servicio
    this.isLoading = true;
    this.playas = this.playasAll.filter(playa => playa.cod_municipio === codMunicipio);
    this.isLoading = false;
  }

  private getPlayaByNameAndCodMunicipio(name: string, codMunicipio: string) {
    this.isLoading = true;
    if (codMunicipio === "*****") {
      this.getPlayasByName();
      return;
    }
    const q = normalizeSearch(name);
    this.playas = this.playasAll.filter(playa => playa.cod_municipio === codMunicipio && normalizeSearch(playa.playa).includes(q));
    this.isLoading = false;
  }

  private getPlayaByNameAndCodProvincia(name: string, codProvincia: string) {
    this.isLoading = true;
    if (codProvincia === "**") {
      this.getPlayasByName();
      return;
    }
    const q = normalizeSearch(name);
    this.playas = this.playasAll.filter(playa =>
      playa.cod_provincia === codProvincia && (
        normalizeSearch(playa.playa).includes(q) ||
        normalizeSearch(playa.municipio).includes(q)
      )
    );
    this.isLoading = false;

  }

  esFavorita(playa: Playa): boolean {
    return this.localRepositoryService.esFavorita(playa);
  }

  onToggleFavorita(playa: Playa) {
    if (!this.esFavorita(playa)) {
      this.supabaseService.getPlayaByCodPlayaConPrediccion(playa.cod_playa).then((playaDetails) => {
        if (playaDetails && !Array.isArray(playaDetails)) {
          playa = playaDetails; // Actualizamos la información de la playa con los detalles completos obtenidos
          this.localRepositoryService.toggleFavorita(playaDetails)
        }
      });
      this.localRepositoryService.deviceId$.subscribe((deviceId) => {
        this.supabaseService.registraDispositivo({ id_dispositivo: deviceId, accion: 'ADD-FAVORITA' , data:playa.cod_playa}).then(() => {
          console.log('Dispositivo registrado en Supabase playas favoritas '+  deviceId + ':' + playa.cod_playa);
        }).catch((error) => {
          console.error('Error al registrar dispositivo en Supabase:', error);
        });
      });
    } else {
      this.localRepositoryService.toggleFavorita(playa);
    }

  }

  onPlayaClick(playa: Playa) {
    this.router.navigate(['/tabs/playa', playa.cod_playa]);
  }

  getSomethingSelected(): boolean {
    return this.selectedProvincia !== "" || this.selectedMunicipio !== "" || this.patterName !== "";
  }



}
