import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Dia } from 'src/app/models/playa';
import { DiaSemanaPipe } from "../../pipes/dia-semana-pipe";
import { flag,sunnyOutline, thermometerOutline, cloudOutline, umbrellaOutline, waterOutline, flagOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { OlajePipe } from "../../pipes/oleaje-pipe";
import { TemperaturaPipe } from "../../pipes/temperatura-pipe";
import { VientoPipe } from "../../pipes/viento-pipe";
import { UvMaxPipe } from "../../pipes/uv-max-pipe";
import { EstadoCieloPipe } from "../../pipes/estado-cielo-pipe";
import { getColorOleaje } from "../../utils/templateUtils";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWater, faTemperatureHigh, faWind, faSun, faCloud } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-tabla-pronostico',
  standalone: true,
  imports: [FontAwesomeModule,CommonModule, IonicModule, DiaSemanaPipe, OlajePipe, TemperaturaPipe, VientoPipe, UvMaxPipe, EstadoCieloPipe],
  templateUrl: './tabla-pronostico.component.html',
  styleUrls: ['./tabla-pronostico.component.scss'],
})
export class TablaPronosticoComponent {
  @Input() dias: Dia[] = [];

    // Definición de las propiedades para usar en el HTML
  faWater = faWater;
  faTemp = faTemperatureHigh;
  faWind = faWind;
  faSun = faSun;
  faCloud = faCloud;

  constructor() {
    addIcons({ flag,   sunnyOutline, thermometerOutline, cloudOutline, umbrellaOutline, waterOutline, flagOutline });
  }

  getColorOleaje(oleaje: string, ionicColors: boolean): string {
      return getColorOleaje(oleaje, ionicColors);
  }
}
