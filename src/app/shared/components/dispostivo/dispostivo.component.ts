import { Component, Input } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { Dispositivo } from 'src/app/models/dispositivo';

@Component({
  selector: 'app-dispostivo',
  templateUrl: './dispostivo.component.html',
  styleUrls: ['./dispostivo.component.scss'],
  standalone:true,
  imports: [IonicModule],
})
export class DispostivoComponent {

  @Input() dispositivo!:Dispositivo;

  constructor() { }

}
