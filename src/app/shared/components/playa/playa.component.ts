import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IonButton, ToastController } from '@ionic/angular/standalone';
import { IonicModule } from "@ionic/angular";
import { Playa } from 'src/app/models/playa';
import { DiaSemanaPipe } from '../../pipes/dia-semana-pipe';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, water, location, heart, heartOutline } from 'ionicons/icons';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-playa',
  templateUrl: './playa.component.html',
  styleUrls: ['./playa.component.scss'],
  standalone:true,
  imports: [IonicModule, DiaSemanaPipe, DatePipe],
})
export class PlayaComponent implements  OnChanges {

  @Input() playa!: Playa;
  @Input() esParticularFavorita: boolean = false;
  @Output() toggleFavorita = new EventEmitter<Playa>();
  @Input () conDetalle: boolean = false;

  constructor(private toastController: ToastController) {
    addIcons({ chevronForwardOutline, water, location, heart, heartOutline });
  }


  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  onToggleFavorita(event: Event): void {
    event.stopPropagation();
    this.toggleFavorita.emit(this.playa);
    if (this.esParticularFavorita) {
      this.presentToast(`Playa ${this.playa.playa} eliminada de favoritas`);
    } else {
      this.presentToast(`Playa ${this.playa.playa} añadida a favoritas`    );
    }
  }

  abrirGoogleMaps(): void {
    const url = `https://www.google.com/maps/?q=${this.playa.lat},${this.playa.lon}`;
    window.open(url, '_blank');
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
