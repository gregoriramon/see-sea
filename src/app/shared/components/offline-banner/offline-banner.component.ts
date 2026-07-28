import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';
import { NetworkStatusService } from 'src/app/core/services/network/network-status.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [AsyncPipe, IonIcon, TranslatePipe],
  templateUrl: './offline-banner.component.html',
  styleUrls: ['./offline-banner.component.scss'],
})
export class OfflineBannerComponent {
  private readonly network = inject(NetworkStatusService);
  readonly online$ = this.network.online$;

  constructor() {
    addIcons({ cloudOfflineOutline });
  }
}
