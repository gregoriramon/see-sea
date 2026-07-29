-- Crear tabla tb_eventos_websites
-- Ejecuta este script en Supabase SQL Editor para crear la tabla de rastreo de URLs

CREATE TABLE IF NOT EXISTS public.tb_eventos_websites (
  id BIGSERIAL PRIMARY KEY,
  url VARCHAR NOT NULL UNIQUE,
  deporte VARCHAR,
  ubicacion VARCHAR,
  estado VARCHAR DEFAULT 'pendiente', -- pendiente, visitada, error, no_relevante
  fecha_descubierta TIMESTAMPTZ DEFAULT NOW(),
  fecha_visitada TIMESTAMPTZ,
  eventos_encontrados INT DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tb_eventos_websites_deporte ON public.tb_eventos_websites(deporte);
CREATE INDEX IF NOT EXISTS idx_tb_eventos_websites_ubicacion ON public.tb_eventos_websites(ubicacion);
CREATE INDEX IF NOT EXISTS idx_tb_eventos_websites_estado ON public.tb_eventos_websites(estado);
CREATE INDEX IF NOT EXISTS idx_tb_eventos_websites_fecha_descubierta ON public.tb_eventos_websites(fecha_descubierta);

-- Comentarios documentación
COMMENT ON TABLE public.tb_eventos_websites IS 'Rastreo de URLs descubiertas en búsquedas de eventos deportivos (FASE 1)';
COMMENT ON COLUMN public.tb_eventos_websites.estado IS 'Estado de la URL: pendiente (no visitada), visitada (extraída exitosamente), error (no accesible), no_relevante (sin eventos)';
COMMENT ON COLUMN public.tb_eventos_websites.eventos_encontrados IS 'Cantidad de eventos extraídos de esta URL en FASE 2';
