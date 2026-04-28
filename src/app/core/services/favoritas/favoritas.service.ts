import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Playa } from 'src/app/models/playa';
import { Supabase } from '../supabase/supabase';

@Injectable({
  providedIn: 'root',
})
export class FavoritasService {
  private favoritasSubject = new BehaviorSubject<Playa[]>([]);
  public favoritas$ = this.favoritasSubject.asObservable();

  constructor() {
    this.cargarFavoritas();
  }

  private cargarFavoritas(): void {
    const favoritasGuardadas = localStorage.getItem('favoritas');
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
      const nuevasFavoritas = [...actuales, playa];
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

  private guardarFavoritas(favoritas: Playa[]): void {
    localStorage.setItem('favoritas', JSON.stringify(favoritas));
  }
}
