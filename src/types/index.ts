export type TaskType = 'Diseño General' | 'Orden de Compra' | 'Campaña Publicitaria';

export type Assignee = 'Sin Asignar' | 'Benjy' | 'Hilda';

export type GeneralStatus = 'Por Clasificar / Backlog' | 'En Proceso' | 'En Pausa' | 'Completado';

export type Priority = 'Alta' | 'Media' | 'Baja';

export type Complexity = 'S' | 'M' | 'L'; // S (<1h), M (2-5h), L (>1 jornada)

export type Supplier = 'Etimex' | 'Focomsa' | 'Otro';

export type OrderStatus =
  | 'Pendiente de enviar archivo'
  | 'A la espera de Print cards'
  | 'Pendiente firmar Print card'
  | 'Producción en proceso'
  | 'Entregado';

export type CampaignStatus = 'Programada' | 'Activa' | 'En Pausa' | 'Finalizada';

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface Task {
  id: string; // e.g. TSK-101
  title: string;
  description: string;
  requesterName: string;
  requesterDept: string;
  taskType: TaskType;
  assignee: Assignee;
  generalStatus: GeneralStatus;
  priority: Priority;
  complexity: Complexity;
  createdAt: string; // ISO
  completedAt?: string | null;
  startedAt?: string | null;
  attachments?: TaskAttachment[];
  history?: ActivityLog[];

  // Campos específicos para "Órdenes de Compra (Material de Empaque)"
  poNumber?: string;
  poProductDesc?: string;
  poSupplier?: Supplier;
  poSupplierOther?: string;
  poStatus?: OrderStatus;
  poDeliveryCommitmentDate?: string; // YYYY-MM-DD
  poRemindedAt?: string | null;

  // Campos específicos para "Campañas Publicitarias"
  campaignItem?: string; // Qué se está publicitando
  campaignStartDate?: string; // YYYY-MM-DD
  campaignEndDate?: string; // YYYY-MM-DD
  campaignBudget?: number;
  campaignStatus?: CampaignStatus;
}

export type ActiveTab =
  | 'kanban'
  | 'purchase_orders'
  | 'campaigns'
  | 'transparency'
  | 'weekly_report'
  | 'archive';

export type CurrentUserRole = 'Benjy' | 'Hilda' | 'Jefe' | 'Solicitante';
