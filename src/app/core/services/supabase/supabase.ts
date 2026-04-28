import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular'
import { AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js'

import { Dispositivo } from 'src/app/models/dispositivo';
import { Playa } from 'src/app/models/playa';
import { Municipio, Provincia } from 'src/app/models/common';

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

  async getPlayasByName(name: string, conPrevison: boolean | undefined = false): Promise<Playa[]> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    const { data, error } = await this.supabase
      .from('playa')
      .select(select)
      .ilike('playa', "%".concat(name).concat('%'))

    if (error) {
      console.error('Error al obtener lista de playas:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Playa[];
  }


  async getPlayaAll(): Promise<Playa[]> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    const { data, error } = await this.supabase
      .from('playa')
      .select(select);


    if (error) {
      console.error('Error al obtener lista de playas:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Playa[];
  }

  async getPlayaByCodPlaya(codPlaya: string): Promise<Playa> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date,prediccion";
    let query = this.supabase
      .from('playa')
      .select(select)
      .eq('cod_playa', codPlaya)
      .limit(1).single();


    const { data, error } = await query;


    if (error) {
      console.error('Error al obtener playa por código:', error);
      return {} as Playa; // O manejar el error según tu lógica
    }
    return data as Playa;
  }

async getPlayaByCodPlayaConPrediccion(codPlaya: string): Promise<Playa> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date,prediccion";
    let query = this.supabase
      .from('playa')
      .select(select)
      .eq('cod_playa', codPlaya)
      .maybeSingle();

    const { data, error } = await query;

    if (error) {
      return {} as Playa;
    }

    return data as Playa;

  }

  async getMunicipioByNameAndCodMunicipio(name: string, codMunicipio: string | string[]): Promise<Municipio[]> {

    let query = this.supabase
      .from('municipio')
      .select('*')
      .ilike('municipio', "%".concat(name).concat('%'));

    // Handle single value or array of values for codMunicipio
    if (Array.isArray(codMunicipio)) {
      query = query.in('cod_municipio', codMunicipio);
    } else {
      query = query.eq('cod_municipio', codMunicipio);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener municipios:', error);
      return [];
    }

    return data as Municipio[];
  }

  async getMunicipioByNameAndCodProvincia(name: string, codProvincia: string | string[]): Promise<Municipio[]> {

    let query = this.supabase
      .from('municipio')
      .select('*');

    // Apply name filter if provided
    if (name && name !== '') {
      query = query.ilike('municipio', "%".concat(name).concat('%'));
    }

    // Handle single value or array of values for codProvincia
    if (Array.isArray(codProvincia)) {
      query = query.in('cod_provincia', codProvincia);
    } else {
      query = query.eq('cod_provincia', codProvincia);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener municipios por provincia:', error);
      return [];
    }

    return data as Municipio[];
  }

  async getProvinciaByCodProvincia(codProvincia: string | string[] | null): Promise<Provincia[]> {

    // If empty string, empty array, null, or array with size 0, return all provincias
    if (codProvincia === null ||
      (typeof codProvincia === 'string' && codProvincia === '') ||
      (Array.isArray(codProvincia) && codProvincia.length === 0)) {
      return this.getProvinciaAll();
    }

    let query = this.supabase
      .from('provincia')
      .select('*');

    // Handle single value or array of values for codProvincia
    if (Array.isArray(codProvincia)) {
      query = query.in('cod_provincia', codProvincia);
    } else {
      query = query.eq('cod_provincia', codProvincia);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener provincias:', error);
      return [];
    }

    return data as Provincia[];
  }

  async getProvinciaAll(): Promise<Provincia[]> {

    const { data, error } = await this.supabase
      .from('provincia')
      .select('*');

    if (error) {
      console.error('Error al obtener todas las provincias:', error);
      return [];
    }

    return data as Provincia[];
  }

  async getMunicipioAll(): Promise<Municipio[]> {

    const { data, error } = await this.supabase
      .from('municipio')
      .select('*');

    if (error) {
      console.error('Error al obtener todos los municipios:', error);
      return [];
    }

    return data as Municipio[];
  }

  async getProvinciaByNameAndCodProvincia(name: string | null, codProvincia: string | string[] | null): Promise<Provincia[]> {

    // If empty string, null, or empty array for both params, return all provincias
    if ((name === null || name === '') &&
      (codProvincia === null ||
        (typeof codProvincia === 'string' && codProvincia === '') ||
        (Array.isArray(codProvincia) && codProvincia.length === 0))) {
      return this.getProvinciaAll();
    }

    let query = this.supabase
      .from('provincia')
      .select('*');

    // Apply name filter if provided
    if (name && name !== '') {
      query = query.ilike('provincia', "%".concat(name).concat('%'));
    }

    // Apply codProvincia filter if provided
    if (codProvincia !== null && !(typeof codProvincia === 'string' && codProvincia === '') && !(Array.isArray(codProvincia) && codProvincia.length === 0)) {
      if (Array.isArray(codProvincia)) {
        query = query.in('cod_provincia', codProvincia);
      } else {
        query = query.eq('cod_provincia', codProvincia);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener provincias:', error);
      return [];
    }

    return data as Provincia[];

  }

  async getPlayasByProvincia(codProvincia: string): Promise<Playa[]> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";

    const { data, error } = await this.supabase
      .from('playa')
      .select(select)
      .eq('cod_provincia', codProvincia);

    if (error) {
      console.error('Error al obtener playas por provincia:', error);
      return [];
    }

    return data as Playa[];
  }

  async getPlayasByMunicipio(codMunicipio: string): Promise<Playa[]> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";

    const { data, error } = await this.supabase
      .from('playa')
      .select(select)
      .eq('cod_municipio', codMunicipio);

    if (error) {
      console.error('Error al obtener playas por municipio:', error);
      return [];
    }

    return data as Playa[];
  }

  async getPlayaByNameAndCodProvincia(name: string, codProvincia: string | string[], conPrevison: boolean = false): Promise<Playa[]> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    let query = this.supabase
      .from('playa')
      .select(select)
      .ilike('playa', "%".concat(name).concat('%'));

    // Handle single value or array of values for codProvincia
    if (Array.isArray(codProvincia)) {
      query = query.in('cod_provincia', codProvincia);
    } else {
      query = query.eq('cod_provincia', codProvincia);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener playas por nombre y provincia:', error);
      return [];
    }

    return data as Playa[];
  }

  async getPlayaByNameAndCodMunicipio(name: string, codMunicipio: string | string[], conPrevison: boolean = false): Promise<Playa[]> {
    const select = "cod_playa,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    let query = this.supabase
      .from('playa')
      .select(select)
      .ilike('playa', "%".concat(name).concat('%'));

    // Handle single value or array of values for codMunicipio
    if (Array.isArray(codMunicipio)) {
      query = query.in('cod_municipio', codMunicipio);
    } else {
      query = query.eq('cod_municipio', codMunicipio);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener playas por nombre y municipio:', error);
      return [];
    }

    return data as Playa[];
  }

}
