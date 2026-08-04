import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular'
import type { SupabaseClient } from '@supabase/supabase-js'

import { Dispositivo } from 'src/app/models/dispositivo';
import { Playa } from 'src/app/models/playa';
import { Evento } from 'src/app/models/evento';
import { Feedback } from 'src/app/models/feedback';
import { Municipio, Provincia } from 'src/app/models/common';

import { environment } from 'src/environments/environment';




@Injectable({
  providedIn: 'root',
})

export class Supabase {

  private clientPromise?: Promise<SupabaseClient>;

  constructor() {}

  private getClient(): Promise<SupabaseClient> {
    if (!this.clientPromise) {
      this.clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
        createClient(environment.supabaseUrl, environment.supabaseKey)
      );
    }
    return this.clientPromise;
  }

  async ping(timeoutMs: number = 4000): Promise<boolean> {
    try {
      const query = (await this.getClient()).from('tb_dispositivos').select('id_dispositivo', { count: 'exact', head: true }).limit(1);
      const timeout = new Promise<{ error: unknown }>((resolve) =>
        setTimeout(() => resolve({ error: new Error('timeout') }), timeoutMs)
      );
      const result = await Promise.race([query, timeout]) as { error: unknown };
      return !result.error;
    } catch {
      return false;
    }
  }

  async getDispositivos(): Promise<Dispositivo[]> {

    const { data, error } = await (await this.getClient())
      .from('tb_dispositivos')
      .select('id_dispositivo, register_at');

    if (error) {
      console.error('Error al obtener dispositivos:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Dispositivo[];
  }

  async getDispositivo(id: number = 0): Promise<Dispositivo> {
    const { data, error } = await (await this.getClient())
      .from('tb_dispositivos').
      select('id_dispositivo, register_at').eq("id_dispositivo", id).single();

    if (error) {
      console.error('Error al obtener dispositivos:', error);
    }

    return data as Dispositivo;
  }

  async getDispositivosByName(name: string): Promise<Dispositivo[]> {

    const { data, error } = await (await this.getClient())
      .from('tb_dispositivos')
      .select('id_dispositivo, register_at')
      .ilike('nombre', name);

    if (error) {
      console.error('Error al obtener dispositivos:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Dispositivo[];
  }

  async updateDispositivo(dispositivo: Dispositivo) {
    console.log("insert on service");

      const { data, error } = await (await this.getClient())
        .from('tb_dispositivos')
        .update(dispositivo)
        .eq('id', dispositivo.id_dispositivo)

      if (error) {
        console.error('Error al actualizar dispositivo:', error);
      }

  }

  async registraDispositivo(dispositivo: Dispositivo) {
    console.log("insert on service: " + dispositivo.id_dispositivo + " - " + dispositivo.accion);
    const {data,error} = await (await this.getClient()).from('tb_dispositivos').insert(dispositivo);
    if (error) {
      console.error('Error al registrar dispositivo:', error);
    }
  }

  async enviaFeedback(feedback: Feedback): Promise<{ error: any }> {
    const { error } = await (await this.getClient()).from('tb_feedback').insert(feedback);
    if (error) {
      console.error('Error al enviar feedback:', error);
    }
    return { error };
  }

  async getPlayasByName(name: string, conPrevison: boolean | undefined = false): Promise<Playa[]> {
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    const { data, error } = await (await this.getClient())
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
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    const { data, error } = await (await this.getClient())
      .from('playa')
      .select(select);


    if (error) {
      console.error('Error al obtener lista de playas:', error);
      return []; // O manejar el error según tu lógica
    }

    return data as Playa[];
  }

  async getPlayaByCodPlaya(codPlaya: string): Promise<Playa> {
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date,prediccion";
    let query = (await this.getClient())
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
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date,prediccion";
    let query = (await this.getClient())
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

  async getPlayaBySlugConPrediccion(slug: string): Promise<Playa> {
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date,prediccion";
    const { data, error } = await (await this.getClient())
      .from('playa')
      .select(select)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      return {} as Playa;
    }

    return data as Playa;
  }

  async getMunicipioByNameAndCodMunicipio(name: string, codMunicipio: string | string[]): Promise<Municipio[]> {

    let query = (await this.getClient())
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

    let query = (await this.getClient())
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

    let query = (await this.getClient())
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

    const { data, error } = await (await this.getClient())
      .from('provincia')
      .select('*');

    if (error) {
      console.error('Error al obtener todas las provincias:', error);
      return [];
    }

    return data as Provincia[];
  }

  async getMunicipioAll(): Promise<Municipio[]> {

    const { data, error } = await (await this.getClient())
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

    let query = (await this.getClient())
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
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";

    const { data, error } = await (await this.getClient())
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
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";

    const { data, error } = await (await this.getClient())
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
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    let query = (await this.getClient())
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
    const select = "cod_playa,slug,playa,cod_municipio,municipio,cod_provincia,provincia,cod_ccaa,ccaa,lat,lon,last_update_date,aemet_date";
    let query = (await this.getClient())
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

  private readonly SELECT_EVENTO = "id,slug,fecha_evento,descripcion,lugar_evento,distancia,municipio,provincia,cod_provincia,precio,url_info,url_inscripcion,url_resultados,competicion,competicion_nacional,federacion";
  private readonly SELECT_EVENTO_BY_ID_ACTIVO = "id,slug,descripcion,fecha_evento,distancia,precio,organizador,lugar_evento,municipio,provincia,fecha_inicio_inscripcion,fecha_fin_inscripcion,url_info,url_inscripcion,url_inscritos,url_reglamento,url_oficial,url_redes_sociales,competicion,competicion_nacional,federacion";
  private readonly SELECT_EVENTO_BY_ID_PASADO = "id,slug,descripcion,fecha_evento,distancia,organizador,lugar_evento,municipio,provincia,url_info,url_resultados,url_oficial,competicion,competicion_nacional,federacion";

  private normalizaPatron(pattern: string): string {
    return (pattern ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase();
  }

  async getEventoById(id: number): Promise<Evento | null> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO_BY_ID_ACTIVO)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener evento por id:', error);
      return null;
    }
    return data as Evento;
  }

  async getEventoBySlug(slug: string): Promise<Evento | null> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO_BY_ID_ACTIVO)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error al obtener evento por slug:', error);
      return null;
    }
    return (data as Evento) ?? null;
  }

  async getEventoPasadoBySlug(slug: string): Promise<Evento | null> {
    const { data, error } = await (await this.getClient())
      .from('travesias_pasadas')
      .select(this.SELECT_EVENTO_BY_ID_PASADO)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error al obtener evento pasado por slug:', error);
      return null;
    }
    return (data as Evento) ?? null;
  }

  async getEventoPasadoById(id: number): Promise<Evento | null> {
    const { data, error } = await (await this.getClient())
      .from('travesias_pasadas')
      .select(this.SELECT_EVENTO_BY_ID_PASADO)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener evento pasado por id:', error);
      return null;
    }
    return data as Evento;
  }

  async getEventoAll(): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener lista de eventos:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByFecha(fechaIni: string, fechaFin: string): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .gte('fecha_evento', fechaIni)
      .lte('fecha_evento', fechaFin)
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por fecha:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByLugar(pattern: string): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .ilike('lugar_evento', '%'+this.normalizaPatron(pattern)+'%')
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por lugar:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventosByDistancia(distanciaIni: number, distanciaFin: number): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .gte('distancia', distanciaIni)
      .lte('distancia', distanciaFin)
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por distancia:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventosByPrecio(precioIni: number, precioFin: number): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .gte('precio', precioIni)
      .lte('precio', precioFin)
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por precio:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByDescripcion(pattern: string): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .ilike('descripcion', '%'+this.normalizaPatron(pattern)+'%')
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por descripcion:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByDescripcionAndFecha(pattern: string, fechaIni: string, fechaFin: string, soloCompeticion?: boolean): Promise<Evento[]> {
    let query = (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .ilike('descripcion', '%'+this.normalizaPatron(pattern)+'%')
      .gte('fecha_evento', fechaIni)
      .lte('fecha_evento', fechaFin);
    if (soloCompeticion) {
      query = query.eq('competicion', true);
    }
    const { data, error } = await query.order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por descripcion y fecha:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoPasadoByDescripcionAndFecha(pattern: string, fechaIni: string, fechaFin: string, soloCompeticion?: boolean): Promise<Evento[]> {
    let query = (await this.getClient())
      .from('travesias_pasadas')
      .select(this.SELECT_EVENTO)
      .ilike('descripcion', '%'+this.normalizaPatron(pattern)+'%')
      .gte('fecha_evento', fechaIni)
      .lte('fecha_evento', fechaFin);
    if (soloCompeticion) {
      query = query.eq('competicion', true);
    }
    const { data, error } = await query.order('fecha_evento', { ascending: false });

    if (error) {
      console.error('Error al obtener eventos pasados por descripcion y fecha:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByDescripcionAndLugar(descPattern: string, lugarPattern: string): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .ilike('descripcion', '%'+this.normalizaPatron(descPattern)+'%')
      .ilike('lugar_evento', '%'+this.normalizaPatron(lugarPattern)+'%')
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por descripcion y lugar:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByFechaAndLugar(fechaIni: string, fechaFin: string, lugarPattern: string): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .gte('fecha_evento', fechaIni)
      .lte('fecha_evento', fechaFin)
      .ilike('lugar_evento', '%'+this.normalizaPatron(lugarPattern)+'%')
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por fecha y lugar:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByDistanciaAndLugarAndFecha(distanciaIni: number, distanciaFin: number, lugarPattern: string, fechaIni: string, fechaFin: string): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .gte('distancia', distanciaIni)
      .lte('distancia', distanciaFin)
      .ilike('lugar_evento', '%'+this.normalizaPatron(lugarPattern)+'%')
      .gte('fecha_evento', fechaIni)
      .lte('fecha_evento', fechaFin)
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por distancia, lugar y fecha:', error);
      return [];
    }
    return data as Evento[];
  }

  async getEventoByFechaAndDistanciaAndPrecio(fechaIni: string, fechaFin: string, distanciaIni: number, distanciaFin: number, precioIni: number, precioFin: number): Promise<Evento[]> {
    const { data, error } = await (await this.getClient())
      .from('travesias')
      .select(this.SELECT_EVENTO)
      .gte('fecha_evento', fechaIni)
      .lte('fecha_evento', fechaFin)
      .gte('distancia', distanciaIni)
      .lte('distancia', distanciaFin)
      .gte('precio', precioIni)
      .lte('precio', precioFin)
      .order('fecha_evento', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos por fecha, distancia y precio:', error);
      return [];
    }
    return data as Evento[];
  }

}
