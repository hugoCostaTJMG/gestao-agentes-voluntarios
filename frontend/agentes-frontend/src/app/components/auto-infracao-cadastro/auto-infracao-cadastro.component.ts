import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AutoInfracao, Comarca } from '../../models/interfaces';

@Component({
  selector: 'app-auto-infracao-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auto-infracao-cadastro.component.html',
  styleUrls: ['./auto-infracao-cadastro.component.scss']
})
export class AutoInfracaoCadastroComponent implements OnInit {
  form: FormGroup;
  comarcas: Comarca[] = [];
  selectedFile: File | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    this.form = this.fb.group({
      nomeAutuado: ['', Validators.required],
      cpfCnpjAutuado: ['', [Validators.required, this.cpfCnpjValidator()]],
      enderecoAutuado: ['', Validators.required],
      contatoAutuado: ['', Validators.required],
      comarcaId: ['', Validators.required],
      baseLegal: ['', Validators.required],
      dataInfracao: ['', Validators.required],
      horaInfracao: ['', Validators.required],
      localInfracao: ['', Validators.required],
      descricaoConduta: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.apiService.listarComarcas().subscribe(comarcas => this.comarcas = comarcas);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const auto: AutoInfracao = {
      ...this.form.value,
      comarcaId: Number(this.form.value.comarcaId)
    } as AutoInfracao;

    // Sanitiza CPF/CNPJ antes do envio
    auto.cpfCnpjAutuado = String(this.form.value.cpfCnpjAutuado || '').replace(/\D/g, '');
    if (!this.isValidCpfCnpj(auto.cpfCnpjAutuado)) {
      this.form.get('cpfCnpjAutuado')?.setErrors({ cpfCnpjInvalido: true });
      return;
    }

    this.loading = true;
    this.apiService.cadastrarAuto(auto).subscribe({
      next: autoCriado => {
        if (this.selectedFile) {
          this.apiService.uploadAnexo(autoCriado.id!, this.selectedFile!).subscribe({
            next: () => this.router.navigate(['/autos']),
            error: () => this.loading = false
          });
        } else {
          this.router.navigate(['/autos']);
        }
      },
      error: () => this.loading = false
    });
  }

  // ===== Validações CPF/CNPJ =====
  private cpfCnpjValidator() {
    return (control: any) => {
      const v = (control?.value || '').toString();
      const digits = v.replace(/\D/g, '');
      if (!digits) return { cpfCnpjInvalido: true };
      return this.isValidCpfCnpj(digits) ? null : { cpfCnpjInvalido: true };
    };
  }

  private isValidCpfCnpj(doc: string): boolean {
    const digits = (doc || '').replace(/\D/g, '');
    if (digits.length === 11) return this.isValidCPF(digits);
    if (digits.length === 14) return this.isValidCNPJ(digits);
    return false;
  }

  private isValidCPF(cpf: string): boolean {
    const s = (cpf || '').replace(/\D/g, '');
    if (s.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(s)) return false;
    const calc = (base: string, start: number) => {
      let sum = 0; for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (start - i);
      const mod = sum % 11; return mod < 2 ? 0 : 11 - mod;
    };
    const d1 = calc(s.substring(0, 9), 10);
    const d2 = calc(s.substring(0, 9) + String(d1), 11);
    return s === s.substring(0, 9) + String(d1) + String(d2);
  }

  private isValidCNPJ(cnpj: string): boolean {
    const s = (cnpj || '').replace(/\D/g, '');
    if (s.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(s)) return false;
    const calc = (base: string) => {
      const weights = [6,5,4,3,2,9,8,7,6,5,4,3,2];
      let sum = 0;
      for (let i = 0; i < base.length; i++) {
        sum += parseInt(base[i], 10) * weights[weights.length - base.length + i];
      }
      const mod = sum % 11; return mod < 2 ? 0 : 11 - mod;
    };
    const d1 = calc(s.substring(0, 12));
    const d2 = calc(s.substring(0, 12) + String(d1));
    return s === s.substring(0, 12) + String(d1) + String(d2);
  }

  cancelar(): void {
    this.router.navigate(['/autos']);
  }
}
