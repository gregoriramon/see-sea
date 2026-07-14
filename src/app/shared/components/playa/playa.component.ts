import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { IonButton, ToastController, AlertController } from '@ionic/angular/standalone';
import { IonicModule } from "@ionic/angular";
import { Dia, Playa } from 'src/app/models/playa';
import { DiaSemanaPipe } from '../../pipes/dia-semana-pipe';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, chevronDownOutline, chevronUpOutline, water, location, heart, heartOutline } from 'ionicons/icons';
import { TablaPronosticoComponent } from "../tabla-pronostico/tabla-pronostico.component";
import { fechaEsPasada, getColorOleaje, getColorTemperatura } from "../../utils/templateUtils";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWater, faTemperatureHigh, faWind, faSun, faCloud } from '@fortawesome/free-solid-svg-icons';
import { TablaVerticalPronosticoComponent } from "../tabla-vertical-pronostico/tabla-vertical-pronostico.component";
import { OleajePipe } from "../../pipes/oleaje-pipe";
import { TemperaturaPipe } from "../../pipes/temperatura-pipe";
import { DiasPrevisonComponent } from "../dias-previson/dias-previson.component";
import { Capacitor } from '@capacitor/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NetworkStatusService } from 'src/app/core/services/network/network-status.service';

@Component({
  selector: 'app-playa',
  templateUrl: './playa.component.html',
  styleUrls: ['./playa.component.scss'],
  standalone:true,
  imports: [FontAwesomeModule, IonicModule, TablaPronosticoComponent,  OleajePipe, DiaSemanaPipe, TranslatePipe],
})
export class PlayaComponent implements OnInit {
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private translate = inject(TranslateService);
  private networkStatus = inject(NetworkStatusService);


  faWater = faWater;
  faTemp = faTemperatureHigh;

  @Input() playa!: Playa;
  @Input() esParticularFavorita: boolean = false;
  @Output() toggleFavorita = new EventEmitter<Playa>();
  @Output() itemClick = new EventEmitter<Playa>();
  @Input () conDetalle: boolean = false;
  @Input() prediccionColapsable: boolean = false;
  @Input() prediccionExpandidaInicial: boolean = true;
  @Input() mostrarBotonFavorita: boolean = false;

  public primerDia: number = 0;
  public diasNoPasados: Dia[] = [];
  public prediccionExpandida: boolean = true;

  constructor() {
    addIcons({ chevronForwardOutline, chevronDownOutline, chevronUpOutline, water, location, heart, heartOutline });
  }


  ngOnInit(): void {
    this.primerDia = this.getPrimerDia();
    this.diasNoPasados = this.playa.prediccion?.dia.slice().filter((_, index) => !this.esDiaPasado(index)) || [];
    this.prediccionExpandida = this.prediccionColapsable ? this.prediccionExpandidaInicial : true;
  }

  onItemClick(): void {
    this.itemClick.emit(this.playa);
  }

  togglePrediccion(event: Event): void {
    event.stopPropagation();
    this.prediccionExpandida = !this.prediccionExpandida;
  }

  async onToggleFavorita(event: Event): Promise<void> {
    event.stopPropagation();

    if (this.esParticularFavorita) {
      const alert = await this.alertController.create({
        header: this.translate.instant('alerts.removeFavorita.header'),
        message: this.translate.instant('alerts.removeFavorita.message', { name: this.playa.playa }),
        buttons: [
          {
            text: this.translate.instant('common.cancel'),
            role: 'cancel',
            handler: () => {
              // No hacer nada si cancela
            }
          },
          {
            text: this.translate.instant('common.delete'),
            role: 'destructive',
            handler: () => {
              this.toggleFavorita.emit(this.playa);
              this.presentToast(this.translate.instant('toasts.favoritaRemoved', { name: this.playa.playa }));
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.toggleFavorita.emit(this.playa);
      const online = await this.networkStatus.checkSupabase();
      if (online) {
        this.presentToast(this.translate.instant('toasts.favoritaAdded', { name: this.playa.playa }));
      } else {
        this.presentToast(this.translate.instant('toasts.offlineNoService'), 'danger');
      }
    }
  }

  abrirGoogleMaps(event?: Event): void {
    event?.stopPropagation();
    const { lat, lon, playa } = this.playa;
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') {
      window.location.href = `maps://?q=${lat},${lon}`;
    } else if (platform === 'android') {
      window.location.href = `geo:${lat},${lon}?q=${lat},${lon}(${encodeURIComponent(playa)})`;
    } else {
      window.location.href = `https://www.google.com/maps/?q=${lat},${lon}`;
    }
  }

  getColorOleaje(oleaje: string, ionicColors: boolean): string {
    return getColorOleaje(oleaje, ionicColors);
  }

  getColorTemperatura(temperatura: number, ionicColors: boolean): string {
    return getColorTemperatura(temperatura, ionicColors);
  }
    async presentToast(message: string, color?: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'middle',
      color:'primary'
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
