import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,       
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})

export class LogoComponent {
  @Input() variant: 'color' | 'black' | 'white' = 'color';
  @Input() width: string = '180px';
  @Input() height: string = 'auto';

  get logoPath(): string {
    switch (this.variant) {
      case 'black': return 'assets/images/logos/logo-preto-linhas.png';
      case 'white': return 'assets/images/logos/logo-branco-linhas.png';
      default: return 'assets/images/logos/logo-vermelho-preto.png';
    }
  }
}