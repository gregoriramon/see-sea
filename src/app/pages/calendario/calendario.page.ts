import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-calendario',
  templateUrl: 'calendario.page.html',
  styleUrls: ['calendario.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,HeaderComponent]
})
export class CalendarioPage {

  constructor() {}

}
