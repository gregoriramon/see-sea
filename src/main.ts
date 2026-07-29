import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { SelectivePreloadingStrategy } from './app/core/router/selective-preloading-strategy';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { inject, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { InlineTranslateLoader } from './app/core/i18n/inline-translate-loader';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ innerHTMLTemplatesEnabled: true }),
    provideRouter(routes, withPreloading(SelectivePreloadingStrategy)),
    provideHttpClient(),
    provideTranslateService({
      fallbackLang: 'es',
      lang: 'es',
      loader: provideTranslateLoader(() => new InlineTranslateLoader(inject(HttpClient))),
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
});
