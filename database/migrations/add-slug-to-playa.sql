-- Añade columna slug a la tabla playa para URLs SEO-friendly.
-- Formato: <playa>-<municipio>-<cod_playa> (cod_playa al final garantiza unicidad).
-- Ejecuta este script en Supabase SQL Editor.

-- 1) Función auxiliar de slugify (idempotente): quita tildes, minúsculas, guiones.
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(
          translate(
            coalesce(input, ''),
            'áàäâãÁÀÄÂÃéèëêÉÈËÊíìïîÍÌÏÎóòöôõÓÒÖÔÕúùüûÚÙÜÛñÑçÇ ',
            'aaaaaAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUnNcC-'
          )
        ),
        '[^a-z0-9-]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
$$;

-- 2) Añadir columna (nullable inicialmente para backfill).
ALTER TABLE public.tb_playas
  ADD COLUMN IF NOT EXISTS slug text;

-- 3) Backfill: <playa>-<municipio>-<cod_playa>.
UPDATE public.tb_playas
SET slug = public.slugify(playa || '-' || coalesce(municipio, '') || '-' || cod_playa)
WHERE slug IS NULL;

-- 4) Índice único (permite futuros NULL si se añade playa nueva sin slug generado).
CREATE UNIQUE INDEX IF NOT EXISTS playa_slug_key
  ON public.tb_playas (slug)
  WHERE slug IS NOT NULL;

-- 5) Índice de búsqueda por slug (mismo unique lo cubre, pero explícito por claridad).
-- Ya cubierto por playa_slug_key.

-- 6) Trigger para autogenerar slug en inserts/updates si viene NULL o cambia el nombre.
CREATE OR REPLACE FUNCTION public.tb_playas_set_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.slugify(NEW.playa || '-' || coalesce(NEW.municipio, '') || '-' || NEW.cod_playa);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_playa_set_slug ON public.tb_playas;
CREATE TRIGGER trg_playa_set_slug
  BEFORE INSERT OR UPDATE OF playa, municipio, cod_playa ON public.tb_playas
  FOR EACH ROW
  EXECUTE FUNCTION public.tb_playas_set_slug();
