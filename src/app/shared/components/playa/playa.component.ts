import { Component, Input, InputSignal, OnChanges, OnInit, SimpleChanges,input } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { Playa } from 'src/app/models/playa';
import { DiaSemanaPipe } from '../../pipes/dia-semana-pipe';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-playa',
  templateUrl: './playa.component.html',
  styleUrls: ['./playa.component.scss'],
  standalone:true,
  imports: [IonicModule,DiaSemanaPipe],
})
export class PlayaComponent  implements OnInit, OnChanges {

  //param = input<string>();
  @Input() playa!:Playa;

  constructor() {
    addIcons({ chevronForwardOutline});
    console.log("Contructor playa");
  }

  ngOnInit() {
    console.log("ngOnInit playa");
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }
}
