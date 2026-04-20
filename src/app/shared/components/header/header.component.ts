import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IonHeader } from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports:[IonicModule]
})
export class HeaderComponent  implements OnInit {

  @Input() tituloPagina!:string;
  constructor() { }

  ngOnInit() {}

}
