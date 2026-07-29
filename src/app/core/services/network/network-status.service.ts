import { Injectable, Injector, inject, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, map, pairwise } from 'rxjs';
import { Network } from '@capacitor/network';
import type { Supabase } from '../supabase/supabase';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);
  private supabaseCache?: Supabase;

  private online$$ = new BehaviorSubject<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  readonly online$: Observable<boolean> = this.online$$.asObservable().pipe(distinctUntilChanged());

  readonly reconnected$: Observable<void> = this.online$.pipe(
    pairwise(),
    filter(([prev, curr]) => !prev && curr),
    map(() => undefined),
  );

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));

    try {
      await Network.addListener('networkStatusChange', (s) => this.setOnline(s.connected));
      const status = await Network.getStatus();
      this.setOnline(status.connected);
    } catch {
      // Plugin no disponible (web sin Capacitor plugin nativo): mantener navigator.onLine
    }
  }

  private setOnline(value: boolean): void {
    this.zone.run(() => {
      if (this.online$$.value !== value) {
        this.online$$.next(value);
      }
    });
  }

  isOnline(): boolean {
    return this.online$$.value;
  }

  async checkSupabase(): Promise<boolean> {
    if (!this.isOnline()) {
      return false;
    }
    try {
      const supabase = await this.getSupabase();
      const ok = await supabase.ping();
      if (!ok) {
        this.setOnline(false);
      }
      return ok;
    } catch {
      this.setOnline(false);
      return false;
    }
  }

  private async getSupabase(): Promise<Supabase> {
    if (!this.supabaseCache) {
      const mod = await import('../supabase/supabase');
      this.supabaseCache = this.injector.get(mod.Supabase);
    }
    return this.supabaseCache;
  }
}
