import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IonButton, ToastController, AlertController } from '@ionic/angular/standalone';
import { IonicModule } from "@ionic/angular";
import { Dia, Playa } from 'src/app/models/playa';
import { DiaSemanaPipe } from '../../pipes/dia-semana-pipe';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, water, location, heart, heartOutline } from 'ionicons/icons';
import { TablaPronosticoComponent } from "../tabla-pronostico/tabla-pronostico.component";
import { fechaEsPasada, getColorOleaje } from "../../utils/templateUtils";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWater, faTemperatureHigh, faWind, faSun, faCloud } from '@fortawesome/free-solid-svg-icons';
import { TablaVerticalPronosticoComponent } from "../tabla-vertical-pronostico/tabla-vertical-pronostico.component";
import { OlajePipe } from "../../pipes/oleaje-pipe";
import { TemperaturaPipe } from "../../pipes/temperatura-pipe";
import { DiasPrevisonComponent } from "../dias-previson/dias-previson.component";

@Component({
  selector: 'app-playa',
  templateUrl: './playa.component.html',
  styleUrls: ['./playa.component.scss'],
  standalone:true,
  imports: [FontAwesomeModule, IonicModule, TablaPronosticoComponent,  OlajePipe],
})
export class PlayaComponent implements  OnChanges, OnInit {

  faWater = faWater;
  faTemp = faTemperatureHigh;

  @Input() playa!: Playa;
  @Input() esParticularFavorita: boolean = false;
  @Output() toggleFavorita = new EventEmitter<Playa>();
  @Input () conDetalle: boolean = false;

  public primerDia: number = 0;
  public diasNoPasados: Dia[] = [];

  constructor(private toastController: ToastController, private alertController: AlertController) {
    addIcons({ chevronForwardOutline, water, location, heart, heartOutline });
  }


  ngOnInit(): void {
    this.primerDia = this.getPrimerDia();
    this.diasNoPasados = this.playa.prediccion?.dia.slice().filter((_, index) => !this.esDiaPasado(index)) || [];
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
      position: 'middle',
    });

    await toast.present();
  }

  private esDiaPasado(indice: number): boolean {
    if (!this.playa.prediccion || this.playa.prediccion.dia.length === 0) {
      return true;
    }
    if (this.playa.prediccion.dia.length <= indice) {
      return true;
    }
    return fechaEsPasada(this.playa.prediccion.dia[indice].fecha);
  }

  getPrimerDia(): number {
    if (!this.playa.prediccion || this.playa.prediccion.dia.length === 0) {
      return 0;
    }
    for (let i = 0; i < this.playa.prediccion.dia.length; i++) {
      if (!this.esDiaPasado(i)) {
        return i;
      }
    }
    return 0;
  }
}
