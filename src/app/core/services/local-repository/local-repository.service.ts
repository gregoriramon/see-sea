import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Playa } from 'src/app/models/playa';
import { Municipio, Provincia } from 'src/app/models/common';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class LocalRepositoryService {
  // ===== FAVORITAS =====
  private favoritasSubject = new BehaviorSubject<Playa[]>([]);
  public favoritas$ = this.favoritasSubject.asObservable();
  private deviceIdSubject = new BehaviorSubject<string>("");
  public deviceId$ = this.deviceIdSubject.asObservable();



  // ===== COMMON DATA KEYS =====
  private readonly PLAYAS_KEY = 'allPlayas';
  private readonly MUNICIPIOS_KEY = 'allMunicipios';
  private readonly PROVINCIAS_KEY = 'allProvincias';
  private readonly FAVORITAS_KEY = 'favoritas';
  private readonly DEVICE_ID_KEY = 'my_app_device_id';

  constructor() {
    this.cargarFavoritas();
    this.inicializarDeviceId();
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

  toggleFavorita(playa: Playa): void {
    if (this.esFavorita(playa)) {
      this.quitarFavorita(playa);
    } else {
      this.agregarFavorita(playa);
    }
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
    this.favoritasSubject.next([]);
  }
}
