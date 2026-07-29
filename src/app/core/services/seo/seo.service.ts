import { DOCUMENT, Inject, Injectable } from '@angular/core';
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

const DEFAULT_OG_IMAGE = '/assets/icon/web-app-manifest-512x512.png';
const SITE_NAME = 'SiSi (SeeSea)';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  setPage(page: SeoPage): void {
    const fullTitle = `${page.title} | ${SITE_NAME}`;
    this.title.setTitle(fullTitle);

    this.upsertName('description', page.description);
    this.upsertName('robots', page.robots ?? 'index,follow');

    const ogImage = page.ogImage ?? DEFAULT_OG_IMAGE;
    const ogType = page.ogType ?? 'website';
    const canonical = this.resolveUrl(page.canonicalPath);

    this.upsertProperty('og:title', fullTitle);
    this.upsertProperty('og:description', page.description);
    this.upsertProperty('og:type', ogType);
    this.upsertProperty('og:image', this.resolveUrl(ogImage));
    if (canonical) {
      this.upsertProperty('og:url', canonical);
    }

    this.upsertName('twitter:title', fullTitle);
    this.upsertName('twitter:description', page.description);
    this.upsertName('twitter:image', this.resolveUrl(ogImage));

    this.setCanonical(canonical);
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
