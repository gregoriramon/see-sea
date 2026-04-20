import { Component } from '@angular/core';
import {IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';


@Component({
  selector: 'app-favoritas',
  templateUrl: 'favoritas.page.html',
  styleUrls: ['favoritas.page.scss'],
  imports: [IonContent, HeaderComponent],
})
export class FavoritasPage {
  constructor() {}
}
