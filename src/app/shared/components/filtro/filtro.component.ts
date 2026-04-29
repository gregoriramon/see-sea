import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonSelect, IonSelectOption, IonToolbar, IonSearchbar, IonHeader, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { CommonLocalService } from 'src/app/core/services/common-local/common-local.service';
import { Municipio, Provincia } from 'src/app/models/common';

@Component({
  selector: 'app-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid,  IonHeader, IonSearchbar, IonToolbar, IonSelect, IonSelectOption, FormsModule],
})
export class FiltroComponent  implements OnInit {

  @Input()  showMunicipios: boolean = false;
  @Input()  showProvincias: boolean = false;
  @Input()  showName:boolean = false;

  @Output() filtroChange = new EventEmitter<{ provincia: string; municipio: string; patterName:string; }>();

  public provinciasList: Provincia[] = [];
  public municipiosList: Municipio[] = [];
  private municipiosListAll: Municipio[] = [];
  public selectedProvincia: string = "";
  public selectedMunicipio: string = "";
  @Input() patterName:string = "";


  constructor(
    private supabaseService: Supabase,
    private commonLocalService: CommonLocalService
  ) {

  }

  ngOnInit() {
    if(this.showProvincias){
      this.getProvincias();
    }
    if(this.showMunicipios){
      this.getMunicipiosAll();
    }
  }

  getProvincias() {
    // Verificar si existen provincias en almacenamiento local
    if (this.commonLocalService.existenProvincias()) {
      this.provinciasList = this.commonLocalService.obtenerProvincias();
      console.log(`Provincias obtenidas del almacenamiento local: ${this.provinciasList.length}`);
      return;
    }

    // Si no existen en local, obtener del servicio de supabase
    this.supabaseService.getProvinciaAll().then((provincias) => {
      this.provinciasList = provincias;
      // Guardar en almacenamiento local
      this.commonLocalService.guardarProvincias(provincias);
      console.log(`Provincias obtenidas del supabase y guardadas localmente: ${this.provinciasList.length}`);
    })
    .catch(reason => console.log(reason));
  }

  onProvinciaChange(codProvincia: string) {
    this.selectedProvincia = codProvincia;
    this.selectedMunicipio = ""; // Limpiar municipio seleccionado
    this.getMunicipiosByProvincia(codProvincia);
    this.emitFiltros();
  }

  onMunicipioChange(codMunicipio: string) {
    this.selectedMunicipio = codMunicipio;
    this.emitFiltros();
  }

  onPatterNameChange() {
    this.emitFiltros();
  }

  getMunicipiosAll() {
    // Verificar si existen municipios en almacenamiento local
    if (this.commonLocalService.existenMunicipios()) {
      this.municipiosListAll = this.commonLocalService.obtenerMunicipios();
      console.log(`Municipios obtenidos del almacenamiento local: ${this.municipiosListAll.length}`);
      return;
    }

    // Si no existen en local, obtener del servicio de supabase
    this.supabaseService.getMunicipioAll().then((municipios) => {
      this.municipiosListAll = municipios;
      // Guardar en almacenamiento local
      this.commonLocalService.guardarMunicipios(municipios);
      console.log(`Municipios obtenidos del supabase y guardados localmente: ${this.municipiosListAll.length}`);
    })
    .catch(reason => console.log(reason));
  }

  getMunicipiosByProvincia(codProvincia: string) {
    if (codProvincia) {
      this.municipiosList = this.municipiosListAll.filter(m => m.cod_provincia === codProvincia);
    }else {
      this.municipiosList = [];
    }
  }

  private emitFiltros() {
    this.filtroChange.emit({
      provincia: this.selectedProvincia,
      municipio: this.selectedMunicipio,
      patterName: this.patterName
    });
  }
}



