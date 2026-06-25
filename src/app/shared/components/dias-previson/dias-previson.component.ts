import { Component, Input } from '@angular/core';
import { Dia } from 'src/app/models/playa';
import { DiaSemanaPipe } from "../../pipes/dia-semana-pipe";
import { getColorOleaje } from '../../utils/templateUtils';

@Component({
  selector: 'app-dias-previson',
  templateUrl: './dias-previson.component.html',
  styleUrls: ['./dias-previson.component.scss'],
  standalone: true,
  imports: [DiaSemanaPipe],
})
export class DiasPrevisonComponent {
  getColorOleaje(oleaje: string, ionicColors: boolean): string {
      return getColorOleaje(oleaje, ionicColors);
  }

  @Input() dias!: Dia[];
  constructor() { }

}
