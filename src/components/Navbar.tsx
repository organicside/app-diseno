import React from 'react';
import {
  Kanban,
  Package,
  Megaphone,
  Eye,
  BarChart3,
  Archive,
  PlusCircle,
  AlertTriangle,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, CurrentUserRole, Task } from '../types';
import { getWipCount, WIP_LIMIT } from '../utils/helpers';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tasks: Task[];
  currentUser: CurrentUserRole;
  setCurrentUser: (user: CurrentUserRole) => void;
  onOpenIntake: () => void;
  onOpenWeeklyReport: () => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tasks,
  currentUser,
  setCurrentUser,
  onOpenIntake,
  onOpenWeeklyReport,
  activeAlertCount,
}) => {
  const benjyWip = getWipCount(tasks, 'Benjy');
  const hildaWip = getWipCount(tasks, 'Hilda');

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'kanban', label: 'Tablero Kanban', icon: <Kanban className="w-4 h-4" /> },
    {
      id: 'purchase_orders',
      label: 'Órdenes de Compra',
      icon: <Package className="w-4 h-4" />,
      badge: activeAlertCount > 0 ? activeAlertCount : undefined,
    },
    { id: 'campaigns', label: 'Control de Campañas', icon: <Megaphone className="w-4 h-4" /> },
    {
      id: 'transparency',
      label: 'Dashboard Jefes (Transparencia)',
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: 'weekly_report',
      label: 'Resumen Semanal',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'archive',
      label: 'Archivo & Historial',
      icon: <Archive className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800/80">
          {/* Logo & Department Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold tracking-tight shadow-inner">
              <span className="text-white text-base">D&M</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-white tracking-tight">
                  Design & Marketing Ops Hub
                </h1>
                <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded font-mono font-medium">
                  Pull / Kanban
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema Operativo · 2 Operativos (Benjy & Hilda) · 2 Jefes
              </p>
            </div>
          </div>

          {/* Right Status Indicators & Action CTA */}
          <div className="flex items-center space-x-3">
            {/* WIP Indicators */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400 font-medium">WIP En Proceso:</span>
              
              {/* Benjy WIP */}
              <div
                className={`flex items-center space-x-1 px-2 py-0.5 rounded font-mono ${
                  benjyWip > WIP_LIMIT
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : benjyWip === WIP_LIMIT
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-slate-700 text-slate-200'
                }`}
                title={`Benjy: ${benjyWip} tareas en proceso (Límite máximo recomendado: ${WIP_LIMIT})`}
              >
                <span className="font-semibold">Benjy:</span>
                <span>{benjyWip}/{WIP_LIMIT}</span>
                {benjyWip > WIP_LIMIT && <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />}
              </div>

              {/* Hilda WIP */}
              <div
                className={`flex items-center space-x-1 px-2 py-0.5 rounded font-mono ${
                  hildaWip > WIP_LIMIT
                    ? 'bg-rose-950 text-rose-300 border border-rose-700'
                    : hildaWip === WIP_LIMIT
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-slate-700 text-slate-200'
                }`}
                title={`Hilda: ${hildaWip} tareas en proceso (Límite máximo recomendado: ${WIP_LIMIT})`}
              >
                <span className="font-semibold">Hilda:</span>
                <span>{hildaWip}/{WIP_LIMIT}</span>
                {hildaWip > WIP_LIMIT && <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />}
              </div>
            </div>

            {/* Quick Friday Report Trigger */}
            <button
              onClick={onOpenWeeklyReport}
              className="hidden lg:flex items-center space-x-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Reporte semanal automático de los viernes 4:00 PM"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reporte Viernes 4PM</span>
            </button>

            {/* Persona Switcher for convenient testing */}
            <div className="flex items-center space-x-1.5 text-xs bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="user-select" className="text-slate-400">Rol:</label>
              <select
                id="user-select"
                aria-label="Seleccionar rol activo"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value as CurrentUserRole)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="Benjy" className="bg-slate-800 text-white">Benjy (Operativo)</option>
                <option value="Hilda" className="bg-slate-800 text-white">Hilda (Operativa)</option>
                <option value="Jefe" className="bg-slate-800 text-white">Jefe / Dirección</option>
                <option value="Solicitante" className="bg-slate-800 text-white">Solicitante Externo</option>
              </select>
            </div>

            {/* Intake button */}
            <button
              onClick={onOpenIntake}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Solicitud</span>
              <span className="sm:hidden">Intake</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
