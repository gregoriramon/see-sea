export interface Evento {
  id: number;
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
}
