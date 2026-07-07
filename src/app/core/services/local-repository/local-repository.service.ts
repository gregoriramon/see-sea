import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Playa } from 'src/app/models/playa';
import { Evento } from 'src/app/models/evento';
import { Municipio, Provincia } from 'src/app/models/common';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class LocalRepositoryService {
  // ===== FAVORITAS =====
  private favoritasSubject = new BehaviorSubject<Playa[]>([]);
  public favoritas$ = this.favoritasSubject.asObservable();
  private favoritosEventosSubject = new BehaviorSubject<Evento[]>([]);
  public favoritosEventos$ = this.favoritosEventosSubject.asObservable();
  private deviceIdSubject = new BehaviorSubject<string>("");
  public deviceId$ = this.deviceIdSubject.asObservable();



  // ===== COMMON DATA KEYS =====
  private readonly PLAYAS_KEY = 'allPlayas';
  private readonly MUNICIPIOS_KEY = 'allMunicipios';
  private readonly PROVINCIAS_KEY = 'allProvincias';
  private readonly FAVORITAS_KEY = 'favoritas';
  private readonly FAVORITOS_EVENTOS_KEY = 'favoritosEventos';
  private readonly DEVICE_ID_KEY = 'my_app_device_id';
  private readonly LANG_KEY = 'pref_lang';
  private readonly NOTIFICATIONS_KEY = 'pref_notifications';

  // ===== PREFERENCIAS =====
  private langSubject = new BehaviorSubject<'es' | 'en'>('es');
  public lang$ = this.langSubject.asObservable();
  private notificacionesSubject = new BehaviorSubject<boolean>(false);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  constructor() {
    this.cargarFavoritas();
    this.cargarFavoritosEventos();
    this.cargarPreferencias();
    this.inicializarDeviceId();
  }

  // ===== PREFERENCIAS METHODS =====

  private cargarPreferencias(): void {
    const lang = localStorage.getItem(this.LANG_KEY);
    if (lang === 'es' || lang === 'en') {
      this.langSubject.next(lang);
    }
    const notif = localStorage.getItem(this.NOTIFICATIONS_KEY);
    if (notif !== null) {
      this.notificacionesSubject.next(notif === 'true');
    }
  }

  obtenerIdioma(): 'es' | 'en' {
    return this.langSubject.value;
  }

  guardarIdioma(lang: 'es' | 'en'): void {
    localStorage.setItem(this.LANG_KEY, lang);
    this.langSubject.next(lang);
  }

  obtenerNotificaciones(): boolean {
    return this.notificacionesSubject.value;
  }

  guardarNotificaciones(activadas: boolean): void {
    localStorage.setItem(this.NOTIFICATIONS_KEY, String(activadas));
    this.notificacionesSubject.next(activadas);
  }

  // ===== FAVORITAS METHODS =====

  private cargarFavoritas(): void {
    const favoritasGuardadas = localStorage.getItem(this.FAVORITAS_KEY);
    if (favoritasGuardadas) {
      try {
        this.favoritasSubject.next(JSON.parse(favoritasGuardadas));
      } catch (error) {
        console.error('Error al cargar favoritas:', error);
        this.favoritasSubject.next([]);
      }
    }
  }

  obtenerFavoritas(): Playa[] {
    return this.favoritasSubject.value;
  }

  esFavorita(playa: Playa): boolean {
    return this.favoritasSubject.value.some(
      (p) => p.cod_playa === playa.cod_playa
    );
  }

  agregarFavorita(playa: Playa): void {
    if (!this.esFavorita(playa)) {
      const actuales = this.favoritasSubject.value;
      const nuevasFavoritas = [playa, ...actuales];
      this.favoritasSubject.next(nuevasFavoritas);
      this.guardarFavoritas(nuevasFavoritas);
    }
  }

  refreshFavorita(playa: Playa): void {
    const actuales = this.favoritasSubject.value;
    const nuevasFavoritas = actuales.map(p => p.cod_playa === playa.cod_playa ? playa : p);
    this.favoritasSubject.next(nuevasFavoritas);
    this.guardarFavoritas(nuevasFavoritas);
  }

  quitarFavorita(playa: Playa): void {
    const actuales = this.favoritasSubject.value;
    const nuevasFavoritas = actuales.filter(
      (p) => p.cod_playa !== playa.cod_playa
    );
    this.favoritasSubject.next(nuevasFavoritas);
    this.guardarFavoritas(nuevasFavoritas);
  }

  reordenarFavoritas(nuevasFavoritas: Playa[]): void {
    this.favoritasSubject.next(nuevasFavoritas);
    this.guardarFavoritas(nuevasFavoritas);
  }

  toggleFavorita(playa: Playa): void {
    if (this.esFavorita(playa)) {
      this.quitarFavorita(playa);
    } else {
      this.agregarFavorita(playa);
    }
  }

  // ===== FAVORITOS EVENTOS METHODS =====

  private cargarFavoritosEventos(): void {
    const guardados = localStorage.getItem(this.FAVORITOS_EVENTOS_KEY);
    if (guardados) {
      try {
        this.favoritosEventosSubject.next(JSON.parse(guardados));
      } catch (error) {
        console.error('Error al cargar favoritos de eventos:', error);
        this.favoritosEventosSubject.next([]);
      }
    }
  }

  obtenerFavoritosEventos(): Evento[] {
    return this.favoritosEventosSubject.value;
  }

  esFavoritoEvento(evento: Evento): boolean {
    return this.favoritosEventosSubject.value.some((e) => e.id === evento.id);
  }

  agregarFavoritoEvento(evento: Evento): void {
    if (!this.esFavoritoEvento(evento)) {
      const actuales = this.favoritosEventosSubject.value;
      const nuevos = [evento, ...actuales];
      this.favoritosEventosSubject.next(nuevos);
      this.guardarFavoritosEventos(nuevos);
    }
  }

  quitarFavoritoEvento(evento: Evento): void {
    const actuales = this.favoritosEventosSubject.value;
    const nuevos = actuales.filter((e) => e.id !== evento.id);
    this.favoritosEventosSubject.next(nuevos);
    this.guardarFavoritosEventos(nuevos);
  }

  toggleFavoritoEvento(evento: Evento): void {
    if (this.esFavoritoEvento(evento)) {
      this.quitarFavoritoEvento(evento);
    } else {
      this.agregarFavoritoEvento(evento);
    }
  }

  private guardarFavoritosEventos(favoritos: Evento[]): void {
    localStorage.setItem(this.FAVORITOS_EVENTOS_KEY, JSON.stringify(favoritos));
  }


  private async inicializarDeviceId() {
    let id = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!id) {
      const info = await Device.getId();
      id = info.identifier;
      localStorage.setItem(this.DEVICE_ID_KEY, id);
    }
    this.deviceIdSubject.next(id);
  }


  private guardarFavoritas(favoritas: Playa[]): void {
    localStorage.setItem(this.FAVORITAS_KEY, JSON.stringify(favoritas));
  }

  // ===== PLAYAS METHODS =====

  obtenerPlayas(): Playa[] {
    const playasGuardadas = localStorage.getItem(this.PLAYAS_KEY);
    if (playasGuardadas) {
      try {
        return JSON.parse(playasGuardadas);
      } catch (error) {
        console.error('Error al cargar playas:', error);
        return [];
      }
    }
    return [];
  }

  existenPlayas(): boolean {
    return localStorage.getItem(this.PLAYAS_KEY) !== null;
  }

  guardarPlayas(playas: Playa[]): void {
    localStorage.setItem(this.PLAYAS_KEY, JSON.stringify(playas));
  }

  // ===== MUNICIPIOS METHODS =====

  obtenerMunicipios(): Municipio[] {
    const municipiosGuardados = localStorage.getItem(this.MUNICIPIOS_KEY);
    if (municipiosGuardados) {
      try {
        return JSON.parse(municipiosGuardados);
      } catch (error) {
        console.error('Error al cargar municipios:', error);
        return [];
      }
    }
    return [];
  }

  existenMunicipios(): boolean {
    return localStorage.getItem(this.MUNICIPIOS_KEY) !== null;
  }

  guardarMunicipios(municipios: Municipio[]): void {
    localStorage.setItem(this.MUNICIPIOS_KEY, JSON.stringify(municipios));
  }

  // ===== PROVINCIAS METHODS =====

  obtenerProvincias(): Provincia[] {
    const provinciasGuardadas = localStorage.getItem(this.PROVINCIAS_KEY);
    if (provinciasGuardadas) {
      try {
        return JSON.parse(provinciasGuardadas);
      } catch (error) {
        console.error('Error al cargar provincias:', error);
        return [];
      }
    }
    return [];
  }

  existenProvincias(): boolean {
    return localStorage.getItem(this.PROVINCIAS_KEY) !== null;
  }

  guardarProvincias(provincias: Provincia[]): void {
    localStorage.setItem(this.PROVINCIAS_KEY, JSON.stringify(provincias));
  }

  // ===== UTILIDADES =====

  limpiarTodos(): void {
    localStorage.removeItem(this.PLAYAS_KEY);
    localStorage.removeItem(this.MUNICIPIOS_KEY);
    localStorage.removeItem(this.PROVINCIAS_KEY);
    localStorage.removeItem(this.FAVORITAS_KEY);
    localStorage.removeItem(this.FAVORITOS_EVENTOS_KEY);
    this.favoritasSubject.next([]);
    this.favoritosEventosSubject.next([]);
  }
}
