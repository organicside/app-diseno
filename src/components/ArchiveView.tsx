import React, { useState } from 'react';
import {
  Archive,
  Search,
  RotateCcw,
  CheckCircle2,
  Download,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { Task, CurrentUserRole } from '../types';
import {
  formatComplexityLabel,
  formatDateString,
  isTaskArchived,
} from '../utils/helpers';

interface ArchiveViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  currentUser: CurrentUserRole;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  tasks,
  onUpdateTask,
  onSelectTask,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  // Filter archived tasks
  const archivedTasks = tasks.filter((t) => isTaskArchived(t));

  const filteredTasks = archivedTasks.filter((task) => {
    if (filterType !== 'Todos' && task.taskType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      const matchPo = task.poNumber?.toLowerCase().includes(q);
      const matchRequester = task.requesterName.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchPo && !matchRequester) return false;
    }
    return true;
  });

  const handleRestore = (task: Task) => {
    const nowIso = new Date().toISOString();
    const updated: Task = {
      ...task,
      generalStatus: 'En Proceso',
      completedAt: null,
      poStatus:
        task.taskType === 'Orden de Compra' ? 'Producción en proceso' : task.poStatus,
      campaignStatus:
        task.taskType === 'Campaña Publicitaria' ? 'Activa' : task.campaignStatus,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `Restauró tarea del Archivo a "En Proceso"`,
        },
      ],
    };
    onUpdateTask(updated);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Titulo', 'Tipo', 'Solicitante', 'Departamento', 'Asignado', 'Prioridad', 'Complejidad', 'FechaCreacion', 'FechaFinalizacion'];
    const rows = filteredTasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.taskType,
      `"${t.requesterName.replace(/"/g, '""')}"`,
      `"${t.requesterDept.replace(/"/g, '""')}"`,
      t.assignee,
      t.priority,
      t.complexity,
      t.createdAt,
      t.completedAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `archivo_diseno_mercadotecnia_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold tracking-tight">
              Historial & Archivo Central de Entregables
            </h2>
            <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
              Regla de Archivo Automático
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Repositorio histórico con todas las tareas completadas, órdenes de empaque entregadas y
            campañas finalizadas. Se archivan automáticamente para mantener limpias las vistas operativas.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Exportar Historial (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar en el histórico por folio, título, solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="archive-filter-type" className="text-slate-500">Tipo de Tarea:</label>
            <select
              id="archive-filter-type"
              aria-label="Filtrar historial por tipo de tarea"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Diseño General">Diseño General</option>
              <option value="Orden de Compra">Orden de Compra</option>
              <option value="Campaña Publicitaria">Campaña Publicitaria</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredTasks.length} registros archivados
        </span>
      </div>

      {/* Table of Archived Tasks */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Folio</th>
                <th className="py-3 px-4">Título / Entregable</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Solicitante</th>
                <th className="py-3 px-4">Ejecutó</th>
                <th className="py-3 px-4">Talla</th>
                <th className="py-3 px-4">Fecha Finalización</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No hay registros archivados que coincidan con la búsqueda.</span>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {task.id}
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-semibold text-slate-900 truncate">{task.title}</p>
                      {task.poNumber && (
                        <span className="text-[10px] text-amber-700 font-mono">
                          PO: {task.poNumber} ({task.poSupplier})
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-600 text-[11px]">{task.taskType}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-700">
                        {task.requesterName} <span className="text-slate-400">({task.requesterDept})</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          task.assignee === 'Benjy'
                            ? 'bg-blue-50 text-blue-700'
                            : task.assignee === 'Hilda'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {task.assignee}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] font-bold">
                        {task.complexity}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 text-[11px]">
                      {formatDateString(task.completedAt)}
                    </td>

                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleRestore(task)}
                        title="Reactivar y regresar al tablero operativo"
                        className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 p-1.5 rounded-lg text-xs flex items-center space-x-1 ml-auto transition cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reactivar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
