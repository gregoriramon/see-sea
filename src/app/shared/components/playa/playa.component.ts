import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IonButton, ToastController, AlertController } from '@ionic/angular/standalone';
import { IonicModule } from "@ionic/angular";
import { Playa } from 'src/app/models/playa';
import { DiaSemanaPipe } from '../../pipes/dia-semana-pipe';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, water, location, heart, heartOutline } from 'ionicons/icons';
import { TablaPronosticoComponent } from "../tabla-pronostico/tabla-pronostico.component";
import { getColorOleaje } from "../../utils/templateUtils";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWater, faTemperatureHigh, faWind, faSun, faCloud } from '@fortawesome/free-solid-svg-icons';
import { TablaVerticalPronosticoComponent } from "../tabla-vertical-pronostico/tabla-vertical-pronostico.component";
import { OlajePipe } from "../../pipes/oleaje-pipe";
import { TemperaturaPipe } from "../../pipes/temperatura-pipe";

@Component({
  selector: 'app-playa',
  templateUrl: './playa.component.html',
  styleUrls: ['./playa.component.scss'],
  standalone:true,
  imports: [FontAwesomeModule, IonicModule, DiaSemanaPipe, TablaPronosticoComponent, TablaVerticalPronosticoComponent, OlajePipe, TemperaturaPipe],
})
export class PlayaComponent implements  OnChanges {

  faWater = faWater;
  faTemp = faTemperatureHigh;

  @Input() playa!: Playa;
  @Input() esParticularFavorita: boolean = false;
  @Output() toggleFavorita = new EventEmitter<Playa>();
  @Input () conDetalle: boolean = false;

  constructor(private toastController: ToastController, private alertController: AlertController) {
    addIcons({ chevronForwardOutline, water, location, heart, heartOutline });
  }


  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
  }

  async onToggleFavorita(event: Event): Promise<void> {
    event.stopPropagation();

    if (this.esParticularFavorita || this.playa.prediccion) {
      const alert = await this.alertController.create({
        header: 'Eliminar de favoritas',
        message: `¿Eliminar la playa '${this.playa.playa}' de favoritas?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              // No hacer nada si cancela
            }
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: () => {
              this.toggleFavorita.emit(this.playa);
              this.presentToast(`Playa ${this.playa.playa} eliminada de favoritas`);
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.toggleFavorita.emit(this.playa);
      this.presentToast(`Playa ${this.playa.playa} añadida a favoritas`);
    }
  }

  abrirGoogleMaps(): void {
    const url = `https://www.google.com/maps/?q=${this.playa.lat},${this.playa.lon}`;
    window.open(url, '_blank');
  }

  getColorOleaje(oleaje: string, ionicColors: boolean): string {
    return getColorOleaje(oleaje, ionicColors);
  }
    async presentToast(message:string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top'
    });

    await toast.present();
  }
}
