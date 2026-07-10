import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonInput,
} from '@ionic/angular/standalone';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { Provincia } from 'src/app/models/common';
import { TranslatePipe } from '@ngx-translate/core';

export type RangoFecha = '-12m' | '-6m' | '-3m' | '3m' | '6m' | '12m';

export interface FiltroEventos {
  patterName: string;
  rangoFecha: RangoFecha;
  distanciaMin: number | null;
  distanciaMax: number | null;
  codProvincia: string;
}

@Component({
  selector: 'app-filtro-eventos',
  templateUrl: './filtro-eventos.component.html',
  styleUrls: ['./filtro-eventos.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
    IonInput,
    TranslatePipe,
  ],
})
export class FiltroEventosComponent implements OnInit {
  private supabaseService = inject(Supabase);
  private localRepositoryService = inject(LocalRepositoryService);

  @Input() showName: boolean = false;
  @Input() showRangoFecha: boolean = false;
  @Input() showDistancia: boolean = false;
  @Input() showProvincias: boolean = false;
  @Input() patterName: string = '';

  public selectedRango: RangoFecha = '3m';
  public distanciaMin: number | null = null;
  public distanciaMax: number | null = null;
  public selectedProvincia: string = '**';
  public provinciasList: Provincia[] = [];

  @Output() filtroChange = new EventEmitter<FiltroEventos>();

  ngOnInit() {
    if (this.showProvincias) {
      this.getProvincias();
    }
  }

  getProvincias() {
    if (this.localRepositoryService.existenProvincias()) {
      this.provinciasList = this.localRepositoryService.obtenerProvincias();
      console.log('[filtro-eventos] provincias (local):', this.provinciasList);
      return;
    }
    this.supabaseService
      .getProvinciaAll()
      .then((provincias) => {
        this.provinciasList = provincias;
        this.localRepositoryService.guardarProvincias(provincias);
        console.log('[filtro-eventos] provincias (supabase):', this.provinciasList);
      })
      .catch((reason) => console.log(reason));
  }

  onPatterNameChange() {
    this.emitFiltros();
  }

  onRangoChange(value: RangoFecha) {
    this.selectedRango = value;
    this.emitFiltros();
  }

  onDistanciaChange() {
    this.emitFiltros();
  }

  onProvinciaChange(codProvincia: string) {
    this.selectedProvincia = codProvincia;
    this.emitFiltros();
  }

  public resetFiltros() {
    this.patterName = '';
    this.selectedRango = '3m';
    this.distanciaMin = null;
    this.distanciaMax = null;
    this.selectedProvincia = '**';
    this.emitFiltros();
  }

  private emitFiltros() {
    this.filtroChange.emit({
      patterName: this.patterName,
      rangoFecha: this.selectedRango,
      distanciaMin: this.distanciaMin,
      distanciaMax: this.distanciaMax,
      codProvincia: this.selectedProvincia,
    });
  }
}
