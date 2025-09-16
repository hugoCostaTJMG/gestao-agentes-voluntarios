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

  show(text: string, type: AlertType = 'info'): void {
    this.messageSubject.next({ text, type });
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  clear(): void {
    this.messageSubject.next(null);
  }
}
