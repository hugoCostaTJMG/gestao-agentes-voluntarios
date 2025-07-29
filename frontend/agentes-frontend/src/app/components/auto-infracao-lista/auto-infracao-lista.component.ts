import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AutoInfracao, PaginatedResponse, StatusAutoInfracao } from '../../models/interfaces';

@Component({
  selector: 'app-auto-infracao-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-infracao-lista.component.html',
  styleUrls: ['./auto-infracao-lista.component.scss']
})
export class AutoInfracaoListaComponent implements OnInit {
  autos: AutoInfracao[] = [];
  page = 0;
  totalPages = 0;
  filtros: any = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.api.listarAutos(this.page, 10, this.filtros).subscribe((resp: PaginatedResponse<AutoInfracao>) => {
      this.autos = resp.content;
      this.totalPages = resp.totalPages;
    });
  }

  aplicarFiltros(): void {
    this.page = 0;
    this.carregar();
  }
}
