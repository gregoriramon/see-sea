import { Component, Injector, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonContent, IonTitle, IonList, IonItem, IonMenuToggle, AlertController, ToastController } from '@ionic/angular/standalone';
import { NavigationError, Router, RouterLink } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { LocalRepositoryService } from './core/services/local-repository/local-repository.service';
import { filter, take } from 'rxjs/operators';
import { IosInstallBannerComponent } from './shared/components/ios-install-banner/ios-install-banner.component';
import { InstallBannerComponent } from './shared/components/install-banner/install-banner.component';
import { OfflineBannerComponent } from './shared/components/offline-banner/offline-banner.component';
import { NetworkStatusService } from './core/services/network/network-status.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonItem, IonList, IonTitle, IonContent, IonToolbar, IonHeader, IonApp, IonRouterOutlet, IonMenu, IonMenuToggle, IosInstallBannerComponent, InstallBannerComponent, OfflineBannerComponent, TranslatePipe, RouterLink],
})
export class AppComponent implements OnInit  {
  private localRepository = inject(LocalRepositoryService);
  private injector = inject(Injector);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private swUpdate = inject(SwUpdate);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private networkStatus = inject(NetworkStatusService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly INTERVALO_COMPROBACION_MS = 6 * 60 * 60 * 1000;


  async mostrarAcercaDe() {
    const alert = await this.alertController.create({
      header: this.translate.instant('alerts.about.header'),
      subHeader: this.translate.instant('alerts.about.subHeader'),
      message: this.translate.instant('alerts.about.message'),
      buttons: [{ text: this.translate.instant('common.close'), role: 'cancel' }],
      cssClass: 'acerca-de-alert',
    });
    await alert.present();
  }

  ngOnInit() {
    this.translate.addLangs(['es', 'en']);
    this.translate.setFallbackLang('es');
    this.localRepository.lang$.subscribe((lang) => this.translate.use(lang));

    if (!this.isBrowser) return;

    this.inicializarRecargaAntePeticionChunkObsoleto();

    const tabInicial = this.localRepository.obtenerTabInicial();
    const path = window.location.pathname;
    const enRaiz = path === '/' || path === '' || /^\/tabs\/?$/.test(path);
    if (enRaiz) {
      this.router.navigateByUrl(`/tabs/${tabInicial}`, { replaceUrl: true });
    }

    this.runWhenIdle(() => {
      this.localRepository.deviceId$.pipe(take(1)).subscribe(async (deviceId) => {
        try {
          const { Supabase } = await import('./core/services/supabase/supabase');
          const supabase = this.injector.get(Supabase);
          supabase.registraDispositivo({id_dispositivo: deviceId, accion: 'LOGIN'})
            .then(() => console.log('Dispositivo registrado en Supabase'))
            .catch((error) => console.error('Error al registrar dispositivo en Supabase:', error));
        } catch (error) {
          console.error('Error inesperado registrando dispositivo:', error);
        }
      });

      this.inicializarActualizacionPwa();
      this.inicializarRecargaAlReconectar();
    });
  }

  private runWhenIdle(cb: () => void) {
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (typeof ric === 'function') {
      ric(cb, { timeout: 2000 });
    } else {
      setTimeout(cb, 0);
    }
  }

  /**
   * Cuando el SW tiene una versión antigua cacheada y el nuevo main.js pide un chunk
   * inexistente en su caché, la respuesta llega como HTML (fallback SPA) y el módulo
   * falla al cargar. En ese caso forzamos recarga: la próxima petición irá contra
   * el servidor y el SW se actualizará.
   */
  private inicializarRecargaAntePeticionChunkObsoleto() {
    const FLAG = 'seesea-chunk-error-reloaded';
    const esErrorDeChunk = (msg: string) =>
      /Failed to fetch dynamically imported module|ChunkLoadError|Loading chunk .* failed|MIME type of "text\/html"/i.test(msg);

    this.router.events
      .pipe(filter((e): e is NavigationError => e instanceof NavigationError))
      .subscribe((event) => {
        const msg = String(event.error?.message ?? event.error ?? '');
        if (esErrorDeChunk(msg) && !sessionStorage.getItem(FLAG)) {
          sessionStorage.setItem(FLAG, '1');
          console.warn('[app] chunk obsoleto detectado, recargando…', msg);
          location.reload();
        }
      });

    window.addEventListener('error', (event) => {
      const msg = String(event.message ?? event.error?.message ?? '');
      if (esErrorDeChunk(msg) && !sessionStorage.getItem(FLAG)) {
        sessionStorage.setItem(FLAG, '1');
        console.warn('[app] error global de chunk, recargando…', msg);
        location.reload();
      }
    });
  }

  private inicializarRecargaAlReconectar() {
    this.networkStatus.reconnected$.subscribe(() => {
      const url = this.router.url;
      const prevReuse = this.router.routeReuseStrategy.shouldReuseRoute;
      const prevOnSame = this.router.onSameUrlNavigation;
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigateByUrl(url, { replaceUrl: true }).finally(() => {
        this.router.routeReuseStrategy.shouldReuseRoute = prevReuse;
        this.router.onSameUrlNavigation = prevOnSame;
      });
    });
  }

  private inicializarActualizacionPwa() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((evt) => evt.type === 'VERSION_READY'))
      .subscribe(() => this.mostrarToastActualizacion());

    this.swUpdate.unrecoverable.subscribe(() => this.mostrarToastRecargaForzada());

    this.swUpdate.checkForUpdate().catch((err) =>
      console.error('Error comprobando actualizacion PWA:', err)
    );
    setInterval(() => {
      this.swUpdate.checkForUpdate().catch((err) =>
        console.error('Error comprobando actualizacion PWA:', err)
      );
    }, this.INTERVALO_COMPROBACION_MS);
  }

  private async mostrarToastActualizacion() {
    const toast = await this.toastController.create({
      message: this.translate.instant('toasts.updateAvailable'),
      duration: 0,
      position: 'bottom',
      color: 'primary',
      buttons: [
        {
          text: this.translate.instant('common.reload'),
          role: 'info',
          handler: () => {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
          },
        },
        { text: this.translate.instant('common.notNow'), role: 'cancel' },
      ],
    });
    await toast.present();
  }

  private async mostrarToastRecargaForzada() {
    const toast = await this.toastController.create({
      message: this.translate.instant('toasts.reloadRequired'),
      duration: 0,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: this.translate.instant('common.reload'),
          role: 'info',
          handler: () => document.location.reload(),
        },
      ],
    });
    await toast.present();
  }
}




