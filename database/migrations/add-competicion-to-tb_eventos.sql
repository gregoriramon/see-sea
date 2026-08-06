ALTER TABLE tb_eventos
  ADD COLUMN IF NOT EXISTS competicion BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN tb_eventos.competicion IS
  'Indica si el evento es una competición (true) o una travesía no competitiva (false).';

ALTER TABLE tb_eventos
  ADD COLUMN IF NOT EXISTS competicion_nacional BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS federacion TEXT;

COMMENT ON COLUMN tb_eventos.competicion_nacional IS
  'Indica si la competición es de ámbito nacional (RCNE).';

COMMENT ON COLUMN tb_eventos.federacion IS
  'Nombre o siglas de la federación organizadora de la competición.';
