import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  AgenteVoluntario, 
  AgenteVoluntarioDTO, 
  Comarca, 
  AreaAtuacao, 
  Credencial, 
  ConsultaPublica,
  LoginGovBr,
  Usuario,
  PaginatedResponse
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080';
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // Headers com autenticação
  private getAuthHeaders(): HttpHeaders {
    const user = this.currentUserSubject.value;
    if (user && user.token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${user.token}`,
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
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
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

  // ===== UTILITÁRIOS =====

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: Usuario): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}

