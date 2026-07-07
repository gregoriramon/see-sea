import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { IonContent } from "@ionic/angular/standalone";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.page.html',
  styleUrls: ['./tips.page.scss'],
  standalone: true,
  imports: [IonContent, HeaderComponent, TranslatePipe],
})
export class TipsPage {

  constructor() { }

}
