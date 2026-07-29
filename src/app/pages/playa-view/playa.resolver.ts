import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { Playa } from 'src/app/models/playa';

/**
 * Resolver que carga la playa antes de activar la ruta.
 * Angular router espera esta promesa → SSR incluye datos + meta.
 */
export const playaResolver: ResolveFn<Playa | null> = async (route) => {
  const slugOrCod = route.paramMap.get('slug');
  if (!slugOrCod) return null;
  const supabase = inject(Supabase);
  const esCodigoLegacy = /^\d+$/.test(slugOrCod);
  try {
    const playa = esCodigoLegacy
      ? await supabase.getPlayaByCodPlayaConPrediccion(slugOrCod)
      : await supabase.getPlayaBySlugConPrediccion(slugOrCod);
    return playa?.cod_playa ? playa : null;
  } catch {
    return null;
  }
};
