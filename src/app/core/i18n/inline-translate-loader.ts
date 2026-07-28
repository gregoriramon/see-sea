import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, from, of } from 'rxjs';
import esInline from '../../../assets/i18n/es.json';

const INLINE: Record<string, TranslationObject> = {
  es: esInline as unknown as TranslationObject,
};

export class InlineTranslateLoader extends TranslateLoader {
  constructor(private http: HttpClient) {
    super();
  }

  getTranslation(lang: string): Observable<TranslationObject> {
    const cached = INLINE[lang];
    if (cached) {
      return of(cached);
    }
    return from(
      fetch(`assets/i18n/${lang}.json`).then((r) => r.json() as Promise<TranslationObject>)
    );
  }
}
