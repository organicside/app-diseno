import { Task, Assignee, Complexity, TaskType } from '../types';

export const WIP_LIMIT = 3;

/**
 * Returns true if a task is considered finished and should be moved to archive/history.
 * Regla de Archivo Automático:
 * Cuando el Estado General, Estado de la Orden o Estado de Campaña pase a "Completado",
 * "Entregado" o "Finalizada", el registro debe ocultarse automáticamente de las vistas operativas
 * y promoverse a la vista de "Historial / Archivo".
 */
export function isTaskArchived(task: Task): boolean {
  if (task.generalStatus === 'Completado') return true;
  if (task.taskType === 'Orden de Compra' && task.poStatus === 'Entregado') return true;
  if (task.taskType === 'Campaña Publicitaria' && task.campaignStatus === 'Finalizada') return true;
  return false;
}

/**
 * Calculates current in-progress count for an assignee
 */
export function getWipCount(tasks: Task[], assignee: 'Benjy' | 'Hilda'): number {
  return tasks.filter(
    (t) => !isTaskArchived(t) && t.assignee === assignee && t.generalStatus === 'En Proceso'
  ).length;
}

/**
 * Checks if assignee has exceeded or reached the WIP limit of 3
 */
export function hasExceededWip(tasks: Task[], assignee: 'Benjy' | 'Hilda'): boolean {
  return getWipCount(tasks, assignee) > WIP_LIMIT;
}

export function isAtWipLimit(tasks: Task[], assignee: 'Benjy' | 'Hilda'): boolean {
  return getWipCount(tasks, assignee) >= WIP_LIMIT;
}

export interface SupplierAlertInfo {
  isAlert: boolean;
  isOverdue: boolean;
  hoursRemaining: number;
  label: string;
}

/**
 * Alerta Preventiva de Proveedor:
 * Si faltan menos de 48 horas para la Fecha Compromiso de Entrega y la orden NO está
 * en estado "Entregado", marcar el registro en rojo y enviar un recordatorio.
 */
export function checkSupplierAlert(task: Task, referenceDate = new Date('2026-10-06T12:00:00Z')): SupplierAlertInfo {
  if (task.taskType !== 'Orden de Compra' || !task.poDeliveryCommitmentDate) {
    return { isAlert: false, isOverdue: false, hoursRemaining: 9999, label: '' };
  }

  if (task.poStatus === 'Entregado' || task.generalStatus === 'Completado') {
    return { isAlert: false, isOverdue: false, hoursRemaining: 9999, label: 'Entregado' };
  }

  // Treat commitment date as end of day 18:00
  const commitmentDate = new Date(`${task.poDeliveryCommitmentDate}T18:00:00Z`);
  const diffMs = commitmentDate.getTime() - referenceDate.getTime();
  const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));

  if (hoursRemaining < 0) {
    const daysOverdue = Math.abs(Math.floor(hoursRemaining / 24));
    return {
      isAlert: true,
      isOverdue: true,
      hoursRemaining,
      label: `¡Vencida hace ${daysOverdue === 0 ? 'unas horas' : `${daysOverdue} día(s)`}!`,
    };
  }

  if (hoursRemaining <= 48) {
    return {
      isAlert: true,
      isOverdue: false,
      hoursRemaining,
      label: `Alerta: faltan ${hoursRemaining}h (${task.poDeliveryCommitmentDate})`,
    };
  }

  return {
    isAlert: false,
    isOverdue: false,
    hoursRemaining,
    label: `A tiempo (${Math.ceil(hoursRemaining / 24)} días restantes)`,
  };
}

/**
 * Calculates estimated hours from complexity sizes:
 * S = ~0.75 hrs (<1 hora)
 * M = ~3.5 hrs (2-5 horas)
 * L = ~8 hrs (>1 jornada)
 */
export function getEstimatedHours(complexity: Complexity): number {
  switch (complexity) {
    case 'S':
      return 0.75;
    case 'M':
      return 3.5;
    case 'L':
      return 8.0;
  }
}

export function formatComplexityLabel(complexity: Complexity): string {
  switch (complexity) {
    case 'S':
      return 'S (< 1h)';
    case 'M':
      return 'M (2 - 5h)';
    case 'L':
      return 'L (> 1 día)';
  }
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return '$0 MXN';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateString(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function generateNextId(tasks: Task[]): string {
  const ids = tasks
    .map((t) => {
      const match = t.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 100;
    })
    .filter((n) => !isNaN(n));
  const max = ids.length ? Math.max(...ids) : 100;
  return `TSK-${max + 1}`;
}
