import { Injectable } from '@angular/core';
import { Playa } from 'src/app/models/playa';
import { Municipio, Provincia } from 'src/app/models/common';

const noopStorage: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {},
};
const ls: Storage = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage)
  ? (globalThis as any).localStorage
  : noopStorage;

@Injectable({
  providedIn: 'root',
})
export class CommonLocalService {
  private readonly PLAYAS_KEY = 'allPlayas';
  private readonly MUNICIPIOS_KEY = 'allMunicipios';
  private readonly PROVINCIAS_KEY = 'allProvincias';

  constructor() {
    this.cargarDatos();
  }

  // ===== PLAYAS =====

  obtenerPlayas(): Playa[] {
    const playasGuardadas = ls.getItem(this.PLAYAS_KEY);
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
    return ls.getItem(this.PLAYAS_KEY) !== null;
  }

  guardarPlayas(playas: Playa[]): void {
    ls.setItem(this.PLAYAS_KEY, JSON.stringify(playas));
  }

  // ===== MUNICIPIOS =====

  obtenerMunicipios(): Municipio[] {
    const municipiosGuardados = ls.getItem(this.MUNICIPIOS_KEY);
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
    return ls.getItem(this.MUNICIPIOS_KEY) !== null;
  }

  guardarMunicipios(municipios: Municipio[]): void {
    ls.setItem(this.MUNICIPIOS_KEY, JSON.stringify(municipios));
  }

  // ===== PROVINCIAS =====

  obtenerProvincias(): Provincia[] {
    const provinciasGuardadas = ls.getItem(this.PROVINCIAS_KEY);
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
    return ls.getItem(this.PROVINCIAS_KEY) !== null;
  }

  guardarProvincias(provincias: Provincia[]): void {
    ls.setItem(this.PROVINCIAS_KEY, JSON.stringify(provincias));
  }

  // ===== UTILIDADES =====

  private cargarDatos(): void {
    // Método para inicializar el servicio
    // Se pueden agregar validaciones adicionales si es necesario
  }

  limpiarTodos(): void {
    ls.removeItem(this.PLAYAS_KEY);
    ls.removeItem(this.MUNICIPIOS_KEY);
    ls.removeItem(this.PROVINCIAS_KEY);
  }
}
