import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ApiService } from '../../services/api.service';
import { ConsultaPublica } from '../../models/interfaces';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-consulta-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, ButtonComponent, BadgeComponent, AlertComponent],
  templateUrl: './consulta-publica.component.html',
  styleUrls: ['./consulta-publica.component.scss']
})
export class ConsultaPublicaComponent implements OnInit, OnDestroy {
  numeroCredencial = '';
  loadingConsulta = false;
  resultado?: ConsultaPublica;
  mensagem?: { tipo: 'success' | 'error'; texto: string };
  private activeStream: MediaStream | null = null;
  private overlayEl: HTMLElement | null = null;
  private zxingControls: { stop: () => void } | null = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    try {
      const chaveParam = this.route.snapshot.paramMap.get('id');
      if (chaveParam) {
        this.loadingConsulta = true;
        this.apiService.verificarCredencial(chaveParam).subscribe({
          next: (dados) => {
            this.resultado = dados;
            this.loadingConsulta = false;
          },
          error: () => {
            this.loadingConsulta = false;
            this.mensagem = { tipo: 'error', texto: 'Credencial não encontrada ou inválida.' };
          }
        });
      }
    } catch {}
  }

  consultarCredencial(): void {
    const chave = this.numeroCredencial.trim();
    if (!chave) {
      this.mensagem = { tipo: 'error', texto: 'Informe o número da credencial para continuar.' };
      this.resultado = undefined;
      return;
    }
    this.loadingConsulta = true;
    this.mensagem = undefined;
    this.resultado = undefined;

    this.apiService.verificarCredencial(chave).subscribe({
      next: (dados) => {
        this.resultado = dados;
        this.loadingConsulta = false;
        this.mensagem = { tipo: 'success', texto: 'Credencial localizada com sucesso.' };
      },
      error: () => {
        this.loadingConsulta = false;
        this.resultado = undefined;
        this.mensagem = { tipo: 'error', texto: 'Credencial não encontrada ou inválida.' };
      }
    });
  }

  async escanearQrCode(): Promise<void> {
    try {
      // Consentimento explícito e finalidade (LGPD)
      const aceitou = window.confirm(
        'Para ler o QR Code, precisamos acessar a câmera. ' +
        'A imagem é processada localmente apenas para leitura e não é armazenada nem enviada. ' +
        'Deseja continuar?'
      );
      if (!aceitou) return;

      const BarcodeDetectorCtor = (window as any).BarcodeDetector;
      if (!BarcodeDetectorCtor) {
        await this.escanearQrCodeFallbackZXing();
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        this.mensagem = { tipo: 'error', texto: 'Dispositivo não suporta acesso à câmera para leitura.' };
        return;
      }

      // Verifica suporte a 'qr_code' se a API disponibilizar
      try {
        const supported: string[] | undefined = await (BarcodeDetectorCtor.getSupportedFormats?.() ?? undefined);
        if (Array.isArray(supported) && !supported.map(s => s.toLowerCase()).includes('qr_code')) {
          await this.escanearQrCodeFallbackZXing();
          return;
        }
      } catch {}

      // Cria overlay temporário e elementos efêmeros (privacidade by default)
      const { container, video, stopAndCleanup } = await this.createScanOverlay();
      this.overlayEl = container;

      // Solicita câmera traseira quando possível
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      this.activeStream = stream;
      video.srcObject = stream;
      await video.play().catch(() => {});

      const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      let isActive = true;

      const scan = async () => {
        if (!isActive) return;
        try {
          const barcodes = await detector.detect(video);
          const code = barcodes?.[0]?.rawValue as string | undefined;
          if (code) {
            isActive = false;
            // Minimização de dados: extrai somente a chave necessária
            const chave = this.extrairChaveDaLeitura(code);
            await stopAndCleanup();
            if (!chave) {
              this.mensagem = { tipo: 'error', texto: 'QR Code inválido para consulta.' };
              return;
            }
            this.numeroCredencial = chave;
            this.consultarCredencial();
            return;
          }
        } catch {
          // Em caso de erro no detector nativo, faz fallback ZXing
          try { await stopAndCleanup(); } catch {}
          await this.escanearQrCodeFallbackZXing();
          return;
        }
        requestAnimationFrame(scan);
      };
      requestAnimationFrame(scan);
    } catch (e) {
      this.mensagem = { tipo: 'error', texto: 'Não foi possível iniciar a leitura do QR Code.' };
      await this.stopCameraAndOverlay();
    }
  }

  // Fallback com ZXing quando BarcodeDetector não estiver disponível/suportado
  private async escanearQrCodeFallbackZXing(): Promise<void> {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        this.mensagem = { tipo: 'error', texto: 'Dispositivo não suporta acesso à câmera para leitura.' };
        return;
      }

      const { container, video, stopAndCleanup } = await this.createScanOverlay();
      this.overlayEl = container;

      const zxing = await import('@zxing/browser');
      const Reader = (zxing as any).BrowserQRCodeReader || (zxing as any).BrowserMultiFormatReader;
      if (!Reader) {
        await stopAndCleanup();
        this.mensagem = { tipo: 'error', texto: 'Leitor de QR Code indisponível neste navegador.' };
        return;
      }
      const codeReader = new Reader();

      // Seleciona câmera traseira quando possível
      let preferred: string | null = null;
      try {
        const list = await (zxing as any).BrowserCodeReader.listVideoInputDevices();
        const back = list?.find((d: any) => /back|traseira|rear|environment/i.test(`${d?.label}`));
        preferred = back?.deviceId || list?.[0]?.deviceId || null;
      } catch {}

      this.zxingControls = await codeReader.decodeFromVideoDevice(
        preferred,
        video,
        async (result: any, err: any, controls: any) => {
          this.zxingControls = controls;
          if (result?.getText) {
            const raw = result.getText();
            const chave = this.extrairChaveDaLeitura(raw);
            try { controls?.stop?.(); } catch {}
            await stopAndCleanup();
            if (!chave) {
              this.mensagem = { tipo: 'error', texto: 'QR Code inválido para consulta.' };
              return;
            }
            this.numeroCredencial = chave;
            this.consultarCredencial();
          }
        }
      );

      // Guarda stream para limpeza
      setTimeout(() => {
        try {
          const s = (video as HTMLVideoElement).srcObject as MediaStream | null;
          if (s) this.activeStream = s;
        } catch {}
      }, 250);
    } catch {
      this.mensagem = { tipo: 'error', texto: 'Falha ao iniciar leitura por ZXing.' };
      await this.stopCameraAndOverlay();
    }
  }

  private extrairChaveDaLeitura(valor: string): string | null {
    const raw = (valor || '').trim();
    if (!raw) return null;
    // Se for URL, tenta extrair a chave do caminho ou query
    try {
      const url = new URL(raw);
      // Ex.: .../public/verificar/{chave}
      const parts = url.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex(p => p.toLowerCase() === 'verificar');
      if (idx >= 0 && parts[idx + 1]) return decodeURIComponent(parts[idx + 1]);
      // Tenta parâmetros comuns
      const byQuery = url.searchParams.get('id') || url.searchParams.get('chave') || url.searchParams.get('key');
      if (byQuery) return byQuery;
    } catch {
      // não é URL, segue fluxo
    }
    // Considera string simples como chave
    return raw;
  }

  private async createScanOverlay(): Promise<{ container: HTMLElement; video: HTMLVideoElement; stopAndCleanup: () => Promise<void> }> {
    // Container overlay (sem armazenar nenhuma imagem)
    const container = document.createElement('div');
    Object.assign(container.style as any, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: '2147483647', flexDirection: 'column', padding: '16px'
    } as any);

    // Texto LGPD
    const info = document.createElement('div');
    info.textContent = 'Privacidade: a imagem da câmera é processada somente no seu dispositivo, não é armazenada nem enviada.';
    Object.assign(info.style as any, { color: '#fff', marginBottom: '8px', textAlign: 'center', fontSize: '0.9rem' } as any);

    // Vídeo de visualização
    const video = document.createElement('video');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('playsinline', 'true');
    Object.assign(video.style as any, { width: 'min(640px, 90vw)', maxHeight: '70vh', borderRadius: '8px', background: '#000' } as any);

    // Botão cancelar
    const btn = document.createElement('button');
    btn.textContent = 'Cancelar';
    Object.assign(btn.style as any, { marginTop: '12px', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' } as any);

    const stopAndCleanup = async () => {
      await this.stopCameraAndOverlay();
    };

    btn.addEventListener('click', stopAndCleanup);

    container.appendChild(info);
    container.appendChild(video);
    container.appendChild(btn);
    document.body.appendChild(container);

    return { container, video, stopAndCleanup };
  }

  private async stopCameraAndOverlay(): Promise<void> {
    try {
      try { this.zxingControls?.stop?.(); } catch {}
      this.zxingControls = null;
      if (this.activeStream) {
        this.activeStream.getTracks().forEach(t => {
          try { t.stop(); } catch {}
        });
      }
    } finally {
      this.activeStream = null;
      if (this.overlayEl && this.overlayEl.parentElement) {
        try { this.overlayEl.parentElement.removeChild(this.overlayEl); } catch {}
      }
      this.overlayEl = null;
    }
  }

  ngOnDestroy(): void {
    // Garantia de limpeza (evitar coleta desnecessária)
    void this.stopCameraAndOverlay();
  }

  limparMensagem(): void {
    this.mensagem = undefined;
  }
}
