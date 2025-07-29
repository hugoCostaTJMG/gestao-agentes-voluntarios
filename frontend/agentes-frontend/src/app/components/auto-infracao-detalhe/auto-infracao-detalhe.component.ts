import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AutoInfracao, AnexoAutoInfracao } from '../../models/interfaces';

@Component({
  selector: 'app-auto-infracao-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-infracao-detalhe.component.html',
  styleUrls: ['./auto-infracao-detalhe.component.scss']
})
export class AutoInfracaoDetalheComponent implements OnInit {
  auto: AutoInfracao | null = null;
  anexos: AnexoAutoInfracao[] = [];
  justificativa = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.buscarAutoPorId(id).subscribe(a => {
        this.auto = a;
        this.carregarAnexos();
      });
    }
  }

  carregarAnexos(): void {
    if (!this.auto) return;
    this.api.listarAnexos(this.auto.id!).subscribe(anx => this.anexos = anx);
  }

  download(anexoId: number): void {
    this.api.downloadAnexo(anexoId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'anexo';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  cancelarAuto(): void {
    if (!this.auto) return;
    this.api.cancelarAuto(this.auto.id!, this.justificativa).subscribe(() => this.router.navigate(['/autos']));
  }
}
