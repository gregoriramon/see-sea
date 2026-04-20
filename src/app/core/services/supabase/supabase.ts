import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular'
import { AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js'

import { Dispositivo } from 'src/app/models/dispositivo';
import { Playa } from 'src/app/models/playa';

import { environment } from 'src/environments/environment';




@Injectable({
  providedIn: 'root',
})

export class Supabase {

  private supabase: SupabaseClient


  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl, environment.supabaseKey
    );
  }

  async getDispositivos(): Promise<Dispositivo[]> {

    const { data, error } = await this.supabase
      .from('tb_dispositivos')
      .select('id, nombre');

    if (error) {
      console.error('Error al obtener dispositivos:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Dispositivo[];
  }

  async getDispositivo(id: number = 0): Promise<Dispositivo> {
    const { data, error } = await this.supabase
      .from('tb_dispositivos').
      select('id, nombre').eq("id", id).single();

    if (error) {
      console.error('Error al obtener dispositivos:', error);
    }

    return data as Dispositivo;
  }

  async getDispositivosByName(name: string): Promise<Dispositivo[]> {

    const { data, error } = await this.supabase
      .from('tb_dispositivos')
      .select('id, nombre')
      .ilike('nombre', name);

    if (error) {
      console.error('Error al obtener dispositivos:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Dispositivo[];
  }

  updateDispositivo(dispositivo: Dispositivo) {
    console.log("insert on service");
    return this.supabase.from('tb_dispositivos').update(dispositivo);
  }

  insertDispositivo(dispositivo: Dispositivo) {
    console.log("insert on service");
    return this.supabase.from('tb_dispositivos').insert(dispositivo);
  }

  async getPlayasByName(name: string): Promise<Playa[]> {

    const { data, error } = await this.supabase
      .from('playa')
      .select()
      .ilike('playa',"%".concat(name).concat('%'))

    if (error) {
      console.error('Error al obtener lista de playas:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Playa[];
  }

}
