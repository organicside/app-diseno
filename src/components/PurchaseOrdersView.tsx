import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  Plus,
  Send,
} from 'lucide-react';
import { Task, Supplier, OrderStatus, CurrentUserRole } from '../types';
import {
  checkSupplierAlert,
  formatDateString,
  isTaskArchived,
} from '../utils/helpers';

interface PurchaseOrdersViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onOpenIntake: () => void;
  currentUser: CurrentUserRole;
  onTriggerAlertModal: (task: Task) => void;
}

const ORDER_STAGES: OrderStatus[] = [
  'Pendiente de enviar archivo',
  'A la espera de Print cards',
  'Pendiente firmar Print card',
  'Producción en proceso',
  'Entregado',
];

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  tasks,
  onUpdateTask,
  onSelectTask,
  onOpenIntake,
  currentUser,
  onTriggerAlertModal,
}) => {
  const [filterSupplier, setFilterSupplier] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);

  // Filter only PO tasks
  const poTasks = tasks.filter((t) => t.taskType === 'Orden de Compra');

  const filteredTasks = poTasks.filter((task) => {
    // Hide archived/delivered unless user intentionally filters for "Entregado"
    const isDelivered = task.poStatus === 'Entregado' || task.generalStatus === 'Completado';
    if (filterStatus !== 'Entregado' && isDelivered) {
      return false; // Auto-archived from active control view
    }

    if (filterSupplier !== 'Todos' && task.poSupplier !== filterSupplier) return false;
    if (filterStatus !== 'Todos' && task.poStatus !== filterStatus) return false;

    const alertInfo = checkSupplierAlert(task);
    if (showOnlyAlerts && !alertInfo.isAlert) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPo = task.poNumber?.toLowerCase().includes(q);
      const matchDesc = task.poProductDesc?.toLowerCase().includes(q);
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchSupplier = task.poSupplier?.toLowerCase().includes(q);
      if (!matchPo && !matchDesc && !matchTitle && !matchSupplier) return false;
    }

    return true;
  });

  const handleAdvanceStatus = (task: Task, nextStatus: OrderStatus) => {
    const nowIso = new Date().toISOString();
    const isCompleted = nextStatus === 'Entregado';

    const updated: Task = {
      ...task,
      poStatus: nextStatus,
      generalStatus: isCompleted ? 'Completado' : task.generalStatus,
      completedAt: isCompleted ? nowIso : task.completedAt,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `Avanzó orden a fase: "${nextStatus}"${isCompleted ? ' (Archivada automáticamente)' : ''}`,
        },
      ],
    };

    onUpdateTask(updated);
  };

  const alertCount = poTasks.filter((t) => checkSupplierAlert(t).isAlert).length;

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold tracking-tight">
              Control de Órdenes de Compra (Material de Empaque)
            </h2>
            <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
              Etimex & Focomsa
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Rastreo estricto de producción y entrega de empaques. Las órdenes con{' '}
            <strong className="text-rose-400">&lt; 48 horas</strong> para su fecha compromiso se
            marcan automáticamente en rojo para gestionar alertas preventivas al proveedor.
          </p>
        </div>

        {/* 48h Alert quick summary card */}
        <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 p-3 rounded-lg shrink-0">
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-lg ${
                alertCount > 0 ? 'bg-rose-950 text-rose-400 ring-1 ring-rose-500' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${alertCount > 0 ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Alertas Preventivas (&lt;48h)
              </span>
              <span
                className={`font-mono text-sm font-bold ${
                  alertCount > 0 ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {alertCount} órdenes urgentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por PO, descripción, proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Supplier filter */}
          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <label htmlFor="po-supplier-filter" className="text-slate-500">Proveedor:</label>
            <select
              id="po-supplier-filter"
              aria-label="Filtrar por proveedor"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Etimex">Etimex</option>
              <option value="Focomsa">Focomsa</option>
              <option value="Otro">Otro Proveedor</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <label htmlFor="po-status-filter" className="text-slate-500">Fase:</label>
            <select
              id="po-status-filter"
              aria-label="Filtrar por fase de orden"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todas las activas</option>
              <option value="Pendiente de enviar archivo">Pendiente enviar archivo</option>
              <option value="A la espera de Print cards">A la espera de Print cards</option>
              <option value="Pendiente firmar Print card">Pendiente firmar Print card</option>
              <option value="Producción en proceso">Producción en proceso</option>
              <option value="Entregado">Entregado (Archivadas)</option>
            </select>
          </div>

          {/* Alert toggle */}
          <button
            onClick={() => setShowOnlyAlerts(!showOnlyAlerts)}
            className={`px-2.5 py-1 rounded-lg border font-medium flex items-center space-x-1 transition cursor-pointer ${
              showOnlyAlerts
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Solo Alertas &lt; 48h ({alertCount})</span>
          </button>
        </div>

        <button
          onClick={onOpenIntake}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva PO (Intake)</span>
        </button>
      </div>

      {/* Main Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">PO & Folio</th>
                <th className="py-3 px-4">Producto / Empaque</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Flujo de Estados (Pipeline)</th>
                <th className="py-3 px-4">Fecha Compromiso</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No hay órdenes de compra que coincidan con los filtros.</span>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const alertInfo = checkSupplierAlert(task);
                  const currentStageIndex = ORDER_STAGES.indexOf(
                    task.poStatus || 'Pendiente de enviar archivo'
                  );

                  return (
                    <tr
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        alertInfo.isAlert
                          ? 'bg-rose-50/30 border-l-4 border-l-rose-500'
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* PO & Folio */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {task.poNumber || 'S/N'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{task.id}</span>
                        </div>
                      </td>

                      {/* Producto / Descripción */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-900 line-clamp-1">
                          {task.poProductDesc || task.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                      </td>

                      {/* Proveedor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            task.poSupplier === 'Etimex'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : task.poSupplier === 'Focomsa'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {task.poSupplier === 'Otro' ? task.poSupplierOther || 'Otro' : task.poSupplier}
                        </span>
                      </td>

                      {/* Pipeline Stepper */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center space-x-1">
                          {ORDER_STAGES.map((stage, idx) => {
                            const isPast = idx < currentStageIndex;
                            const isCurrent = idx === currentStageIndex;

                            return (
                              <button
                                key={stage}
                                onClick={() => handleAdvanceStatus(task, stage)}
                                title={`Cambiar a: ${stage}`}
                                className={`group flex items-center text-[10px] px-1.5 py-0.5 rounded transition cursor-pointer ${
                                  isCurrent
                                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                                    : isPast
                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                              >
                                <span>{idx + 1}</span>
                                {isCurrent && (
                                  <span className="ml-1 hidden xl:inline truncate max-w-[120px]">
                                    {stage.replace('Pendiente', 'Pend.').replace('proceso', 'proc.')}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">
                          Actual: <strong>{task.poStatus || 'Pendiente'}</strong>
                        </span>
                      </td>

                      {/* Fecha Compromiso & Alerta */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {formatDateString(task.poDeliveryCommitmentDate)}
                          </span>
                          {alertInfo.isAlert ? (
                            <div className="flex items-center space-x-1 mt-0.5 text-rose-600 font-bold text-[10px]">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{alertInfo.label}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              {task.poDeliveryCommitmentDate ? alertInfo.label : 'Sin fecha'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Asignado */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-medium px-2 py-0.5 rounded text-[11px] ${
                            task.assignee === 'Benjy'
                              ? 'bg-blue-50 text-blue-700'
                              : task.assignee === 'Hilda'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-slate-400 italic'
                          }`}
                        >
                          {task.assignee}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Alert button */}
                          {alertInfo.isAlert && (
                            <button
                              onClick={() => onTriggerAlertModal(task)}
                              title="Enviar recordatorio formal al proveedor"
                              className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-2.5 py-1 rounded text-[11px] flex items-center space-x-1 shadow-xs transition cursor-pointer"
                            >
                              <Bell className="w-3 h-3" />
                              <span className="hidden sm:inline">Recordatorio</span>
                            </button>
                          )}

                          {/* Quick Deliver button */}
                          {task.poStatus !== 'Entregado' && (
                            <button
                              onClick={() => handleAdvanceStatus(task, 'Entregado')}
                              title="Confirmar recepción de empaque y archivar"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded text-[11px] flex items-center space-x-1 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Entregado</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
