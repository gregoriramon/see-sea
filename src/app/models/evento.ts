export interface Evento {
  id: number;
  slug?: string;
  fecha_evento: string;
  descripcion: string;
  lugar_evento: string;
  distancia: string;
  municipio:string;
  provincia:string;
  cod_provincia:string;
  organizador: string;
  precio: number;
  url_info: string;
  url_inscripcion: string;
  fecha_inicio_inscripcion: string;
  fecha_fin_inscripcion: string;
  url_reglamento:string;
  url_oficial:string;
  url_resultados?: string;
  inscripciones_abiertas?: boolean;
  url_inscritos?: string;
  url_redes_sociales?: string;
}
