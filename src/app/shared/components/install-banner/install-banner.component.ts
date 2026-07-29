import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, downloadOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { TranslatePipe } from '@ngx-translate/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_AT_KEY = 'pwa_install_dismissed_at';
const INSTALLED_KEY = 'pwa_install_done';
const COOLDOWN_DAYS = 7;

/**
 * Prompt de instalación PWA para Android/desktop (Chromium).
 * iOS Safari se maneja aparte en IosInstallBannerComponent (no dispara beforeinstallprompt).
 */
@Component({
  selector: 'app-install-banner',
  standalone: true,
  imports: [CommonModule, IonIcon, TranslatePipe],
  templateUrl: './install-banner.component.html',
  styleUrls: ['./install-banner.component.scss'],
})
export class InstallBannerComponent implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  visible = false;
  private deferredPrompt?: BeforeInstallPromptEvent;

  constructor() {
    addIcons({ closeOutline, downloadOutline });
  }

  private onBeforeInstall = (evt: Event) => {
    evt.preventDefault();
    if (!this.shouldShow()) return;
    this.deferredPrompt = evt as BeforeInstallPromptEvent;
    setTimeout(() => (this.visible = true), 800);
  };

  private onAppInstalled = () => {
    this.visible = false;
    this.deferredPrompt = undefined;
    try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch { /* noop */ }
  };

  ngOnInit(): void {
    if (!this.isBrowser) return;
    if (Capacitor.isNativePlatform()) return;
    window.addEventListener('beforeinstallprompt', this.onBeforeInstall);
    window.addEventListener('appinstalled', this.onAppInstalled);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    window.removeEventListener('beforeinstallprompt', this.onBeforeInstall);
    window.removeEventListener('appinstalled', this.onAppInstalled);
  }

  private shouldShow(): boolean {
    try {
      if (localStorage.getItem(INSTALLED_KEY) === 'true') return false;
      const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) || 0);
      if (dismissedAt) {
        const elapsedDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
        if (elapsedDays < COOLDOWN_DAYS) return false;
      }
    } catch { /* noop */ }
    return true;
  }

  async install(): Promise<void> {
    if (!this.deferredPrompt) return;
    await this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      try { localStorage.setItem(INSTALLED_KEY, 'true'); } catch { /* noop */ }
    } else {
      try { localStorage.setItem(DISMISSED_AT_KEY, String(Date.now())); } catch { /* noop */ }
    }
    this.visible = false;
    this.deferredPrompt = undefined;
  }

  dismiss(): void {
    this.visible = false;
    try { localStorage.setItem(DISMISSED_AT_KEY, String(Date.now())); } catch { /* noop */ }
  }
}
