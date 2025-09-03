import { CommonModule, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Observable } from 'rxjs';
import { FileUploaderItemComponent } from './file-uploader-item.component';

export interface UploadItem {
  file: File;
  name: string;
  state: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  errorPrimary?: string;
  errorSecondary?: string;
}

interface Translations {
  dragDrop: string;
  remove: string;
  retry: string;
  errorSize: string;
  errorType: string;
  uploading: string;
  success: string;
}

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CommonModule, NgClass, NgFor, NgIf, NgTemplateOutlet, FileUploaderItemComponent],
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent {
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() accept?: string | string[];
  @Input() maxFileSize?: number;
  @Input() maxFiles?: number;
  @Input() multiple: boolean = true;
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'button' | 'dropzone' | 'both' = 'button';
  @Input() fluid: boolean = false;
  @Input() autoUpload: boolean = false;
  @Input() showSkeleton: boolean = false;
  @Input() uploader?: (file: File) => Observable<number>;
  @Input() translations: Partial<Translations> = {};

  @Output() filesChange = new EventEmitter<File[]>();
  @Output() fileAdded = new EventEmitter<{ file: File }>();
  @Output() fileRemoved = new EventEmitter<{ file: File }>();
  @Output() uploadStart = new EventEmitter<{ files: File[] }>();
  @Output() uploadProgress = new EventEmitter<{ file: File; progress: number }>();
  @Output() uploadSuccess = new EventEmitter<{ file: File }>();
  @Output() uploadError = new EventEmitter<{ file: File; message: string }>();
  @Output() drop = new EventEmitter<{ files: File[] }>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChildren(FileUploaderItemComponent, { read: ElementRef })
  itemElements!: QueryList<ElementRef<HTMLElement>>;

  items: UploadItem[] = [];
  dragActive = false;
  dropzoneError = false;

  private defaultTranslations: Translations = {
    dragDrop: 'Arraste e solte os arquivos aqui ou clique para enviar',
    remove: 'Remover',
    retry: 'Tentar novamente',
    errorSize: 'Arquivo ultrapassa o limite de tamanho.',
    errorType: 'Tipo de arquivo não suportado.',
    uploading: 'Enviando...',
    success: 'Enviado',
  };

  get t(): Translations {
    return { ...this.defaultTranslations, ...this.translations } as Translations;
  }

  get acceptAsString(): string | undefined {
    if (!this.accept) return undefined;
    return Array.isArray(this.accept) ? this.accept.join(',') : this.accept;
  }

  openFileDialog(): void {
    if (this.disabled) return;
    this.fileInput?.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.addFiles(files);
    input.value = '';
  }

  addFiles(files: File[]): void {
    for (const file of files) {
      if (this.maxFiles && this.items.length >= this.maxFiles) {
        this.items.push({
          file,
          name: file.name,
          state: 'error',
          progress: 0,
          errorPrimary: 'Too many files.',
        });
        this.dropzoneError = true;
        continue;
      }
      if (this.isDuplicate(file)) {
        continue;
      }
      const error = this.validateFile(file);
      if (error) {
        this.items.push({
          file,
          name: file.name,
          state: 'error',
          progress: 0,
          errorPrimary: error,
        });
        this.dropzoneError = true;
        continue;
      }
      const item: UploadItem = {
        file,
        name: file.name,
        state: 'idle',
        progress: 0,
      };
      this.items.push(item);
      this.fileAdded.emit({ file });
      if (this.autoUpload) {
        this.startUpload([item]);
      }
    }
    this.emitFilesChange();
  }

  validateFile(file: File): string | null {
    if (this.accept) {
      const acceptList = Array.isArray(this.accept)
        ? this.accept
        : this.accept.split(',');
      const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
      const mime = file.type;
      const accepted = acceptList.some((a) => {
        const acc = a.trim();
        if (acc.endsWith('/*')) {
          return mime.startsWith(acc.slice(0, acc.length - 1));
        }
        return acc === mime || acc.toLowerCase() === fileExt;
      });
      if (!accepted) return this.t.errorType;
    }
    if (this.maxFileSize && file.size > this.maxFileSize) {
      return this.t.errorSize;
    }
    return null;
  }

  isDuplicate(file: File): boolean {
    return this.items.some(
      (i) =>
        i.file.name === file.name &&
        i.file.size === file.size &&
        i.file.lastModified === file.lastModified
    );
  }

  onDropEvent(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled) return;
    this.dragActive = false;
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length) {
      this.addFiles(files);
      this.drop.emit({ files });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.disabled) return;
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive = false;
  }

  onDropzoneKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openFileDialog();
    } else if (event.key === 'Escape') {
      this.dragActive = false;
    }
  }

  startUpload(items: UploadItem[] = this.items.filter((i) => i.state === 'idle')): void {
    if (!items.length) return;
    this.uploadStart.emit({ files: items.map((i) => i.file) });
    for (const item of items) {
      item.state = 'uploading';
      item.progress = 0;
      if (this.uploader) {
        this.uploader(item.file).subscribe({
          next: (p: number) => {
            item.progress = p;
            this.uploadProgress.emit({ file: item.file, progress: p });
          },
          error: (err: any) => {
            item.state = 'error';
            item.errorPrimary = String(err);
            this.uploadError.emit({ file: item.file, message: String(err) });
          },
          complete: () => {
            item.state = 'success';
            item.progress = 100;
            this.uploadSuccess.emit({ file: item.file });
          },
        });
      } else {
        const interval = setInterval(() => {
          if (item.state !== 'uploading') {
            clearInterval(interval);
            return;
          }
          item.progress += 10;
          this.uploadProgress.emit({ file: item.file, progress: item.progress });
          if (item.progress >= 100) {
            clearInterval(interval);
            item.progress = 100;
            if (Math.random() < 0.15) {
              item.state = 'error';
              item.errorPrimary = 'Upload failed.';
              this.uploadError.emit({ file: item.file, message: 'Upload failed.' });
            } else {
              item.state = 'success';
              this.uploadSuccess.emit({ file: item.file });
            }
          }
        }, 200);
      }
    }
  }

  onRemove(item: UploadItem): void {
    this.items = this.items.filter((i) => i !== item);
    this.fileRemoved.emit({ file: item.file });
    this.emitFilesChange();
  }

  retryItem(item: UploadItem): void {
    item.state = 'idle';
    item.errorPrimary = undefined;
    item.errorSecondary = undefined;
    this.startUpload([item]);
  }

  clear(): void {
    this.items = [];
    this.emitFilesChange();
  }

  handleFocusPrev(index: number): void {
    const arr = this.itemElements.toArray();
    if (index > 0) {
      arr[index - 1].nativeElement.focus();
    }
  }

  handleFocusNext(index: number): void {
    const arr = this.itemElements.toArray();
    if (index < arr.length - 1) {
      arr[index + 1].nativeElement.focus();
    }
  }

  emitFilesChange(): void {
    this.filesChange.emit(this.items.map((i) => i.file));
  }
}

