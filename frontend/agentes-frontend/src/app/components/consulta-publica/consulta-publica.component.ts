import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consulta-publica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consulta-publica.component.html',
  styleUrls: ['./consulta-publica.component.scss']
})
export class ConsultaPublicaComponent implements OnInit {

  comarcas: any[] = [];
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
      this.errorMessage = 'Usuário não logado';
      return;
    }

    const parsedUser = JSON.parse(currentUser);
    const token = parsedUser.token;

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    this.http.get<any[]>('http://localhost:8080/api/comarcas', { headers })
      .subscribe({
        next: (data) => {
          this.comarcas = data;
          console.log('Comarcas recebidas:', data);
        },
        error: (error) => {
          this.errorMessage = 'Erro ao buscar comarcas';
          console.error(error);
        }
      });
  }
}
