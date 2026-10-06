import React, { useState } from 'react';
import {
  Plus,
  Filter,
  Search,
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
  ShoppingBag,
  Megaphone,
  Palette,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Archive,
  ChevronDown,
} from 'lucide-react';
import {
  Task,
  GeneralStatus,
  Assignee,
  TaskType,
  Priority,
  CurrentUserRole,
} from '../types';
import {
  checkSupplierAlert,
  formatComplexityLabel,
  formatCurrency,
  getWipCount,
  isTaskArchived,
  WIP_LIMIT,
} from '../utils/helpers';

interface KanbanViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onSelectTask: (task: Task) => void;
  onOpenIntake: () => void;
  currentUser: CurrentUserRole;
  onTriggerAlertModal?: (task: Task) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onUpdateTask,
  onSelectTask,
  onOpenIntake,
  currentUser,
  onTriggerAlertModal,
}) => {
  const [filterAssignee, setFilterAssignee] = useState<string>('Todos');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [filterPriority, setFilterPriority] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const benjyWip = getWipCount(tasks, 'Benjy');
  const hildaWip = getWipCount(tasks, 'Hilda');

  // Operational Kanban columns only show non-archived tasks!
  // Columns: Backlog, En Proceso, En Pausa
  const columns: { id: GeneralStatus; title: string; subtitle: string; color: string }[] = [
    {
      id: 'Por Clasificar / Backlog',
      title: 'Por Clasificar / Backlog',
      subtitle: 'Entrada centralizada vía Intake (Pull)',
      color: 'border-t-indigo-500',
    },
    {
      id: 'En Proceso',
      title: 'En Proceso',
      subtitle: `Límite WIP: máx ${WIP_LIMIT} por persona`,
      color: 'border-t-blue-500',
    },
    {
      id: 'En Pausa',
      title: 'En Pausa',
      subtitle: 'En espera de insumos o aprobaciones',
      color: 'border-t-amber-500',
    },
  ];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Regla de archivo automático: Completed / delivered / finalized are hidden from operational view
    if (isTaskArchived(task)) return false;

    if (filterAssignee !== 'Todos' && task.assignee !== filterAssignee) return false;
    if (filterType !== 'Todos' && task.taskType !== filterType) return false;
    if (filterPriority !== 'Todas' && task.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchId = task.id.toLowerCase().includes(q);
      const matchRequester = task.requesterName.toLowerCase().includes(q);
      const matchPo = task.poNumber?.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchRequester && !matchPo) return false;
    }
    return true;
  });

  const handlePullDirectly = (task: Task, targetAssignee: Assignee) => {
    const currentWip = getWipCount(tasks, targetAssignee as 'Benjy' | 'Hilda');
    const nowIso = new Date().toISOString();

    const updated: Task = {
      ...task,
      assignee: targetAssignee,
      generalStatus: 'En Proceso',
      startedAt: task.startedAt || nowIso,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `${targetAssignee} tomó la tarea (Pull) pasando a "En Proceso"`,
        },
      ],
    };

    onUpdateTask(updated);
  };

  const handleStatusChange = (task: Task, newStatus: GeneralStatus) => {
    const nowIso = new Date().toISOString();
    const updated: Task = {
      ...task,
      generalStatus: newStatus,
      completedAt: newStatus === 'Completado' ? nowIso : task.completedAt,
      startedAt: newStatus === 'En Proceso' && !task.startedAt ? nowIso : task.startedAt,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `Movió estado a "${newStatus}"`,
        },
      ],
    };
    onUpdateTask(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: GeneralStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.generalStatus !== targetStatus) {
      // If moving to En Proceso and unassigned, prompt or assign to current user if Benjy/Hilda
      let assigneeToSet = task.assignee;
      if (targetStatus === 'En Proceso' && task.assignee === 'Sin Asignar') {
        if (currentUser === 'Benjy' || currentUser === 'Hilda') {
          assigneeToSet = currentUser;
        }
      }
      const nowIso = new Date().toISOString();
      const updated: Task = {
        ...task,
        assignee: assigneeToSet,
        generalStatus: targetStatus,
        startedAt: targetStatus === 'En Proceso' && !task.startedAt ? nowIso : task.startedAt,
        history: [
          ...(task.history || []),
          {
            id: `h-${Date.now()}`,
            timestamp: nowIso,
            user: currentUser,
            action: `Arrastró la tarjeta a columna "${targetStatus}"`,
          },
        ],
      };
      onUpdateTask(updated);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Methodology & WIP summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold tracking-tight">Tablero Operativo Pull / Kanban</h2>
            <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
              Vista Principal Benjy & Hilda
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Las tareas ingresan al <strong>Backlog</strong> sin asignar. Conforme tengas capacidad operativa, toma una tarea (<em>Pull</em>) y asígnala a ti mismo. Las tareas completadas se archivan automáticamente.
          </p>
        </div>

        {/* WIP limit monitors in header */}
        <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg shrink-0">
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Control WIP (Límite: {WIP_LIMIT})
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1.5 font-mono text-xs">
                <span className="text-slate-300">Benjy:</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    benjyWip > WIP_LIMIT
                      ? 'bg-rose-900 text-rose-200 ring-1 ring-rose-500'
                      : benjyWip === WIP_LIMIT
                      ? 'bg-amber-900 text-amber-200'
                      : 'bg-slate-800 text-emerald-400'
                  }`}
                >
                  {benjyWip}/{WIP_LIMIT}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-xs">
                <span className="text-slate-300">Hilda:</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    hildaWip > WIP_LIMIT
                      ? 'bg-rose-900 text-rose-200 ring-1 ring-rose-500'
                      : hildaWip === WIP_LIMIT
                      ? 'bg-amber-900 text-amber-200'
                      : 'bg-slate-800 text-emerald-400'
                  }`}
                >
                  {hildaWip}/{WIP_LIMIT}
                </span>
              </div>
            </div>
          </div>
          {(benjyWip > WIP_LIMIT || hildaWip > WIP_LIMIT) && (
            <div className="flex items-center space-x-1 text-rose-400 text-xs bg-rose-950/80 px-2 py-1 rounded border border-rose-800 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">¡Sobrecupo WIP!</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por título, folio o solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Assignee */}
          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="filter-assignee" className="text-slate-500">Asignado:</label>
            <select
              id="filter-assignee"
              aria-label="Filtrar por persona asignada"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Sin Asignar">Sin Asignar</option>
              <option value="Benjy">Benjy</option>
              <option value="Hilda">Hilda</option>
            </select>
          </div>

          {/* Filter Type */}
          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="filter-type" className="text-slate-500">Tipo:</label>
            <select
              id="filter-type"
              aria-label="Filtrar por tipo de tarea"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los tipos</option>
              <option value="Diseño General">Diseño General</option>
              <option value="Orden de Compra">Orden de Compra</option>
              <option value="Campaña Publicitaria">Campaña Publicitaria</option>
            </select>
          </div>

          {/* Filter Priority */}
          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50">
            <label htmlFor="filter-priority" className="text-slate-500">Prioridad:</label>
            <select
              id="filter-priority"
              aria-label="Filtrar por prioridad"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Quick button to open intake form */}
        <button
          onClick={onOpenIntake}
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Tarea (Intake)</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.generalStatus === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col min-h-[580px] shadow-xs ${col.color} border-t-4 transition-colors`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200/80 bg-white/60 rounded-t-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-800">{col.title}</h3>
                    <span className="bg-slate-200 text-slate-700 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{col.subtitle}</p>
                </div>

                {col.id === 'En Proceso' && (benjyWip > WIP_LIMIT || hildaWip > WIP_LIMIT) && (
                  <span
                    className="flex items-center text-rose-600 text-[11px] font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                    title="Uno de los operativos ha superado el límite de 3 tareas en proceso simultáneas"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    WIP &gt; 3
                  </span>
                )}
              </div>

              {/* Column Task List */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs text-center p-3">
                    <span>Sin tareas en esta etapa</span>
                    <span className="text-[11px] mt-1 text-slate-400">
                      {col.id === 'Por Clasificar / Backlog'
                        ? 'Usa el Intake Form para ingresar nuevas'
                        : 'Arrastra tarjetas aquí para moverlas'}
                    </span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const alertInfo = checkSupplierAlert(task);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onSelectTask(task)}
                        className={`bg-white rounded-lg p-3.5 border transition-all cursor-pointer shadow-xs hover:shadow-md relative group ${
                          alertInfo.isAlert
                            ? 'border-rose-400 ring-1 ring-rose-300 bg-rose-50/20'
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {/* Top Card Bar: ID, Type & Priority */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {task.id}
                            </span>
                            {task.taskType === 'Diseño General' && (
                              <span className="text-indigo-700 text-[11px] font-medium flex items-center space-x-1">
                                <Palette className="w-3 h-3 text-indigo-500" />
                                <span>Diseño</span>
                              </span>
                            )}
                            {task.taskType === 'Orden de Compra' && (
                              <span className="text-amber-700 text-[11px] font-medium flex items-center space-x-1">
                                <ShoppingBag className="w-3 h-3 text-amber-500" />
                                <span>PO Empaque</span>
                              </span>
                            )}
                            {task.taskType === 'Campaña Publicitaria' && (
                              <span className="text-purple-700 text-[11px] font-medium flex items-center space-x-1">
                                <Megaphone className="w-3 h-3 text-purple-500" />
                                <span>Campaña</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {/* Priority dot / text */}
                            <span
                              className={`text-[11px] font-semibold ${
                                task.priority === 'Alta'
                                  ? 'text-rose-600'
                                  : task.priority === 'Media'
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              ● {task.priority}
                            </span>
                            <span className="text-slate-300">·</span>
                            {/* Complexity badge */}
                            <span
                              className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded"
                              title={formatComplexityLabel(task.complexity)}
                            >
                              Talla {task.complexity}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                          {task.title}
                        </h4>

                        {/* Solicitante */}
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                          <span className="truncate max-w-[180px]">
                            Por: <strong className="text-slate-700">{task.requesterName}</strong> ({task.requesterDept})
                          </span>
                        </div>

                        {/* PO Specific Alert or Details */}
                        {task.taskType === 'Orden de Compra' && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                            <div className="flex items-center justify-between text-slate-600">
                              <span>PO: <strong className="text-slate-800">{task.poNumber || 'S/N'}</strong></span>
                              <span className="font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                                {task.poSupplier}
                              </span>
                            </div>

                            {/* 48h Preventive Alert badge */}
                            {alertInfo.isAlert && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onTriggerAlertModal) onTriggerAlertModal(task);
                                }}
                                className="mt-1 bg-rose-100 text-rose-800 border border-rose-300 rounded px-2 py-1 text-[10px] font-semibold flex items-center justify-between hover:bg-rose-200 transition"
                              >
                                <span className="flex items-center space-x-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                  <span>{alertInfo.label}</span>
                                </span>
                                <span className="underline ml-1">Notificar</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Campaign Specific Details */}
                        {task.taskType === 'Campaña Publicitaria' && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                            <span className="font-mono font-semibold text-purple-800">
                              {formatCurrency(task.campaignBudget)}
                            </span>
                            <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                              {task.campaignStatus || 'Programada'}
                            </span>
                          </div>
                        )}

                        {/* Card Footer: Assignee & Action Buttons */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          {/* Assignee Indicator */}
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                task.assignee === 'Sin Asignar'
                                  ? 'bg-slate-100 text-slate-500 italic'
                                  : task.assignee === 'Benjy'
                                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                              }`}
                            >
                              {task.assignee}
                            </span>
                          </div>

                          {/* Quick Pull or Move actions */}
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            {/* PULL BUTTON: If in Backlog */}
                            {col.id === 'Por Clasificar / Backlog' ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handlePullDirectly(task, 'Benjy')}
                                  title="Tomar tarea para Benjy y pasar a En Proceso"
                                  className="text-[10px] bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-300 font-semibold px-1.5 py-1 rounded transition cursor-pointer"
                                >
                                  Tomar Benjy
                                </button>
                                <button
                                  onClick={() => handlePullDirectly(task, 'Hilda')}
                                  title="Tomar tarea para Hilda y pasar a En Proceso"
                                  className="text-[10px] bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 font-semibold px-1.5 py-1 rounded transition cursor-pointer"
                                >
                                  Tomar Hilda
                                </button>
                              </div>
                            ) : col.id === 'En Proceso' ? (
                              /* Complete button in In-Process */
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleStatusChange(task, 'En Pausa')}
                                  title="Pausar tarea"
                                  className="text-[10px] text-amber-700 hover:bg-amber-100 p-1 rounded transition"
                                >
                                  <PauseCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(task, 'Completado')}
                                  title="Marcar como Completado y archivar"
                                  className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2 py-0.5 rounded flex items-center space-x-1 transition cursor-pointer"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Listo</span>
                                </button>
                              </div>
                            ) : (
                              /* Resume in Paused */
                              <button
                                onClick={() => handleStatusChange(task, 'En Proceso')}
                                title="Reanudar a En Proceso"
                                className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-0.5 rounded flex items-center space-x-1 transition cursor-pointer"
                              >
                                <PlayCircle className="w-3 h-3" />
                                <span>Reanudar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
