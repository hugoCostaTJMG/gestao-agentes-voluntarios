import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-marca',
  standalone: true,
  imports: [],
  templateUrl: './marca.component.html',
  styleUrl: './marca.component.scss'
})
export class MarcaComponent {
  @Input() variant: 'red' | 'black' | 'white' = 'red';
  @Input() width: string = '220px';
  @Input() height: string = 'auto';

  get marcaPath(): string {
    switch (this.variant) {
      case 'black': return 'assets/images/marcas/marca-preto.png';
      case 'white': return 'assets/images/marcas/marca-branco.png';
      default: return 'assets/images/marcas/marca-vermelho.png';
    }
  }
}