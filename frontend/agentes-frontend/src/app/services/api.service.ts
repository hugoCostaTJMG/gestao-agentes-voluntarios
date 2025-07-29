import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { 
  AgenteVoluntario, 
  AgenteVoluntarioDTO, 
  Comarca, 
  AreaAtuacao, 
  Credencial,
  ConsultaPublica,
  LoginGovBr,
  Usuario,
  PaginatedResponse,
  AutoInfracao,
  AnexoAutoInfracao
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Headers com autenticação
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // ===== AUTENTICAÇÃO =====

  loginGovBr(loginData: LoginGovBr): Observable<AgenteVoluntario> {
    return this.http.post<AgenteVoluntario>(`${this.baseUrl}/auth/govbr/login`, loginData);
  }

  verificarCpfCadastrado(cpf: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/auth/govbr/verificar-cpf/${cpf}`);
  }

  gerarUrlAutorizacaoGovBr(redirectUri: string): Observable<{authorizeUrl: string}> {
    const params = new HttpParams().set('redirectUri', redirectUri);
    return this.http.get<{authorizeUrl: string}>(`${this.baseUrl}/auth/govbr/authorize-url`, { params });
  }

  trocarCodigoPorToken(code: string, redirectUri: string): Observable<{accessToken: string}> {
    const params = new HttpParams()
      .set('code', code)
      .set('redirectUri', redirectUri);
    return this.http.post<{accessToken: string}>(`${this.baseUrl}/auth/govbr/token`, null, { params });
  }

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
    });
  }

  buscarAgentePorId(id: string): Observable<AgenteVoluntario> {
    return this.http.get<AgenteVoluntario>(`${this.baseUrl}/api/agentes/${id}`, {
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

  atualizarStatusAgente(id: string, status: string): Observable<AgenteVoluntario> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AgenteVoluntario>(`${this.baseUrl}/api/agentes/${id}/status`, null, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  atualizarAgente(id: string, agente: AgenteVoluntarioDTO): Observable<AgenteVoluntario> {
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

  emitirCredencial(agenteId: string): Observable<Credencial> {
    return this.http.post<Credencial>(`${this.baseUrl}/api/credenciais/emitir/${agenteId}`, null, {
      headers: this.getAuthHeaders()
    });
  }

  listarCredenciaisDoAgente(agenteId: string): Observable<Credencial[]> {
    return this.http.get<Credencial[]>(`${this.baseUrl}/api/credenciais/agente/${agenteId}`, {
      headers: this.getAuthHeaders()
    });
  }

  buscarCredencialPorId(credencialId: string): Observable<Credencial> {
    return this.http.get<Credencial>(`${this.baseUrl}/api/credenciais/${credencialId}`, {
      headers: this.getAuthHeaders()
    });
  }

  gerarPDFCredencial(credencialId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/credenciais/${credencialId}/pdf`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  // ===== CONSULTA PÚBLICA =====

  verificarCredencial(credencialId: string): Observable<ConsultaPublica> {
    return this.http.get<ConsultaPublica>(`${this.baseUrl}/public/verificar/${credencialId}`);
  }

  validarCredencial(credencialId: string): Observable<boolean> {
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

  buscarAutoPorId(id: string): Observable<AutoInfracao> {
    return this.http.get<AutoInfracao>(`${this.baseUrl}/api/autos/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  cadastrarAuto(auto: AutoInfracao): Observable<AutoInfracao> {
    return this.http.post<AutoInfracao>(`${this.baseUrl}/api/autos`, auto, {
      headers: this.getAuthHeaders()
    });
  }

  atualizarAuto(id: string, auto: AutoInfracao): Observable<AutoInfracao> {
    return this.http.put<AutoInfracao>(`${this.baseUrl}/api/autos/${id}`, auto, {
      headers: this.getAuthHeaders()
    });
  }

  cancelarAuto(id: string, justificativa: string): Observable<AutoInfracao> {
    const body = { justificativa };
    return this.http.patch<AutoInfracao>(`${this.baseUrl}/api/autos/${id}/cancelar`, body, {
      headers: this.getAuthHeaders()
    });
  }

  excluirAuto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/autos/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  listarAnexos(autoId: string): Observable<AnexoAutoInfracao[]> {
    return this.http.get<AnexoAutoInfracao[]>(`${this.baseUrl}/api/autos/${autoId}/anexos`, {
      headers: this.getAuthHeaders()
    });
  }

  uploadAnexo(autoId: string, arquivo: File, descricao?: string): Observable<AnexoAutoInfracao> {
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

