// Interfaces para os modelos de dados
export interface AgenteVoluntario {
  id?: number;
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
  id?: number;
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  disponibilidade?: string;
  comarcasIds: number[];
  areasAtuacaoIds: number[];
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
  id: number;
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
  id: number;
  nomeComarca: string;
}

export interface AreaAtuacao {
  id: number;
  nomeAreaAtuacao: string;
}

export interface Credencial {
  id: number;
  agenteId: number;
  nomeAgente: string;
  cpfAgente: string;
  statusAgente: string;
  dataEmissao: string;
  qrCodeUrl: string;
  usuarioEmissao: string;
}

export interface ConsultaPublica {
  agenteId: number;
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
  id: number;
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

// ===== AUTOS DE INFRAÇÃO =====

export enum StatusAutoInfracao {
  RASCUNHO = 'RASCUNHO',
  REGISTRADO = 'REGISTRADO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export interface AnexoAutoInfracao {
  id?: number;
  autoInfracaoId: number;
  nomeArquivo: string;
  nomeOriginal: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
  caminhoArquivo: string;
  descricao?: string;
  dataUpload?: string;
  usuarioUpload?: string;
}

export interface AutoInfracao {
  id?: number;
  nomeAutuado: string;
  cpfCnpjAutuado: string;
  enderecoAutuado: string;
  contatoAutuado: string;
  agenteId?: number;
  nomeAgente?: string;
  matriculaAgente?: string;
  comarcaId: number;
  baseLegal: string;
  dataInfracao: string;
  horaInfracao: string;
  localInfracao: string;
  descricaoConduta: string;
  iniciaisCrianca?: string;
  idadeCrianca?: number;
  sexoCrianca?: string;
  nomeTestemunha?: string;
  cpfTestemunha?: string;
  assinaturaAutuado?: boolean;
  status?: StatusAutoInfracao;
  dataCadastro?: string;
  dataAtualizacao?: string;
  usuarioCadastro?: string;
  usuarioAtualizacao?: string;
  dataCancelamento?: string;
  usuarioCancelamento?: string;
  justificativaCancelamento?: string;
  anexos?: AnexoAutoInfracao[];
}

