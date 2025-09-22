import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AgenteVoluntario,
  AgenteVoluntarioDTO,
  AgenteVoluntarioResponseDTO,
  Comarca,
  AreaAtuacao,
  Credencial,
  ConsultaPublica,
 
  Usuario,
  PaginatedResponse,
  AutoInfracao,
  AnexoAutoInfracao
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    try {
      const w: any = window as any;
      const runtime = w.APP_CONFIG?.apiUrl || w.__APP_CONFIG__?.apiUrl || w.__env?.API_URL;
      if (runtime && typeof runtime === 'string') {
        this.baseUrl = runtime;
      }
    } catch {}
  }

  // ===== HEADERS =====
  getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

verificarStatusCarteirinha(agenteId: number): Observable<{ podeGerar: boolean, mensagem?: string }> {
  return this.http.get<{ podeGerar: boolean, mensagem?: string }>(
    `${this.baseUrl}/carteirinha/verificar/${agenteId}`,
    { headers: this.getAuthHeaders() }
  );
}

  // Método genérico para download
  download(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
  // api.service.ts
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: this.getAuthHeaders()
    });
  }

  // e assim por diante...

  // ===== AUTENTICAÇÃO =====

  logout(): void {
    this.authService.logout();
  }

  // ===== AGENTES VOLUNTÁRIOS =====
  cadastrarAgente(agente: AgenteVoluntarioDTO): Observable<AgenteVoluntario> {
    return this.http.post<AgenteVoluntario>(`${this.baseUrl}/api/agentes`, agente, {
      headers: this.getAuthHeaders()
    });
  }

 listarAgentes(page: number = 0, size: number = 10): Observable<PaginatedResponse<AgenteVoluntario>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  return this.http.get<PaginatedResponse<AgenteVoluntario>>(`${this.baseUrl}/api/agentes`, {
    headers: this.getAuthHeaders(),
    params
  }).pipe(
    catchError((error) => {
      console.error('Erro ao carregar agentes, usando mock:', error);

      // mock
      const mock: PaginatedResponse<AgenteVoluntario> = {
        content: [
          {
            id: 1,
            nomeCompleto: 'Agente Mock 1',
            cpf: '11122233344',
            telefone: '',
            email: '',
            status: 'ATIVO'
          } as AgenteVoluntario,
          {
            id: 2,
            nomeCompleto: 'Agente Mock 2',
            cpf: '55566677788',
            telefone: '',
            email: '',
            status: 'INATIVO'
          } as AgenteVoluntario,
        ],
        totalElements: 2,
        totalPages: 1,
        size: size,
        number: page
      };

      return of(mock);
    })
  );
}

  buscarAgentePorId(id: number): Observable<AgenteVoluntario> {
    return this.http.get<AgenteVoluntario>(`${this.baseUrl}/api/agentes/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  buscarAgentePorCpf(cpf: string): Observable<AgenteVoluntarioResponseDTO> {
    return this.http.get<AgenteVoluntarioResponseDTO>(`${this.baseUrl}/api/agentes/cpf/${cpf}`, {
      headers: this.getAuthHeaders()
    });
  }

  listarAgentesPorStatus(status: string): Observable<AgenteVoluntario[]> {
    return this.http.get<AgenteVoluntario[]>(`${this.baseUrl}/api/agentes/status/${status}`, {
      headers: this.getAuthHeaders()
    });
  }

  listarAgentesAtivos(): Observable<AgenteVoluntario[]> {
    return this.http.get<AgenteVoluntario[]>(`${this.baseUrl}/api/agentes/ativos`, {
      headers: this.getAuthHeaders()
    });
  }

  atualizarStatusAgente(id: number, status: string): Observable<AgenteVoluntario> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AgenteVoluntario>(`${this.baseUrl}/api/agentes/${id}/status`, null, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  atualizarAgente(id: number, agente: AgenteVoluntarioDTO): Observable<AgenteVoluntario> {
    return this.http.put<AgenteVoluntario>(`${this.baseUrl}/api/agentes/${id}`, agente, {
      headers: this.getAuthHeaders()
    });
  }

  buscarAgentesPorNome(nome: string): Observable<AgenteVoluntario[]> {
    const params = new HttpParams().set('nome', nome);
    return this.http.get<AgenteVoluntario[]>(`${this.baseUrl}/api/agentes/buscar`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  // ===== CREDENCIAIS =====

  emitirCredencial(agenteId: number): Observable<Credencial> {
    return this.http.post<Credencial>(`${this.baseUrl}/api/credenciais/emitir/${agenteId}`, null, {
      headers: this.getAuthHeaders()
    });
  }

  listarCredenciaisDoAgente(agenteId: number): Observable<Credencial[]> {
    return this.http.get<Credencial[]>(`${this.baseUrl}/api/credenciais/agente/${agenteId}`, {
      headers: this.getAuthHeaders()
    });
  }

  buscarCredencialPorId(credencialId: number): Observable<Credencial> {
    return this.http.get<Credencial>(`${this.baseUrl}/api/credenciais/${credencialId}`, {
      headers: this.getAuthHeaders()
    });
  }

  gerarPDFCredencial(credencialId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/credenciais/${credencialId}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  // ===== CONSULTA PÚBLICA =====

  verificarCredencial(credencialId: number): Observable<ConsultaPublica> {
    return this.http.get<ConsultaPublica>(`${this.baseUrl}/public/verificar/${credencialId}`);
  }

  validarCredencial(credencialId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/public/validar/${credencialId}`);
  }

  // ===== COMARCAS =====

  listarComarcas(): Observable<Comarca[]> {
    return this.http.get<Comarca[]>(`${this.baseUrl}/api/comarcas`, {
      headers: this.getAuthHeaders()
    });
  }

  cadastrarComarca(comarca: Comarca): Observable<Comarca> {
    return this.http.post<Comarca>(`${this.baseUrl}/api/comarcas`, comarca, {
      headers: this.getAuthHeaders()
    });
  }

  // ===== ÁREAS DE ATUAÇÃO =====

  listarAreasAtuacao(): Observable<AreaAtuacao[]> {
    return this.http.get<AreaAtuacao[]>(`${this.baseUrl}/api/areas-atuacao`, {
      headers: this.getAuthHeaders()
    });
  }

  cadastrarAreaAtuacao(area: AreaAtuacao): Observable<AreaAtuacao> {
    return this.http.post<AreaAtuacao>(`${this.baseUrl}/api/areas-atuacao`, area, {
      headers: this.getAuthHeaders()
    });
  }

  // ===== AUTOS DE INFRAÇÃO =====

  listarAutos(page: number = 0, size: number = 10, filtros?: any): Observable<PaginatedResponse<AutoInfracao>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== undefined && filtros[key] !== '') {
          params = params.set(key, filtros[key]);
        }
      });
    }

    return this.http.get<PaginatedResponse<AutoInfracao>>(`${this.baseUrl}/api/autos`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  buscarAutoPorId(id: number): Observable<AutoInfracao> {
    return this.http.get<AutoInfracao>(`${this.baseUrl}/api/autos/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  cadastrarAuto(auto: AutoInfracao): Observable<AutoInfracao> {
    return this.http.post<AutoInfracao>(`${this.baseUrl}/api/autos`, auto, {
      headers: this.getAuthHeaders()
    });
  }

  atualizarAuto(id: number, auto: AutoInfracao): Observable<AutoInfracao> {
    return this.http.put<AutoInfracao>(`${this.baseUrl}/api/autos/${id}`, auto, {
      headers: this.getAuthHeaders()
    });
  }

  cancelarAuto(id: number, justificativa: string): Observable<AutoInfracao> {
    const body = { justificativa };
    return this.http.patch<AutoInfracao>(`${this.baseUrl}/api/autos/${id}/cancelar`, body, {
      headers: this.getAuthHeaders()
    });
  }

  excluirAuto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/autos/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  listarAnexos(autoId: number): Observable<AnexoAutoInfracao[]> {
    return this.http.get<AnexoAutoInfracao[]>(`${this.baseUrl}/api/autos/${autoId}/anexos`, {
      headers: this.getAuthHeaders()
    });
  }

  uploadAnexo(autoId: number, arquivo: File, descricao?: string): Observable<AnexoAutoInfracao> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    if (descricao) {
      formData.append('descricao', descricao);
    }

    return this.http.post<AnexoAutoInfracao>(`${this.baseUrl}/api/autos/${autoId}/anexos`, formData, {
      headers: this.getAuthHeaders().delete('Content-Type')
    });
  }

  downloadAnexo(anexoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/anexos/${anexoId}/download`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  excluirAnexo(anexoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/anexos/${anexoId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ===== UTILITÁRIOS =====

  getCurrentUser(): Usuario | null {
    return this.authService.getCurrentUser();
  }

  setCurrentUser(user: Usuario): void {
    this.authService.setCurrentUser(user);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
