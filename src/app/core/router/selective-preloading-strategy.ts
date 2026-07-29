import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, from, of } from 'rxjs';

type IdleCb = (cb: () => void, opts?: { timeout: number }) => number;

/**
 * Precarga solo rutas marcadas con `data: { preload: true }`, y difiere la
 * carga a `requestIdleCallback` para no bloquear el hilo principal durante
 * la ventana FCP→TTI (donde Lighthouse mide TBT).
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (route.data?.['preload'] !== true) {
      return of(null);
    }
    return from(
      new Promise<unknown>((resolve) => {
        const run = () => load().subscribe({ next: resolve, error: () => resolve(null) });
        const ric = (globalThis as unknown as { requestIdleCallback?: IdleCb }).requestIdleCallback;
        if (typeof ric === 'function') {
          ric(run, { timeout: 5000 });
        } else {
          setTimeout(run, 2000);
        }
      }),
    );
  }
}
