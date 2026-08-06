import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

export interface SeoPage {
  title: string;
  description: string;
  /** Path absoluto (`/tabs/...`) o URL completa. Se compone con el origin actual. */
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  robots?: string;
}

const DEFAULT_OG_IMAGE = '/assets/og-image.png';
const SITE_NAME = 'SiSi (SeeSea)';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  setPage(page: SeoPage): void {
    const fullTitle = `${page.title} | ${SITE_NAME}`;
    this.title.setTitle(fullTitle);

    const description = this.clampDescription(page.description);

    this.upsertName('description', description);
    this.upsertName('robots', page.robots ?? 'index,follow');

    const ogImage = page.ogImage ?? DEFAULT_OG_IMAGE;
    const ogType = page.ogType ?? 'website';
    const canonical = this.resolveUrl(page.canonicalPath);

    this.upsertProperty('og:title', fullTitle);
    this.upsertProperty('og:description', description);
    this.upsertProperty('og:type', ogType);
    this.upsertProperty('og:image', this.resolveUrl(ogImage));
    if (canonical) {
      this.upsertProperty('og:url', canonical);
    }

    this.upsertName('twitter:title', fullTitle);
    this.upsertName('twitter:description', description);
    this.upsertName('twitter:image', this.resolveUrl(ogImage));

    this.setCanonical(canonical);
  }

  private clampDescription(text: string, max = 155): string {
    if (!text || text.length <= max) return text;
    const slice = text.slice(0, max);
    const lastSpace = slice.lastIndexOf(' ');
    const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
    return `${cut.replace(/[\s.,;:·—-]+$/, '')}…`;
  }

  private setCanonical(url: string): void {
    if (!url) return;
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /** Inserta o reemplaza un bloque JSON-LD identificado por `id`. */
  setJsonLd(id: string, data: Record<string, unknown>): void {
    this.clearJsonLd(id);
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(data, (_, v) => (v === undefined ? undefined : v));
    this.document.head.appendChild(script);
  }

  /** Elimina un bloque JSON-LD previamente insertado con `setJsonLd`. */
  clearJsonLd(id: string): void {
    const existing = this.document.getElementById(id);
    if (existing) existing.remove();
  }

  /** Devuelve el origin actual (o el `siteUrl` del entorno si no hay window). */
  getOrigin(): string {
    return this.document.defaultView?.location?.origin
      || (environment as { siteUrl?: string }).siteUrl
      || '';
  }

  private upsertName(name: string, content: string): void {
    if (this.meta.getTag(`name="${name}"`)) {
      this.meta.updateTag({ name, content });
    } else {
      this.meta.addTag({ name, content });
    }
  }

  private upsertProperty(property: string, content: string): void {
    if (this.meta.getTag(`property="${property}"`)) {
      this.meta.updateTag({ property, content });
    } else {
      this.meta.addTag({ property, content });
    }
  }

  private resolveUrl(path?: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    // En SSR no hay window.location.origin; fallback al siteUrl del entorno.
    const origin = this.document.defaultView?.location?.origin
      || (environment as { siteUrl?: string }).siteUrl
      || '';
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}
