import React, { useState } from 'react';
import {
  X,
  Mail,
  Check,
  Copy,
  Clock,
  Printer,
  Sparkles,
  Layers,
  Send,
  UserCheck,
} from 'lucide-react';
import { Task } from '../types';
import {
  formatComplexityLabel,
  formatDateString,
  getEstimatedHours,
  isTaskArchived,
} from '../utils/helpers';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Filter deliverables from last 7 days
  const completedTasks = tasks.filter((t) => {
    if (!isTaskArchived(t) && t.generalStatus !== 'Completado') return false;
    if (!t.completedAt) return true;
    const completedDate = new Date(t.completedAt).getTime();
    const referenceDate = new Date('2026-10-06T12:00:00Z').getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return referenceDate - completedDate <= sevenDaysMs;
  });

  const countS = completedTasks.filter((t) => t.complexity === 'S').length;
  const countM = completedTasks.filter((t) => t.complexity === 'M').length;
  const countL = completedTasks.filter((t) => t.complexity === 'L').length;
  const totalHours = completedTasks.reduce((acc, t) => acc + getEstimatedHours(t.complexity), 0);

  const benjyTasks = completedTasks.filter((t) => t.assignee === 'Benjy');
  const hildaTasks = completedTasks.filter((t) => t.assignee === 'Hilda');

  const reportDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const generateMarkdown = () => {
    return `# REPORTE SEMANAL DE ENTREGABLES - DEPARTAMENTO DE DISEÑO & MERCADOTECNIA
**Generado automáticamente:** Viernes 4:00 PM (${reportDate})
**Destinatarios:** Jefatura de Diseño & Mkt, Benjy, Hilda

---
### RESUMEN EJECUTIVO DE PRODUCTIVIDAD
* **Total de Entregables Completados:** ${completedTasks.length}
* **Horas de Esfuerzo Estimadas:** ~${totalHours.toFixed(1)} hrs

### DESGLOSE POR COMPLEJIDAD / TALLA
* **Talla S (< 1 hora):** ${countS} tareas
* **Talla M (2 a 5 horas):** ${countM} tareas
* **Talla L (> 1 jornada):** ${countL} tareas

### APORTACIÓN POR OPERATIVO
* **Benjy:** ${benjyTasks.length} entregables (~${benjyTasks.reduce((a, t) => a + getEstimatedHours(t.complexity), 0).toFixed(1)} hrs)
* **Hilda:** ${hildaTasks.length} entregables (~${hildaTasks.reduce((a, t) => a + getEstimatedHours(t.complexity), 0).toFixed(1)} hrs)

---
### LISTA DETALLADA DE ENTREGABLES CONCLUIDOS:
${completedTasks
  .map(
    (t) =>
      `- [${t.id}] **${t.title}** | Tipo: ${t.taskType} | Solicitado por: ${t.requesterName} (${t.requesterDept}) | Asignado: ${t.assignee} | Talla: ${t.complexity}`
  )
  .join('\n')}

---
*Reporte generado por el Sistema Operativo Pull/Kanban de Diseño y Mercadotecnia.*`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateEmail = () => {
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                Automático: Viernes 4:00 PM
              </span>
              <h2 className="text-base font-bold tracking-tight">
                Reporte Semanal de Productividad y Entregables
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Consolidación de entregables de los últimos 7 días para los 2 jefes y el equipo.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Header Simulation */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs space-y-1.5 font-sans">
          <div className="flex items-center text-slate-600">
            <span className="w-20 font-bold text-slate-700">Para:</span>
            <span className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded mr-1">
              jefes@theorganicside.com
            </span>
            <span className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded mr-1">
              benjy@theorganicside.com
            </span>
            <span className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
              hilda@theorganicside.com
            </span>
          </div>
          <div className="flex items-center text-slate-600">
            <span className="w-20 font-bold text-slate-700">Asunto:</span>
            <span className="text-slate-900 font-semibold">
              [Reporte Semanal D&M] Resumen de Entregables de la Semana ({reportDate})
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 font-sans">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                Total Entregables
              </span>
              <span className="text-xl font-mono font-bold text-indigo-900">
                {completedTasks.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                Horas Estimadas
              </span>
              <span className="text-xl font-mono font-bold text-indigo-900">
                ~{totalHours.toFixed(1)} h
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                Benjy
              </span>
              <span className="text-xl font-mono font-bold text-blue-700">
                {benjyTasks.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                Hilda
              </span>
              <span className="text-xl font-mono font-bold text-emerald-700">
                {hildaTasks.length}
              </span>
            </div>
          </div>

          {/* S/M/L Breakdown */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Desglose por Talla y Complejidad</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="block font-bold text-slate-900 text-sm">{countS}</span>
                <span className="text-[11px] text-slate-500">Talla S (&lt; 1h)</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="block font-bold text-slate-900 text-sm">{countM}</span>
                <span className="text-[11px] text-slate-500">Talla M (2-5h)</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <span className="block font-bold text-slate-900 text-sm">{countL}</span>
                <span className="text-[11px] text-slate-500">Talla L (&gt; 1 jornada)</span>
              </div>
            </div>
          </div>

          {/* Deliverables List */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Detalle de Tareas Finalizadas:
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="truncate max-w-sm">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-slate-700">{t.id}</span>
                      <span className="font-medium text-slate-900 truncate">{t.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {t.taskType} · {t.requesterName} ({t.requesterDept})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-700">{t.assignee}</span>
                    <span className="font-mono text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                      {t.complexity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="text-xs border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado al portapapeles' : 'Copiar Reporte'}</span>
          </button>

          <div className="flex items-center space-x-2">
            {emailSent ? (
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center space-x-1 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>¡Correo enviado a jefes y equipo!</span>
              </span>
            ) : (
              <button
                onClick={handleSimulateEmail}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simular Envío de Correo Ahora</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
