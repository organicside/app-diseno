import React, { useState } from 'react';
import {
  Megaphone,
  Calendar,
  DollarSign,
  Clock,
  Play,
  Pause,
  CheckCircle,
  Plus,
  Search,
  Filter,
  TrendingUp,
} from 'lucide-react';
import { Task, CampaignStatus, CurrentUserRole } from '../types';
import { formatCurrency, formatDateString, isTaskArchived } from '../utils/helpers';

interface CampaignsViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onOpenIntake: () => void;
  currentUser: CurrentUserRole;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  tasks,
  onUpdateTask,
  onSelectTask,
  onOpenIntake,
  currentUser,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('Activas y Programadas');
  const [searchQuery, setSearchQuery] = useState('');

  // All campaign tasks
  const campaignTasks = tasks.filter((t) => t.taskType === 'Campaña Publicitaria');

  // Metrics
  const activeCampaigns = campaignTasks.filter(
    (t) => t.campaignStatus === 'Activa' && !isTaskArchived(t)
  );
  const scheduledCampaigns = campaignTasks.filter((t) => t.campaignStatus === 'Programada');
  const pausedCampaigns = campaignTasks.filter((t) => t.campaignStatus === 'En Pausa');
  const finalizedCampaigns = campaignTasks.filter((t) => t.campaignStatus === 'Finalizada');

  const activeBudget = activeCampaigns.reduce((sum, t) => sum + (t.campaignBudget || 0), 0);
  const totalPlannedBudget = campaignTasks.reduce(
    (sum, t) => sum + (t.campaignBudget || 0),
    0
  );

  const filteredCampaigns = campaignTasks.filter((task) => {
    if (statusFilter === 'Activas y Programadas') {
      if (task.campaignStatus === 'Finalizada' || isTaskArchived(task)) return false;
    } else if (statusFilter !== 'Todas') {
      if (task.campaignStatus !== statusFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchItem = task.campaignItem?.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      if (!matchTitle && !matchItem && !matchId) return false;
    }

    return true;
  });

  const handleUpdateCampaignStatus = (task: Task, newStatus: CampaignStatus) => {
    const nowIso = new Date().toISOString();
    const isCompleted = newStatus === 'Finalizada';

    const updated: Task = {
      ...task,
      campaignStatus: newStatus,
      generalStatus: isCompleted ? 'Completado' : task.generalStatus,
      completedAt: isCompleted ? nowIso : task.completedAt,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `Cambió estado de campaña a: "${newStatus}"${isCompleted ? ' (Archivada)' : ''}`,
        },
      ],
    };

    onUpdateTask(updated);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold tracking-tight">
              Control de Campañas Publicitarias y Pautas
            </h2>
            <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
              Cronograma & Presupuesto
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Supervisión integral de fechas de inicio/término, presupuesto asignado y estado de
            activación en medios publicitarios.
          </p>
        </div>

        <button
          onClick={onOpenIntake}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-3.5 py-2 rounded-lg flex items-center space-x-1.5 text-xs shadow-sm transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Campaña</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Presupuesto Activo</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(activeBudget)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            En {activeCampaigns.length} campañas activas
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Presupuesto Total</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-mono text-xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalPlannedBudget)}
          </p>
          <span className="text-[11px] text-slate-500">
            {campaignTasks.length} campañas registradas
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Campañas Activas</span>
            <Play className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="font-mono text-xl font-bold text-slate-900 mt-1">
            {activeCampaigns.length}
          </p>
          <span className="text-[11px] text-indigo-600 font-medium">En ejecución en medios</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Programadas / Pausa</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-mono text-xl font-bold text-slate-900 mt-1">
            {scheduledCampaigns.length + pausedCampaigns.length}
          </p>
          <span className="text-[11px] text-slate-500">
            {scheduledCampaigns.length} por iniciar · {pausedCampaigns.length} pausadas
          </span>
        </div>
      </div>

      {/* Filter and search toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar campaña por título o asunto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="campaign-status-filter" className="text-slate-500">Estado:</label>
            <select
              id="campaign-status-filter"
              aria-label="Filtrar por estado de campaña"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Activas y Programadas">Activas y Programadas</option>
              <option value="Activa">Solo Activas</option>
              <option value="Programada">Solo Programadas</option>
              <option value="En Pausa">Solo En Pausa</option>
              <option value="Finalizada">Finalizadas (Historial)</option>
              <option value="Todas">Todas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Timeline & Cards List */}
      <div className="space-y-3">
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>No hay campañas publicitarias para los filtros seleccionados.</span>
          </div>
        ) : (
          filteredCampaigns.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="bg-white border border-slate-200 hover:border-purple-300 rounded-xl p-4 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {task.id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      task.campaignStatus === 'Activa'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : task.campaignStatus === 'Programada'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : task.campaignStatus === 'En Pausa'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ● {task.campaignStatus || 'Programada'}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 truncate">
                    Asignado: <strong>{task.assignee}</strong>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                  {task.title}
                </h3>

                <p className="text-xs text-purple-900 bg-purple-50/70 p-2 rounded-lg font-medium">
                  <strong>Objetivo / Qué se publicita:</strong>{' '}
                  {task.campaignItem || 'Sin detalle de producto'}
                </p>
              </div>

              {/* Middle Timeline Schedule representation */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1.5 shrink-0 w-full md:w-64">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center space-x-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fechas de Pauta:</span>
                  </span>
                </div>
                <div className="font-semibold text-slate-800 text-[11px]">
                  {formatDateString(task.campaignStartDate)} — {formatDateString(task.campaignEndDate)}
                </div>

                <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Presupuesto Asignado:</span>
                  <span className="font-mono font-bold text-sm text-purple-700">
                    {formatCurrency(task.campaignBudget)}
                  </span>
                </div>
              </div>

              {/* Right Action buttons */}
              <div
                className="flex items-center space-x-2 shrink-0 justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                {task.campaignStatus !== 'Activa' && task.campaignStatus !== 'Finalizada' && (
                  <button
                    onClick={() => handleUpdateCampaignStatus(task, 'Activa')}
                    title="Activar campaña en medios"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Activar</span>
                  </button>
                )}

                {task.campaignStatus === 'Activa' && (
                  <button
                    onClick={() => handleUpdateCampaignStatus(task, 'En Pausa')}
                    title="Pausar campaña temporalmente"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Pausar</span>
                  </button>
                )}

                {task.campaignStatus !== 'Finalizada' && (
                  <button
                    onClick={() => handleUpdateCampaignStatus(task, 'Finalizada')}
                    title="Marcar campaña como concluida y archivar"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Finalizar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
