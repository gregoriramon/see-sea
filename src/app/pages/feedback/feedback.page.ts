import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonButton,
  IonNote,
  ToastController,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { Supabase } from 'src/app/core/services/supabase/supabase';
import { LocalRepositoryService } from 'src/app/core/services/local-repository/local-repository.service';
import { SeoService } from 'src/app/core/services/seo/seo.service';
import { Capacitor } from '@capacitor/core';
import { Feedback, FeedbackContexto, ModoFeedback, PlataformaFeedback, TipoFeedback } from 'src/app/models/feedback';

const APP_VERSION = '0.1.0';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    IonContent,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonButton,
    IonNote,
    HeaderComponent,
  ],
})
export class FeedbackPage implements OnDestroy {
  private supabase = inject(Supabase);
  private localRepository = inject(LocalRepositoryService);
  private toastCtrl = inject(ToastController);
  private translate = inject(TranslateService);
  private seo = inject(SeoService);
  private location = inject(Location);

  tipo: TipoFeedback = 'comentario';
  titulo = '';
  contenido = '';
  email = this.localRepository.obtenerEmail();
  enviando = false;

  private deviceId = '';
  private sub: Subscription;

  constructor() {
    this.sub = this.localRepository.deviceId$.subscribe((id) => (this.deviceId = id));
    // Constructor sí corre en SSR; asegura meta para prerender.
    this.applySeo();
  }

  ionViewWillEnter(): void {
    this.applySeo();
  }

  private applySeo(): void {
    this.seo.setPage({
      title: 'Enviar feedback',
      description: 'Cuéntanos qué te parece SiSi: sugerencias, ideas o errores. Nos ayuda a mejorar la app.',
      canonicalPath: '/feedback',
      robots: 'noindex,follow',
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  puedeEnviar(): boolean {
    if (this.enviando) return false;
    if (!this.contenido || this.contenido.trim().length === 0) return false;
    if (this.email && !EMAIL_REGEX.test(this.email.trim())) return false;
    return true;
  }

  async enviar() {
    if (!this.puedeEnviar()) return;
    this.enviando = true;

    const emailIngresado = this.email.trim();
    if (emailIngresado && EMAIL_REGEX.test(emailIngresado) && emailIngresado !== this.localRepository.obtenerEmail()) {
      this.localRepository.guardarEmail(emailIngresado);
    }

    const plataforma = Capacitor.getPlatform() as PlataformaFeedback;
    const esStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const modo: ModoFeedback =
      plataforma !== 'web' ? 'native' : esStandalone ? 'pwa' : 'browser';

    const contexto: FeedbackContexto = {
      version: APP_VERSION,
      userAgent: navigator.userAgent,
      ruta: window.location.pathname + window.location.hash,
      idioma: this.localRepository.obtenerIdioma(),
      plataforma,
      modo,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    };

    const feedback: Feedback = {
      dispositivo_id: this.deviceId,
      tipo: this.tipo,
      contenido: this.contenido.trim(),
      contexto,
    };
    if (this.titulo.trim()) feedback.titulo = this.titulo.trim();
    if (this.email.trim()) feedback.email = this.email.trim();

    const { error } = await this.supabase.enviaFeedback(feedback);
    this.enviando = false;

    if (error) {
      this.mostrarToast('feedback.error', 'danger');
      return;
    }

    this.mostrarToast('feedback.exito', 'success');
    this.location.back();
  }

  cancelar() {
    this.location.back();
  }

  private async mostrarToast(key: string, color: 'success' | 'danger') {
    const message = this.translate.instant(key);
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
