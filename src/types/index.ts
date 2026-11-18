export type UserRole = 'cidadao' | 'empresa' | 'admin';

export type OccurrenceType =
  | 'tubagem_rompida'
  | 'fuga_visivel'
  | 'agua_alagar_via'
  | 'fuga_residencia'
  | 'fuga_subterranea'
  | 'outro';

export type OccurrencePriority = 'baixa' | 'media' | 'alta' | 'critica';

export type OccurrenceStatus =
  | 'recebida'
  | 'em_analise'
  | 'encaminhada'
  | 'intervencao_programada'
  | 'em_resolucao'
  | 'resolvida'
  | 'encerrada'
  | 'rejeitada';

export type CompanyStatus = 'pendente' | 'verificada' | 'rejeitada' | 'suspensa';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // SHA-256 hex da senha (apenas para empresa e admin)
  phone?: string;
  role: UserRole;
  companyId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  officialName: string;
  nuit?: string;
  address: string;
  province: string;
  city: string;
  phone: string;
  email: string;
  representativeName: string;
  serviceAreas: string[]; // ex: ["Polana Caniço", "Maxaquene", "Central", "Matola"]
  servicesDescription: string;
  documentsSubmitted?: string[];
  status: CompanyStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface StatusHistoryEntry {
  id: string;
  previousStatus: OccurrenceStatus | null;
  newStatus: OccurrenceStatus;
  changedBy: string; // nome ou identificador
  changedByRole: UserRole;
  note: string;
  evidenceUrl?: string;
  timestamp: string;
}

export interface Occurrence {
  id: string;
  code: string; // Ex: GOTA-2026-1042
  type: OccurrenceType;
  typeLabel: string;
  description?: string;
  status: OccurrenceStatus;
  priority: OccurrencePriority;
  priorityNeedsConfirmation: boolean;
  priorityReason: string;

  // Localização
  location: {
    latitude: number;
    longitude: number;
    province: string;
    city: string;
    neighborhood: string; // Bairro
    street?: string; // Rua
    referencePoint?: string; // Ponto de referência
    isGpsAccurate: boolean;
  };

  // Fotografias
  photos: string[]; // URLs ou base64 comprimidos

  // Contacto opcional do comunicante (privado, nunca exibido no mapa público)
  reporterContact?: {
    name?: string;
    phone?: string;
    userId?: string;
  };

  // Atribuição institucional
  assignedCompanyId?: string;
  assignedCompanyName?: string;
  assignedTechnician?: string;

  // Datas
  reportedAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  verifiedAt?: string;

  // Histórico auditável de estados
  history: StatusHistoryEntry[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: 'ocorrencia' | 'empresa' | 'utilizador' | 'sistema';
  targetId: string;
  details: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'sucesso' | 'aviso' | 'urgencia';
  read: boolean;
  link?: string;
  createdAt: string;
}
