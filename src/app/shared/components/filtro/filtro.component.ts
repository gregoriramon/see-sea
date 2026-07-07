import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { IonSelect, IonSelectOption, IonToolbar, IonSearchbar, IonHeader, IonGrid, IonRow, IonCol, IonButton } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { Municipio, Provincia } from 'src/app/models/common';
import { IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { trashOutline, closeCircleOutline } from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';



@Component({
  selector: 'app-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss'],
  standalone: true,
  imports: [IonSelect,IonSearchbar,FormsModule, IonHeader, IonToolbar, IonGrid, IonRow, IonCol, IonSelectOption, TranslatePipe],
})
export class FiltroComponent  implements OnInit {
  private supabaseService = inject(Supabase);
  private localRepositoryService = inject(LocalRepositoryService);


  @Input()  showMunicipios: boolean = false;
  @Input()  showProvincias: boolean = false;
  @Input()  showName:boolean = false;

  @Output() filtroChange = new EventEmitter<{ provincia: string; municipio: string; patterName:string; }>();

  public provinciasList: Provincia[] = [];
  public municipiosList: Municipio[] = [];
  private municipiosListAll: Municipio[] = [];
  public selectedProvincia: string = "**";
  public selectedMunicipio: string = "";
  @Input() patterName:string = "";


  constructor() {
    addIcons({ trashOutline, closeCircleOutline });
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
    if (this.localRepositoryService.existenProvincias()) {
      this.provinciasList = this.localRepositoryService.obtenerProvincias();
      console.log(`Provincias obtenidas del almacenamiento local: ${this.provinciasList.length}`);
      return;
    }

    // Si no existen en local, obtener del servicio de supabase
    this.supabaseService.getProvinciaAll().then((provincias) => {
      this.provinciasList = provincias;
      // Guardar en almacenamiento local
      this.localRepositoryService.guardarProvincias(provincias);
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
    if (this.localRepositoryService.existenMunicipios()) {
      this.municipiosListAll = this.localRepositoryService.obtenerMunicipios();
      console.log(`Municipios obtenidos del almacenamiento local: ${this.municipiosListAll.length}`);
      return;
    }

    // Si no existen en local, obtener del servicio de supabase
    this.supabaseService.getMunicipioAll().then((municipios) => {
      this.municipiosListAll = municipios;
      // Guardar en almacenamiento local
      this.localRepositoryService.guardarMunicipios(municipios);
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

  public resetFiltros() {
    this.selectedProvincia = "**";
    this.selectedMunicipio = "";
    this.patterName = "";
    this.emitFiltros();
  }
}



