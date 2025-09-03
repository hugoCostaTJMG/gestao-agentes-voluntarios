import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-file-uploader-item',
  standalone: true,
  imports: [CommonModule, NgClass, NgIf],
  templateUrl: './file-uploader-item.component.html',
  styleUrls: ['./file-uploader-item.component.scss'],
})
export class FileUploaderItemComponent {
  @Input() fileName!: string;
  @Input() state: 'idle' | 'uploading' | 'success' | 'error' = 'idle';
  @Input() progress: number = 0;
  @Input() errorPrimary?: string;
  @Input() errorSecondary?: string;
  @Input() removable: boolean = true;
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() removeLabel: string = 'Remover';
  @Input() retryLabel: string = 'Tentar novamente';

  @Output() remove = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();
  @Output() focusPrev = new EventEmitter<void>();
  @Output() focusNext = new EventEmitter<void>();

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Delete' && this.removable) {
      event.preventDefault();
      this.remove.emit();
    } else if (event.key === 'Enter' && this.state === 'error') {
      event.preventDefault();
      this.retry.emit();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusPrev.emit();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusNext.emit();
    }
  }
}

