/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, ActiveTab, CurrentUserRole } from './types';
import { INITIAL_TASKS } from './data/initialTasks';
import { Navbar } from './components/Navbar';
import { KanbanView } from './components/KanbanView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { CampaignsView } from './components/CampaignsView';
import { TransparencyDashboard } from './components/TransparencyDashboard';
import { WeeklyProductivity } from './components/WeeklyProductivity';
import { ArchiveView } from './components/ArchiveView';
import { IntakeModal } from './components/IntakeModal';
import { TaskModal } from './components/TaskModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { SupplierAlertModal } from './components/SupplierAlertModal';
import { checkSupplierAlert, getWipCount, WIP_LIMIT } from './utils/helpers';
import { AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'dm_ops_hub_tasks_v1';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('kanban');
  const [currentUser, setCurrentUser] = useState<CurrentUserRole>('Benjy');

  // Modals state
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [alertTask, setAlertTask] = useState<Task | null>(null);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }, [tasks]);

  const handleCreateTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleResetSampleData = () => {
    if (confirm('¿Restablecer los datos de ejemplo del departamento con las tareas de Benjy, Hilda y las POs?')) {
      setTasks(INITIAL_TASKS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSendSupplierReminder = (task: Task, method: 'email' | 'whatsapp') => {
    const nowIso = new Date().toISOString();
    const updated: Task = {
      ...task,
      poRemindedAt: nowIso,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `Envió recordatorio preventivo al proveedor ${task.poSupplier} vía ${method.toUpperCase()} (Faltan <48h para fecha compromiso)`,
        },
      ],
    };
    handleUpdateTask(updated);
  };

  // Calculate active 48h alerts count
  const activeAlertCount = tasks.filter((t) => checkSupplierAlert(t).isAlert).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasks={tasks}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'kanban' && (
          <KanbanView
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onSelectTask={setSelectedTask}
            onOpenIntake={() => setIsIntakeOpen(true)}
            currentUser={currentUser}
            onTriggerAlertModal={setAlertTask}
          />
        )}

        {activeTab === 'purchase_orders' && (
          <PurchaseOrdersView
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onSelectTask={setSelectedTask}
            onOpenIntake={() => setIsIntakeOpen(true)}
            currentUser={currentUser}
            onTriggerAlertModal={setAlertTask}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsView
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onSelectTask={setSelectedTask}
            onOpenIntake={() => setIsIntakeOpen(true)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'transparency' && (
          <TransparencyDashboard
            tasks={tasks}
            onSelectTask={setSelectedTask}
            onOpenIntake={() => setIsIntakeOpen(true)}
          />
        )}

        {activeTab === 'weekly_report' && (
          <WeeklyProductivity
            tasks={tasks}
            onSelectTask={setSelectedTask}
            onOpenReportModal={() => setIsWeeklyReportOpen(true)}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onSelectTask={setSelectedTask}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Bottom status and reset bar */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Design & Marketing Hub</span>
            <span>·</span>
            <span>Metodología Pull / Kanban</span>
            <span>·</span>
            <span>Límite WIP: {WIP_LIMIT} tareas</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetSampleData}
              className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer transition"
              title="Restablecer tareas y órdenes de prueba iniciales"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer Datos de Demostración</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <IntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSubmit={handleCreateTask}
        existingTasks={tasks}
      />

      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        allTasks={tasks}
        currentUser={currentUser}
        onTriggerAlertModal={setAlertTask}
      />

      <WeeklyReportModal
        isOpen={isWeeklyReportOpen}
        onClose={() => setIsWeeklyReportOpen(false)}
        tasks={tasks}
      />

      <SupplierAlertModal
        task={alertTask}
        isOpen={!!alertTask}
        onClose={() => setAlertTask(null)}
        onSendReminder={handleSendSupplierReminder}
      />
    </div>
  );
}
