import { Component, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type ListType = 'ordered' | 'unordered';
export type ListSize = 'sm' | 'md' | 'lg';

export interface ListItem {
  text?: string;           // texto simples
  html?: string;           // HTML confiável (renderizado via [innerHTML])
  children?: ListItem[];   // nós aninhados
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  @Input() type: ListType = 'unordered';
  @Input() items: ListItem[] = [];
  @Input() size: ListSize = 'md';
  @Input() columns: 1 | 2 = 1;
  @Input() start: number | null = null;
  @Input() ariaLabel: string = 'Lista';

  constructor(private sanitizer: DomSanitizer) {}

  /** Sanitiza HTML para uso no template. Use apenas para conteúdo interno/confiável. */
  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /** trackBy para performance em *ngFor */
  trackByIndex = (i: number) => i;
}
