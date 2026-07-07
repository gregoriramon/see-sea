import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shareOutline, close, addOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-ios-install-banner',
  standalone: true,
  imports: [CommonModule, IonIcon, TranslatePipe],
  templateUrl: './ios-install-banner.component.html',
  styleUrls: ['./ios-install-banner.component.scss'],
})
export class IosInstallBannerComponent implements OnInit {
  private readonly INSTALLED_KEY = 'ios_install_done';
  private readonly DISMISSED_AT_KEY = 'ios_install_dismissed_at';
  private readonly COOLDOWN_DAYS = 7;

  visible = false;

  constructor() {
    addIcons({ shareOutline, close, addOutline, checkmarkCircleOutline });
  }

  ngOnInit(): void {
    if (this.shouldShow()) {
      setTimeout(() => (this.visible = true), 1500);
    }
  }

  private shouldShow(): boolean {
    if (Capacitor.isNativePlatform()) return false;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    if (!isIOS) return false;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      // Si está corriendo como PWA instalada, marcarlo para que no aparezca si vuelve a abrir en Safari (mismo contexto).
      localStorage.setItem(this.INSTALLED_KEY, 'true');
      return false;
    }

    if (localStorage.getItem(this.INSTALLED_KEY) === 'true') return false;

    const dismissedAt = Number(localStorage.getItem(this.DISMISSED_AT_KEY) || 0);
    if (dismissedAt) {
      const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (elapsedDays < this.COOLDOWN_DAYS) return false;
    }

    return true;
  }

  dismiss(): void {
    this.visible = false;
    localStorage.setItem(this.DISMISSED_AT_KEY, String(Date.now()));
  }

  yaInstalada(): void {
    this.visible = false;
    localStorage.setItem(this.INSTALLED_KEY, 'true');
  }
}
