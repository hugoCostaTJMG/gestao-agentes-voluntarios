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

  constructor(private fb: FormBuilder, private api: ApiService, private router: Router) {
    this.form = this.fb.group({
      nomeAutuado: ['', Validators.required],
      cpfCnpjAutuado: ['', Validators.required],
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
    this.api.listarComarcas().subscribe(cs => this.comarcas = cs);
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
      ...this.form.value
    } as AutoInfracao;

    this.loading = true;
    this.api.cadastrarAuto(auto).subscribe({
      next: a => {
        if (this.selectedFile) {
          this.api.uploadAnexo(a.id!, this.selectedFile!).subscribe({
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
