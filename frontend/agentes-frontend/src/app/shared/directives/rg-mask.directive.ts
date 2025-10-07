import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[rgMask]',
  standalone: true
})
export class RgMaskDirective {
  @Input('rgMask') enabled: boolean | '' = true;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    if (this.enabled === false) return;
    const input = this.el.nativeElement;
    const raw = (input.value || '').toUpperCase();
    // Mantém dígitos e, opcionalmente, um 'X' final
    const cleaned = raw.replace(/[^0-9X]/g, '');
    const hasTrailingX = cleaned.endsWith('X');
    const digitsOnly = cleaned.replace(/X/g, '').slice(0, 9); // até 9 dígitos no total

    const pre = digitsOnly.slice(0, 8); // antes do dígito verificador
    const dv = digitsOnly.length > 8 ? digitsOnly.charAt(8) : (hasTrailingX ? 'X' : '');

    let formatted = pre;
    if (pre.length > 2 && pre.length <= 5) {
      formatted = pre.replace(/(\d{2})(\d{0,3})/, (_m, a, b) => `${a}.${b}`);
    } else if (pre.length > 5) {
      formatted = pre.replace(/(\d{2})(\d{3})(\d{0,3})/, (_m, a, b, c) => `${a}.${b}.${c}`);
    }

    if (dv) {
      formatted += `-${dv}`;
    }

    input.value = formatted;
  }
}

