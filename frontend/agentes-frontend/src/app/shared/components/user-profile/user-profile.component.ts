import { CommonModule, NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Injectable, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, EMPTY, Observable, Subject, of, throwError } from 'rxjs';
import { catchError, delay, finalize, takeUntil, tap } from 'rxjs/operators';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Agente' | 'Outro';
  phone?: string;
  unit?: string;
  availability?: string;
  avatarUrl?: string;
  updatedAt?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
}

interface PasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class UserProfileService {
  private readonly latency = 800;
  private readonly profile$ = new BehaviorSubject<UserProfile>({
    id: 'usr-001',
    name: 'Ana Paula Oliveira',
    email: 'ana.oliveira@example.com',
    role: 'Agente',
    phone: '+55 11 98888-1234',
    unit: 'Comarca de São Paulo',
    availability: 'Seg a Sex - 09h às 17h',
    avatarUrl: 'https://i.pravatar.cc/160?img=47',
    updatedAt: new Date().toISOString(),
    preferences: {
      theme: 'system',
      emailNotifications: true,
    },
  });

  getProfile(): Observable<UserProfile> {
    return this.profile$.pipe(delay(this.latency));
  }

  updateProfile(payload: Partial<UserProfile>): Observable<UserProfile> {
    const updated: UserProfile = {
      ...this.profile$.value,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    this.profile$.next(updated);
    return of(updated).pipe(delay(this.latency));
    // TODO: integrar com endpoint real, ex.: PATCH /api/me
  }

  updateAvatar(file: File): Observable<string> {
    const currentAvatar = this.profile$.value.avatarUrl;
    if (currentAvatar?.startsWith('blob:')) {
      URL.revokeObjectURL(currentAvatar);
    }
    const fakeUrl = URL.createObjectURL(file);
    const updated = {
      ...this.profile$.value,
      avatarUrl: fakeUrl,
      updatedAt: new Date().toISOString(),
    };
    this.profile$.next(updated);
    return of(fakeUrl).pipe(delay(this.latency));
    // TODO: integrar com endpoint real, ex.: POST /api/me/avatar
  }

  changePassword(payload: PasswordPayload): Observable<void> {
    if (payload.currentPassword === 'erro') {
      return throwError(() => new Error('Senha atual incorreta.')); // Simulação de erro
    }

    return of(void 0).pipe(delay(this.latency));
    // TODO: integrar com endpoint real, ex.: POST /api/me/password
  }
}

@Component({
  standalone: true,
  selector: 'app-user-profile',
  imports: [CommonModule, NgClass, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  providers: [UserProfileService]
})
export class UserProfileComponent implements OnInit, OnDestroy, OnChanges {
  @Input() readonly = false;
  @Input() skeleton = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fluid = false;

  @Output() saved = new EventEmitter<UserProfile>();
  @Output() avatarChanged = new EventEmitter<string>();
  @Output() passwordChanged = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  @ViewChild('titleRef', { static: false }) titleRef?: ElementRef<HTMLHeadingElement>;
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('changePhotoBtn', { static: false }) changePhotoBtn?: ElementRef<HTMLButtonElement>;

  readonly idPrefix = `user-profile-${Math.random().toString(36).substring(2, 9)}`;
  profileForm: FormGroup;
  preferencesForm: FormGroup;
  passwordForm: FormGroup;

  loading = false;
  saving = false;
  passwordSaving = false;
  avatarLoading = false;
  errorMsg = '';
  successMsg = '';
  passwordMsg = '';
  avatarPreview?: string | null;
  private destroy$ = new Subject<void>();
  private snapshot?: UserProfile;

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: UserProfileService,
    private readonly hostRef: ElementRef<HTMLElement>
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.pattern(/^\+?[0-9\s()-]{8,20}$/)]],
      unit: [''],
      availability: [''],
    });

    this.preferencesForm = this.fb.group({
      theme: ['system', Validators.required],
      emailNotifications: [false],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.uppercaseValidator, this.numberValidator]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (!this.skeleton) {
      this.loadProfile();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['skeleton'] && !changes['skeleton'].currentValue && !this.snapshot) {
      this.loadProfile();
    }

    if (changes['readonly']) {
      this.applyReadonlyState();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.avatarPreview);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && !this.hostRef.nativeElement.contains(target)) {
      return;
    }

    const isSave = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
    if (isSave) {
      event.preventDefault();
      this.onSave();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      const tagName = target?.tagName?.toLowerCase();
      if (tagName && tagName !== 'textarea' && tagName !== 'button' && tagName !== 'a') {
        event.preventDefault();
        this.onSave();
        return;
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }
  }

  onSave(): void {
    if (this.readonly || this.profileForm.invalid || this.preferencesForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.preferencesForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload: Partial<UserProfile> = {
      ...this.profileForm.getRawValue(),
      preferences: this.preferencesForm.value,
      avatarUrl: this.avatarPreview || undefined,
    };

    if (typeof payload.name === 'string') {
      payload.name = payload.name.trim();
      this.profileForm.get('name')?.setValue(payload.name, { emitEvent: false });
    }

    this.service.updateProfile(payload).pipe(
      takeUntil(this.destroy$),
      tap(profile => {
        this.snapshot = profile;
        this.avatarPreview = profile.avatarUrl ?? this.avatarPreview;
        this.successMsg = 'Perfil atualizado com sucesso.';
        this.saved.emit(profile);
      }),
      catchError((error: Error) => {
        this.errorMsg = error.message || 'Não foi possível atualizar o perfil.';
        return of(this.snapshot as UserProfile);
      }),
      finalize(() => {
        this.saving = false;
        setTimeout(() => this.focusTitle(), 0);
      })
    ).subscribe();
  }

  onChangeAvatar(event: Event): void {
    if (this.readonly) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.restoreFocusToAvatarButton();
      return;
    }

    const isValidType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
    if (!isValidType) {
      this.errorMsg = 'Formato de imagem não suportado.';
      this.clearFileInput();
      this.restoreFocusToAvatarButton();
      return;
    }

    const currentPreview = this.avatarPreview;
    if (currentPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(currentPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    this.avatarPreview = previewUrl;
    this.avatarLoading = true;
    this.service.updateAvatar(file).pipe(
      takeUntil(this.destroy$),
      tap(url => {
        this.avatarPreview = url;
        this.successMsg = 'Avatar atualizado com sucesso.';
        this.errorMsg = '';
        this.avatarChanged.emit(url);
      }),
      catchError((error: Error) => {
        this.errorMsg = error.message || 'Erro ao atualizar avatar.';
        this.avatarPreview = currentPreview || this.snapshot?.avatarUrl;
        return of('');
      }),
      finalize(() => {
        this.avatarLoading = false;
        if (previewUrl && previewUrl !== this.avatarPreview && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        this.clearFileInput();
        this.restoreFocusToAvatarButton();
      })
    ).subscribe();
  }

  openAvatarDialog(): void {
    if (this.readonly) {
      return;
    }
    this.fileInput?.nativeElement.click();
  }

  removeAvatar(): void {
    if (this.readonly) {
      return;
    }

    if (this.avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.avatarPreview);
    }
    this.avatarPreview = undefined;
    this.successMsg = 'Avatar removido. Salve para aplicar permanentemente.';
    this.errorMsg = '';
  }

  onChangePassword(): void {
    if (this.readonly || this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordSaving = true;
    this.passwordMsg = '';
    this.errorMsg = '';

    const payload: PasswordPayload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
    };

    this.service.changePassword(payload).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.passwordMsg = 'Senha alterada com sucesso.';
        this.passwordChanged.emit();
        this.passwordForm.reset();
      }),
      catchError((error: Error) => {
        this.errorMsg = error.message || 'Erro ao alterar senha.';
        return of(void 0);
      }),
      finalize(() => {
        this.passwordSaving = false;
      })
    ).subscribe();
  }

  onCancel(): void {
    if (this.readonly) {
      this.canceled.emit();
      return;
    }

    this.restoreSnapshot();
    this.canceled.emit();
  }

  onRevert(): void {
    if (this.readonly) {
      return;
    }

    this.restoreSnapshot();
  }

  get passwordStrength(): 'fraca' | 'media' | 'forte' {
    const value: string = this.passwordForm.value.newPassword || '';
    if (!value) {
      return 'fraca';
    }

    const strong = value.length >= 12 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value);
    const medium = value.length >= 9 && /[A-Z]/.test(value) && /[0-9]/.test(value);

    if (strong) {
      return 'forte';
    }

    if (medium) {
      return 'media';
    }

    return 'fraca';
  }

  get lastUpdatedLabel(): string {
    if (!this.snapshot?.updatedAt) {
      return '';
    }

    const date = new Date(this.snapshot.updatedAt);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  get avatarUrl(): string | undefined {
    return this.avatarPreview || this.snapshot?.avatarUrl || undefined;
  }

  focusTitle(): void {
    setTimeout(() => {
      this.titleRef?.nativeElement?.focus();
    });
  }

  private loadProfile(): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.service.getProfile().pipe(
      takeUntil(this.destroy$),
      tap(profile => {
        this.snapshot = profile;
        this.avatarPreview = profile.avatarUrl;
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
          phone: profile.phone ?? '',
          unit: profile.unit ?? '',
          availability: profile.availability ?? '',
        });
        this.preferencesForm.patchValue(profile.preferences ?? {
          theme: 'system',
          emailNotifications: true,
        });
        this.profileForm.markAsPristine();
        this.preferencesForm.markAsPristine();
        this.applyReadonlyState();
        this.focusTitle();
      }),
      catchError((error: Error) => {
        this.errorMsg = error.message || 'Não foi possível carregar o perfil.';
        this.successMsg = '';
        return EMPTY;
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  private restoreSnapshot(): void {
    if (!this.snapshot) {
      return;
    }

    this.profileForm.reset({
      name: this.snapshot.name,
      email: this.snapshot.email,
      phone: this.snapshot.phone ?? '',
      unit: this.snapshot.unit ?? '',
      availability: this.snapshot.availability ?? '',
    });

    this.preferencesForm.reset(this.snapshot.preferences ?? {
      theme: 'system',
      emailNotifications: true,
    });

    this.passwordForm.reset();
    this.avatarPreview = this.snapshot.avatarUrl;
    this.successMsg = '';
    this.errorMsg = '';
    this.passwordMsg = '';
    this.applyReadonlyState();
  }

  private applyReadonlyState(): void {
    const shouldDisable = this.readonly;
    const controls = [this.profileForm, this.preferencesForm, this.passwordForm];
    controls.forEach(form => {
      if (shouldDisable) {
        form.disable({ emitEvent: false });
      } else {
        form.enable({ emitEvent: false });
      }
    });

    this.profileForm.get('email')?.disable({ emitEvent: false });
  }

  private clearFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private restoreFocusToAvatarButton(): void {
    setTimeout(() => this.changePhotoBtn?.nativeElement.focus(), 0);
  }

  private uppercaseValidator(control: import('@angular/forms').AbstractControl) {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    return /[A-Z]/.test(value) ? null : { uppercase: true };
  }

  private numberValidator(control: import('@angular/forms').AbstractControl) {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    return /[0-9]/.test(value) ? null : { number: true };
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
  }
}
