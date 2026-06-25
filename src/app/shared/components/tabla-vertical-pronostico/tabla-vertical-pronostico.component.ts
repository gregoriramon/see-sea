import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Dia } from 'src/app/models/playa';
import { DiaSemanaPipe } from "../../pipes/dia-semana-pipe";
import { faWater, faTemperatureHigh, faWind, faSun, faCloud } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OleajePipe } from "../../pipes/oleaje-pipe";
import { TemperaturaPipe } from "../../pipes/temperatura-pipe";
import { VientoPipe } from "../../pipes/viento-pipe";
import { UvMaxPipe } from "../../pipes/uv-max-pipe";
import { EstadoCieloPipe } from "../../pipes/estado-cielo-pipe";
import { getColorOleaje } from "../../utils/templateUtils";

@Component({
  selector: 'app-tabla-vertical-pronostico',
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    IonicModule,
    DiaSemanaPipe,
    OleajePipe,
    TemperaturaPipe,
    VientoPipe,
    EstadoCieloPipe
  ],
  templateUrl: './tabla-vertical-pronostico.component.html',
  styleUrls: ['./tabla-vertical-pronostico.component.scss'],
})
export class TablaVerticalPronosticoComponent {
  @Input() dias: Dia[] = [];

  // Definición de las propiedades para usar en el HTML
  faWater = faWater;
  faTemp = faTemperatureHigh;
  faWind = faWind;
  faSun = faSun;
  faCloud = faCloud;

  getColorOleaje(oleaje: string, ionicColors: boolean): string {
    return getColorOleaje(oleaje, ionicColors);
  }
}
