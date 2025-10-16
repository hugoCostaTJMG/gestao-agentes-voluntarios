import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AutoInfracao, Comarca, Estabelecimento, Responsavel } from '../../models/interfaces';

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
  estabelecimentos: Estabelecimento[] = [];
  responsaveis: Responsavel[] = [];
  selectedFile: File | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private router: Router) {
    this.form = this.fb.group({
      dataInfracao: ['', Validators.required],
      horarioInfracao: [''],
      localInfracao: ['', Validators.required],
      comarcaTexto: [''],
      fundamentoLegal: [''],
      artigoEca: [''],
      portariaN: [''],
      numeroCriancas: [null],
      numeroAdolescentes: [null],
      assinaturaAutuado: [false],
      nomeComissarioAutuante: [''],
      matriculaAutuante: [''],
      observacoes: [''],
      dataIntimacao: [''],
      prazoDefesa: [''],
      estabelecimentoId: ['', Validators.required],
      responsavelId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.apiService.listarComarcas().subscribe(comarcas => this.comarcas = comarcas);
    this.apiService.listarEstabelecimentos(0, 100).subscribe(resp => {
      this.estabelecimentos = resp.content ?? [];
    });
    this.apiService.listarResponsaveis(0, 100).subscribe(resp => {
      this.responsaveis = resp.content ?? [];
    });
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

    const payload: Partial<AutoInfracao> & Record<string, unknown> = {
      dataInfracao: this.form.value.dataInfracao,
      horarioInfracao: this.form.value.horarioInfracao || null,
      localInfracao: this.form.value.localInfracao,
      comarca: this.form.value.comarcaTexto,
      fundamentoLegal: this.form.value.fundamentoLegal,
      artigoEca: this.form.value.artigoEca,
      portariaN: this.form.value.portariaN,
      numeroCriancas: this.form.value.numeroCriancas != null ? Number(this.form.value.numeroCriancas) : null,
      numeroAdolescentes: this.form.value.numeroAdolescentes != null ? Number(this.form.value.numeroAdolescentes) : null,
      assinaturaAutuado: !!this.form.value.assinaturaAutuado,
      nomeComissarioAutuante: this.form.value.nomeComissarioAutuante,
      matriculaAutuante: this.form.value.matriculaAutuante,
      observacoes: this.form.value.observacoes,
      dataIntimacao: this.form.value.dataIntimacao || null,
      prazoDefesa: this.form.value.prazoDefesa || null,
      estabelecimentoId: Number(this.form.value.estabelecimentoId),
      responsavelId: Number(this.form.value.responsavelId)
    };

    this.loading = true;
    this.apiService.cadastrarAuto(payload as AutoInfracao).subscribe({
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

  cancelar(): void {
    this.router.navigate(['/autos']);
  }
}
