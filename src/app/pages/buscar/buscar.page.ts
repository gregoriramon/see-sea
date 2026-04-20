import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonInput, IonButton, IonSearchbar } from '@ionic/angular/standalone';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { Playa } from 'src/app/models/playa';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { PlayaComponent } from "src/app/shared/components/playa/playa.component";


@Component({
  selector: 'app-buscar',
  templateUrl: 'buscar.page.html',
  styleUrls: ['buscar.page.scss'],
  imports: [IonSearchbar, FormsModule, IonCol, IonRow, IonGrid,  IonToolbar,  IonContent, HeaderComponent, HeaderComponent, PlayaComponent],
})
export class BuscarPage {
  public patterName: string = "norte";
  public playas: Playa[]=[];
  constructor(private supabaseService: Supabase) {}

  ngOnInit() {
    this.getPlayasByName()
  }


  getPlayasByName() {
    this.supabaseService.getPlayasByName(this.patterName).
    then((playas) =>{
      this.playas = playas;
      console.log("Total de playas de ".concat(`${this.playas.length}`).concat(" playas para patter: ").concat(this.patterName))}
    ).catch(reason => console.log(reason))
  }
}
