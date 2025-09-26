import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[phoneMask]',
  standalone: true
})
export class PhoneMaskDirective {
  @Input('phoneMask') enabled: boolean | '' = true;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    if (this.enabled === false) return;
    const input = this.el.nativeElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    let v = digits;

    if (digits.length >= 1) {
      v = `(${digits.substring(0, 2)}`;
      if (digits.length >= 3) {
        v += `) `;
        if (digits.length >= 7) {
          // Decide entre 4 ou 5 no primeiro bloco após DDD
          const isMobile = digits.length > 10; // 11 dígitos
          const firstBlock = isMobile ? digits.substring(2, 7) : digits.substring(2, 6);
          const rest = isMobile ? digits.substring(7) : digits.substring(6);
          v += firstBlock;
          if (rest.length) v += `-${rest}`;
        } else if (digits.length > 2) {
          v += digits.substring(2);
        }
      }
    }

    input.value = v;
  }
}

