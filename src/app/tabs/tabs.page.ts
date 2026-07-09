import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonButtons, IonToolbar, IonHeader, IonTitle, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, search, calendar, chatbubblesOutline, listOutline, trophy, umbrellaOutline } from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, TranslatePipe],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ heart, search, calendar, 'chatbubbles-outline': chatbubblesOutline, listOutline, trophy, 'umbrella-outline': umbrellaOutline });
  }
}
