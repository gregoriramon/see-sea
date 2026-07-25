export type TipoFeedback = 'bug' | 'mejora' | 'comentario';

export type PlataformaFeedback = 'ios' | 'android' | 'web';
export type ModoFeedback = 'native' | 'pwa' | 'browser';

export interface FeedbackContexto {
  version: string;
  userAgent: string;
  ruta: string;
  idioma: string;
  plataforma: PlataformaFeedback;
  modo: ModoFeedback;
  viewport: { w: number; h: number };
}

export interface Feedback {
  dispositivo_id: string;
  tipo: TipoFeedback;
  titulo?: string;
  contenido: string;
  email?: string;
  contexto?: FeedbackContexto;
}
