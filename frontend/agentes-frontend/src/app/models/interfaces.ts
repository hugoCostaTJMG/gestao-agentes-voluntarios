// Interfaces para os modelos de dados
export interface AgenteVoluntario {
  id?: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  disponibilidade?: string;
  status?: string;
  dataCadastro?: string;
  usuarioCadastro?: string;
  comarcas?: Comarca[];
  areasAtuacao?: AreaAtuacao[];
}

export interface AgenteVoluntarioDTO {
  id?: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  disponibilidade?: string;
  comarcasIds: string[];
  areasAtuacaoIds: string[];
  dataNascimento?: string;
  fotoBase64?: string;
  nacionalidade?: string;
  numeroCarteiraIdentidade?: string;
  dataExpedicaoCI?: string;
  filiacaoMae?: string;
  filiacaoPai?: string;
  naturalidade?: string;
  uf?: string;
}

export interface AgenteVoluntarioResponseDTO {
  id: string;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  disponibilidade?: string;
  status: string;
  dataCadastro: string;
  usuarioCadastro?: string;
  comarcas?: Comarca[];
  areasAtuacao?: AreaAtuacao[];
}

export interface Comarca {
  id: string;
  nomeComarca: string;
}

export interface AreaAtuacao {
  id: string;
  nomeAreaAtuacao: string;
}

export interface Credencial {
  id: string;
  agenteId: string;
  nomeAgente: string;
  cpfAgente: string;
  statusAgente: string;
  dataEmissao: string;
  qrCodeUrl: string;
  usuarioEmissao: string;
}

export interface ConsultaPublica {
  agenteId: string;
  nomeCompleto: string;
  situacao: string;
  dataCadastro: string;
  comarcasAtuacao: string;
}

export interface LoginGovBr {
  cpf: string;
  govBrToken: string;
  nomeCompleto?: string;
  email?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  token?: string;
}

export enum StatusAgente {
  EM_ANALISE = 'EM_ANALISE',
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  QUADRO_RESERVA = 'QUADRO_RESERVA'
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

