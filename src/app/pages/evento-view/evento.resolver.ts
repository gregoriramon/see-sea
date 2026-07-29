import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { Evento } from 'src/app/models/evento';

/**
 * Resolver que carga el evento antes de activar la ruta.
 * Soporta rutas /tabs/travesia/:slug y /tabs/evento/:id (legacy).
 */
export const eventoResolver: ResolveFn<Evento | null> = async (route) => {
  const slug = route.paramMap.get('slug');
  const idParam = route.paramMap.get('id');
  const fechaParam = route.queryParamMap.get('fecha');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const esPasado = fechaParam ? new Date(fechaParam) < hoy : false;

  const supabase = inject(Supabase);
  try {
    if (slug) {
      return esPasado
        ? await supabase.getEventoPasadoBySlug(slug)
        : await supabase.getEventoBySlug(slug);
    }
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (isNaN(id)) return null;
      return esPasado
        ? await supabase.getEventoPasadoById(id)
        : await supabase.getEventoById(id);
    }
    return null;
  } catch {
    return null;
  }
};
