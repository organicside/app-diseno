import React, { useState } from 'react';
import {
  Eye,
  Search,
  Lock,
  User,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Palette,
  Package,
  Megaphone,
} from 'lucide-react';
import { Task, Priority } from '../types';
import { formatComplexityLabel, formatDateString, isTaskArchived } from '../utils/helpers';

interface TransparencyDashboardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenIntake: () => void;
}

export const TransparencyDashboard: React.FC<TransparencyDashboardProps> = ({
  tasks,
  onSelectTask,
  onOpenIntake,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('Todos');

  // Strictly filter only tasks that are "En Proceso" and not archived
  const inProcessTasks = tasks.filter(
    (t) => t.generalStatus === 'En Proceso' && !isTaskArchived(t)
  );

  // Sort by priority: Alta first, then Media, then Baja
  const priorityWeight: Record<Priority, number> = {
    Alta: 1,
    Media: 2,
    Baja: 3,
  };

  const sortedTasks = [...inProcessTasks].sort((a, b) => {
    return priorityWeight[a.priority] - priorityWeight[b.priority];
  });

  const filteredTasks = sortedTasks.filter((task) => {
    if (filterDept !== 'Todos' && task.requesterDept !== filterDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchRequester = task.requesterName.toLowerCase().includes(q);
      const matchDept = task.requesterDept.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      if (!matchTitle && !matchRequester && !matchDept && !matchId) return false;
    }
    return true;
  });

  // Extract unique departments for filter
  const departments = Array.from(new Set(inProcessTasks.map((t) => t.requesterDept))).filter(
    Boolean
  );

  const benjyCount = inProcessTasks.filter((t) => t.assignee === 'Benjy').length;
  const hildaCount = inProcessTasks.filter((t) => t.assignee === 'Hilda').length;

  return (
    <div className="space-y-5">
      {/* Header with Read-Only Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold tracking-tight">
              Dashboard de Transparencia Operativa
            </h2>
            <span className="flex items-center space-x-1 text-xs bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded font-mono font-medium">
              <Lock className="w-3 h-3" />
              <span>Solo Lectura (Read-Only)</span>
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Vista ejecutiva para <strong>Jefes y Solicitantes</strong>. Muestra en tiempo real{' '}
            <em>únicamente</em> las tareas que Benjy e Hilda tienen en ejecución activa (ordenadas por
            prioridad) para dar certidumbre sin interrupciones operativas.
          </p>
        </div>

        <button
          onClick={onOpenIntake}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition shrink-0 cursor-pointer"
        >
          <span>Ingresar Solicitud al Backlog</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tareas en Ejecución Activa
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-2xl font-bold text-slate-900">
              {inProcessTasks.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">requerimientos en proceso</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Respeta la capacidad máxima del equipo (máx 3 por operativo).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Carga Activa de Benjy
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-2xl font-bold text-blue-700">{benjyCount}</span>
            <span className="text-xs text-slate-500 font-medium">de 3 recomendadas</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${
                benjyCount > 3 ? 'bg-rose-500' : benjyCount === 3 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min((benjyCount / 3) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Carga Activa de Hilda
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-2xl font-bold text-emerald-700">{hildaCount}</span>
            <span className="text-xs text-slate-500 font-medium">de 3 recomendadas</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${
                hildaCount > 3 ? 'bg-rose-500' : hildaCount === 3 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min((hildaCount / 3) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por tu nombre, departamento o tarea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <label htmlFor="dept-filter" className="text-slate-500">Filtrar por Departamento:</label>
            <select
              id="dept-filter"
              aria-label="Filtrar por departamento solicitante"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los departamentos</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Datos sincronizados en vivo con el Tablero Kanban</span>
        </div>
      </div>

      {/* Live In-Process Feed */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span>No hay requerimientos en proceso que coincidan con la búsqueda.</span>
          </div>
        ) : (
          filteredTasks.map((task, index) => {
            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 shadow-xs hover:shadow-sm transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info: Priority Rank & Title */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      #{index + 1} · {task.id}
                    </span>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        task.priority === 'Alta'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : task.priority === 'Media'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Prioridad {task.priority}
                    </span>

                    {task.taskType === 'Diseño General' && (
                      <span className="text-xs text-indigo-700 font-medium flex items-center space-x-1">
                        <Palette className="w-3 h-3 text-indigo-500" />
                        <span>Diseño</span>
                      </span>
                    )}
                    {task.taskType === 'Orden de Compra' && (
                      <span className="text-xs text-amber-700 font-medium flex items-center space-x-1">
                        <Package className="w-3 h-3 text-amber-500" />
                        <span>PO Empaque ({task.poSupplier})</span>
                      </span>
                    )}
                    {task.taskType === 'Campaña Publicitaria' && (
                      <span className="text-xs text-purple-700 font-medium flex items-center space-x-1">
                        <Megaphone className="w-3 h-3 text-purple-500" />
                        <span>Campaña Publicitaria</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      Solicitante:{' '}
                      <strong className="text-slate-800">{task.requesterName}</strong> ({task.requesterDept})
                    </span>
                    <span>·</span>
                    <span>
                      Complejidad estimada:{' '}
                      <strong className="text-indigo-700 font-mono">
                        {formatComplexityLabel(task.complexity)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right Info: Assignee & In-Process State */}
                <div className="flex items-center space-x-4 shrink-0 bg-slate-50 border border-slate-200/80 p-3 rounded-lg">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Ejecutando actualmente:
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        task.assignee === 'Benjy' ? 'text-blue-700' : 'text-emerald-700'
                      }`}
                    >
                      {task.assignee}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Iniciada: {formatDateString(task.startedAt || task.createdAt)}
                    </span>
                  </div>

                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="En ejecución activa" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
