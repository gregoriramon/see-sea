-- Añade columna slug a la tabla travesias para URLs SEO-friendly.
-- Formato: <descripcion>-<lugar>-<yyyy>-<id> (id al final garantiza unicidad).
-- Requiere: función public.slugify (creada por add-slug-to-playa.sql).

-- 1) Añadir columna (nullable inicial para backfill).
ALTER TABLE  public.tb_eventos
  ADD COLUMN IF NOT EXISTS slug text;

-- 2) Backfill.
UPDATE  public.tb_eventos
SET slug = public.slugify(
    coalesce(descripcion, '')
    || '-' || coalesce(lugar_evento, municipio, '')
    || '-' || to_char(coalesce(fecha_evento::date, current_date), 'YYYY')
    || '-' || id::text
  )
WHERE slug IS NULL;

-- 3) Índice único.
CREATE UNIQUE INDEX IF NOT EXISTS travesias_slug_key
  ON  public.tb_eventos (slug)
  WHERE slug IS NOT NULL;

-- 4) Trigger de autogeneración.
CREATE OR REPLACE FUNCTION  public.tb_eventos_set_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.slugify(
      coalesce(NEW.descripcion, '')
      || '-' || coalesce(NEW.lugar_evento, NEW.municipio, '')
      || '-' || to_char(coalesce(NEW.fecha_evento::date, current_date), 'YYYY')
      || '-' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_travesias_set_slug ON  public.tb_eventos;
CREATE TRIGGER trg_travesias_set_slug
  BEFORE INSERT OR UPDATE OF descripcion, lugar_evento, municipio, fecha_evento ON  public.tb_eventos
  FOR EACH ROW
  EXECUTE FUNCTION  public.tb_eventos_set_slug();

-- 5) Misma columna y trigger en travesias_pasadas si existe.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='travesias_pasadas') THEN
    EXECUTE 'ALTER TABLE  public.tb_eventos_pasadas ADD COLUMN IF NOT EXISTS slug text';
    EXECUTE $bf$
      UPDATE  public.tb_eventos_pasadas
      SET slug = public.slugify(
          coalesce(descripcion, '')
          || '-' || coalesce(lugar_evento, municipio, '')
          || '-' || to_char(coalesce(fecha_evento::date, current_date), 'YYYY')
          || '-' || id::text
        )
      WHERE slug IS NULL
    $bf$;
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS travesias_pasadas_slug_key ON  public.tb_eventos_pasadas (slug) WHERE slug IS NOT NULL';
  END IF;
END$$;
