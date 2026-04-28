import { Injectable } from '@angular/core';
import { Playa } from 'src/app/models/playa';
import { Municipio, Provincia } from 'src/app/models/common';

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

  // ===== MUNICIPIOS =====

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

  // ===== PROVINCIAS =====

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

  private cargarDatos(): void {
    // Método para inicializar el servicio
    // Se pueden agregar validaciones adicionales si es necesario
  }

  limpiarTodos(): void {
    localStorage.removeItem(this.PLAYAS_KEY);
    localStorage.removeItem(this.MUNICIPIOS_KEY);
    localStorage.removeItem(this.PROVINCIAS_KEY);
  }
}
