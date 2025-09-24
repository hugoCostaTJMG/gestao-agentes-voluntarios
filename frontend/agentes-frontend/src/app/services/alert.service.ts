import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AlertType = 'success' | 'info' | 'warning' | 'error';

export interface AlertMessage {
  type: AlertType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly messageSubject = new BehaviorSubject<AlertMessage | null>(null);
  readonly message$: Observable<AlertMessage | null> = this.messageSubject.asObservable();
  private autoClearTimer: any = null;
  private static readonly MAX_DURATION_MS = 10000; // 10s

  show(text: string, type: AlertType = 'info'): void {
    this.messageSubject.next({ text, type });
    // reinicia o timer de auto limpeza
    if (this.autoClearTimer) {
      clearTimeout(this.autoClearTimer);
      this.autoClearTimer = null;
    }
    this.autoClearTimer = setTimeout(() => {
      this.clear();
    }, AlertService.MAX_DURATION_MS);
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  clear(): void {
    this.messageSubject.next(null);
    if (this.autoClearTimer) {
      clearTimeout(this.autoClearTimer);
      this.autoClearTimer = null;
    }
  }
}
