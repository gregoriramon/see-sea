export interface Playa {
  cod_playa: string
  playa: string
  cod_municipo:string
  municipio:string
  cod_provincia: string
  provincia:string
  cod_ccaa:string
  ccaa:string
  prediccion?:Prediccion
}

export interface Prediccion {
  dia: Dia[];
}

export interface Dia {
  fecha: string; // Formato AAAAMMDD
  estadoCielo: EstadoCielo;
  viento: Viento;
  oleaje: Oleaje;
  tMaxima: Temperatura;
  sTermica: SensacionTermica;
  tAgua: Temperatura;
  uvMax: UvMax;
}

interface EstadoCielo {
  f1: '100' | '110' | '120' | '130' | '140' | string;
  descripcion1: string;
  f2: '100' | '110' | '120' | '130' | '140' | string;
  descripcion2: string;
  value: string;
}

interface Viento {
  f1: '210' | '220' | '230' | string;
  descripcion1: string;
  f2: '210' | '220' | '230' | string;
  descripcion2: string;
  value: string;
}

interface Oleaje {
  f1: '310' | '320' | '330' | string;
  descripcion1: string;
  f2: '310' | '320' | '330' | string;
  descripcion2: string;
  value: string;
}

interface SensacionTermica {
  valor1: '410' | '420' | '430' | '440' | '450' | '460' | '470' | '480' | string;
  descripcion1: string;
  value: string;
}

interface Temperatura {
  valor1: number; // Representa el tipo 'byte'
  value: string;
}

interface UvMax {
  valor1: number;
  value: string;
}
