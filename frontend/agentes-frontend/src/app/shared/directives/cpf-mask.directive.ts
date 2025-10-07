import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[cpfMask]',
  standalone: true
})
export class CpfMaskDirective {
  @Input('cpfMask') enabled: boolean | '' = true;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(): void {
    if (this.enabled === false) return;
    const input = this.el.nativeElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 9) {
      formatted = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_m, a, b, c, d) => {
        return `${a}.${b}.${c}${d ? '-' + d : ''}`;
      });
    } else if (digits.length > 6) {
      formatted = digits.replace(/(\d{3})(\d{3})(\d{0,3})/, (_m, a, b, c) => `${a}.${b}.${c}`);
    } else if (digits.length > 3) {
      formatted = digits.replace(/(\d{3})(\d{0,3})/, (_m, a, b) => `${a}.${b}`);
    }
    input.value = formatted;
  }
}

