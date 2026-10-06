import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  Sparkles,
  Layers,
  User,
  ShoppingBag,
  Palette,
  Megaphone,
  Download,
  Share2,
} from 'lucide-react';
import { Task, Complexity, TaskType } from '../types';
import {
  formatComplexityLabel,
  formatDateString,
  getEstimatedHours,
  isTaskArchived,
} from '../utils/helpers';

interface WeeklyProductivityProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onOpenReportModal: () => void;
}

export const WeeklyProductivity: React.FC<WeeklyProductivityProps> = ({
  tasks,
  onSelectTask,
  onOpenReportModal,
}) => {
  const [timeframe, setTimeframe] = useState<'7days' | 'all'>('7days');

  // Completed tasks
  const completedTasks = tasks.filter((t) => {
    if (!isTaskArchived(t) && t.generalStatus !== 'Completado') return false;
    if (timeframe === '7days') {
      if (!t.completedAt) return true; // Include recent if completed
      const completedDate = new Date(t.completedAt).getTime();
      const referenceDate = new Date('2026-10-06T12:00:00Z').getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      return referenceDate - completedDate <= sevenDaysMs;
    }
    return true;
  });

  // Complexity counts
  const countS = completedTasks.filter((t) => t.complexity === 'S').length;
  const countM = completedTasks.filter((t) => t.complexity === 'M').length;
  const countL = completedTasks.filter((t) => t.complexity === 'L').length;

  const totalHours = completedTasks.reduce(
    (acc, t) => acc + getEstimatedHours(t.complexity),
    0
  );

  // Breakdown by person
  const benjyTasks = completedTasks.filter((t) => t.assignee === 'Benjy');
  const hildaTasks = completedTasks.filter((t) => t.assignee === 'Hilda');

  const benjyHours = benjyTasks.reduce((acc, t) => acc + getEstimatedHours(t.complexity), 0);
  const hildaHours = hildaTasks.reduce((acc, t) => acc + getEstimatedHours(t.complexity), 0);

  // Breakdown by type
  const designCount = completedTasks.filter((t) => t.taskType === 'Diseño General').length;
  const poCount = completedTasks.filter((t) => t.taskType === 'Orden de Compra').length;
  const campaignCount = completedTasks.filter((t) => t.taskType === 'Campaña Publicitaria').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold tracking-tight">
              Resumen Semanal de Productividad y Entregables
            </h2>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono">
              Para Juntas de Evaluación
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Consolidación del valor entregado sin fechas límite rígidas, evaluado mediante el volumen
            y complejidad de entregables por semana (Tallas S, M, L).
          </p>
        </div>

        {/* Friday 4:00 PM Automation Trigger CTA */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenReportModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center space-x-2 shadow-md transition cursor-pointer"
          >
            <Clock className="w-4 h-4 text-indigo-200" />
            <span>Generar Reporte Viernes 4:00 PM</span>
          </button>
        </div>
      </div>

      {/* Automation Rule Callout Banner */}
      <div className="bg-gradient-to-r from-indigo-900/90 to-slate-900 border border-indigo-700/60 rounded-xl p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/50 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              Regla de Automatización: Reporte Semanal a las 4:00 PM los Viernes
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              El sistema genera automáticamente el resumen de los últimos 7 días con desglose por
              persona, tipo y talla S/M/L, listo para remitir a los 2 jefes y al equipo.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer"
        >
          Ver Previsualización y Envío
        </button>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Periodo de evaluación:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setTimeframe('7days')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                timeframe === '7days'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Últimos 7 Días (Semana en Curso)
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todo el Historial Completado
            </button>
          </div>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {completedTasks.length} entregables completados
        </span>
      </div>

      {/* KPI Cards: Volume & Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Deliverables */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Entregables Completados
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-3xl font-bold text-slate-900">
              {completedTasks.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">100% terminadas</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Sin retrasos ni bloqueos reportados
          </span>
        </div>

        {/* Total Estimated Hours */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Horas de Esfuerzo Estimadas
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-3xl font-bold text-indigo-700">
              ~{totalHours.toFixed(1)} h
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Basado en tallas S (~0.75h), M (~3.5h), L (~8h)
          </span>
        </div>

        {/* Benjy Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Aportación Benjy
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-3xl font-bold text-slate-900">
              {benjyTasks.length}
            </span>
            <span className="text-xs text-blue-700 font-mono font-semibold">
              (~{benjyHours.toFixed(1)} h)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {benjyTasks.filter((t) => t.complexity === 'L').length} L ·{' '}
            {benjyTasks.filter((t) => t.complexity === 'M').length} M ·{' '}
            {benjyTasks.filter((t) => t.complexity === 'S').length} S
          </span>
        </div>

        {/* Hilda Output */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
            Aportación Hilda
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="font-mono text-3xl font-bold text-slate-900">
              {hildaTasks.length}
            </span>
            <span className="text-xs text-emerald-700 font-mono font-semibold">
              (~{hildaHours.toFixed(1)} h)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {hildaTasks.filter((t) => t.complexity === 'L').length} L ·{' '}
            {hildaTasks.filter((t) => t.complexity === 'M').length} M ·{' '}
            {hildaTasks.filter((t) => t.complexity === 'S').length} S
          </span>
        </div>
      </div>

      {/* Complexity Breakdown and Type Breakdown Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Complexity Breakdown Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Desglose por Complejidad / Talla</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono font-medium">
              S / M / L
            </span>
          </div>

          <div className="space-y-3">
            {/* Talla S */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Talla S (&lt; 1 hora)</span>
                <span className="font-mono font-bold text-slate-900">
                  {countS} tareas ({((countS / (completedTasks.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-400 h-full rounded-full"
                  style={{
                    width: `${(countS / (completedTasks.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Talla M */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Talla M (2 a 5 horas)</span>
                <span className="font-mono font-bold text-slate-900">
                  {countM} tareas ({((countM / (completedTasks.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{
                    width: `${(countM / (completedTasks.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Talla L */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Talla L (&gt; 1 jornada)</span>
                <span className="font-mono font-bold text-slate-900">
                  {countL} tareas ({((countL / (completedTasks.length || 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-800 h-full rounded-full"
                  style={{
                    width: `${(countL / (completedTasks.length || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Type Breakdown Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Desglose por Tipo de Requerimiento</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono font-medium">3 Especialidades</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <Palette className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <span className="font-mono text-xl font-bold text-slate-900 block">{designCount}</span>
              <span className="text-[11px] text-slate-600 font-medium">Diseño General</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <ShoppingBag className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <span className="font-mono text-xl font-bold text-slate-900 block">{poCount}</span>
              <span className="text-[11px] text-slate-600 font-medium">Órdenes PO</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <Megaphone className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <span className="font-mono text-xl font-bold text-slate-900 block">{campaignCount}</span>
              <span className="text-[11px] text-slate-600 font-medium">Campañas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Deliverables List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-800">
          Detalle de Entregables Completados en el Periodo
        </h3>

        <div className="divide-y divide-slate-100">
          {completedTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No hay entregables finalizados en este periodo.
            </p>
          ) : (
            completedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-lg transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-700">{task.id}</span>
                      <span className="font-semibold text-slate-900">{task.title}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      Solicitado por {task.requesterName} ({task.requesterDept}) · {task.taskType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      task.assignee === 'Benjy' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {task.assignee}
                  </span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                    Talla {task.complexity}
                  </span>
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    {formatDateString(task.completedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
