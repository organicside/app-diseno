import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Send,
  FileText,
  DollarSign,
  Package,
  Megaphone,
  Palette,
  Bell,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  Task,
  Assignee,
  GeneralStatus,
  Priority,
  Complexity,
  Supplier,
  OrderStatus,
  CampaignStatus,
  CurrentUserRole,
} from '../types';
import {
  checkSupplierAlert,
  formatComplexityLabel,
  formatCurrency,
  formatDateString,
  getWipCount,
  WIP_LIMIT,
} from '../utils/helpers';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  allTasks: Task[];
  currentUser: CurrentUserRole;
  onTriggerAlertModal?: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  allTasks,
  currentUser,
  onTriggerAlertModal,
}) => {
  if (!isOpen || !task) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedAssignee, setEditedAssignee] = useState<Assignee>(task.assignee);
  const [editedGeneralStatus, setEditedGeneralStatus] = useState<GeneralStatus>(task.generalStatus);
  const [editedPriority, setEditedPriority] = useState<Priority>(task.priority);
  const [editedComplexity, setEditedComplexity] = useState<Complexity>(task.complexity);

  // PO fields
  const [editedPoNumber, setEditedPoNumber] = useState(task.poNumber || '');
  const [editedPoProductDesc, setEditedPoProductDesc] = useState(task.poProductDesc || '');
  const [editedPoSupplier, setEditedPoSupplier] = useState<Supplier>(task.poSupplier || 'Etimex');
  const [editedPoStatus, setEditedPoStatus] = useState<OrderStatus>(
    task.poStatus || 'Pendiente de enviar archivo'
  );
  const [editedPoDate, setEditedPoDate] = useState(task.poDeliveryCommitmentDate || '');

  // Campaign fields
  const [editedCampaignItem, setEditedCampaignItem] = useState(task.campaignItem || '');
  const [editedCampaignStart, setEditedCampaignStart] = useState(task.campaignStartDate || '');
  const [editedCampaignEnd, setEditedCampaignEnd] = useState(task.campaignEndDate || '');
  const [editedCampaignBudget, setEditedCampaignBudget] = useState<number | ''>(
    task.campaignBudget ?? ''
  );
  const [editedCampaignStatus, setEditedCampaignStatus] = useState<CampaignStatus>(
    task.campaignStatus || 'Programada'
  );

  const [newComment, setNewComment] = useState('');
  const [wipWarning, setWipWarning] = useState<string | null>(null);

  const supplierAlert = checkSupplierAlert(task);

  // Check if Pull action is possible
  const canPull =
    (currentUser === 'Benjy' || currentUser === 'Hilda') &&
    (task.generalStatus === 'Por Clasificar / Backlog' || task.assignee !== currentUser);

  const handlePullTask = () => {
    if (currentUser !== 'Benjy' && currentUser !== 'Hilda') return;

    const currentWip = getWipCount(allTasks, currentUser);
    if (currentWip >= WIP_LIMIT) {
      setWipWarning(
        `⚠️ ¡Límite WIP Alcanzado! Tienes actualmente ${currentWip} tareas en proceso. El límite recomendado es máximo ${WIP_LIMIT} tareas simultáneas para mantener el flujo Pull.`
      );
    } else {
      setWipWarning(null);
    }

    const nowIso = new Date().toISOString();
    const updated: Task = {
      ...task,
      assignee: currentUser,
      generalStatus: 'En Proceso',
      startedAt: task.startedAt || nowIso,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `Tomó la tarea (Pull) y la asignó a sí mismo pasando a "En Proceso"`,
        },
      ],
    };
    onUpdateTask(updated);
  };

  const handleSave = () => {
    // Check WIP if moving to En Proceso
    if (
      editedGeneralStatus === 'En Proceso' &&
      (editedAssignee === 'Benjy' || editedAssignee === 'Hilda') &&
      task.generalStatus !== 'En Proceso'
    ) {
      const activeCount = getWipCount(allTasks, editedAssignee);
      if (activeCount >= WIP_LIMIT) {
        setWipWarning(
          `⚠️ Advertencia: ${editedAssignee} ya tiene ${activeCount} tareas en proceso (Límite: ${WIP_LIMIT}).`
        );
      }
    }

    const nowIso = new Date().toISOString();
    const updated: Task = {
      ...task,
      title: editedTitle.trim(),
      description: editedDescription.trim(),
      assignee: editedAssignee,
      generalStatus: editedGeneralStatus,
      priority: editedPriority,
      complexity: editedComplexity,
      startedAt:
        editedGeneralStatus === 'En Proceso' && !task.startedAt ? nowIso : task.startedAt,
      completedAt:
        editedGeneralStatus === 'Completado' ||
        (task.taskType === 'Orden de Compra' && editedPoStatus === 'Entregado') ||
        (task.taskType === 'Campaña Publicitaria' && editedCampaignStatus === 'Finalizada')
          ? task.completedAt || nowIso
          : null,
    };

    if (task.taskType === 'Orden de Compra') {
      updated.poNumber = editedPoNumber;
      updated.poProductDesc = editedPoProductDesc;
      updated.poSupplier = editedPoSupplier;
      updated.poStatus = editedPoStatus;
      updated.poDeliveryCommitmentDate = editedPoDate || undefined;
      // If order is delivered, set generalStatus to Completado automatically
      if (editedPoStatus === 'Entregado') {
        updated.generalStatus = 'Completado';
        if (!updated.completedAt) updated.completedAt = nowIso;
      }
    } else if (task.taskType === 'Campaña Publicitaria') {
      updated.campaignItem = editedCampaignItem;
      updated.campaignStartDate = editedCampaignStart || undefined;
      updated.campaignEndDate = editedCampaignEnd || undefined;
      updated.campaignBudget =
        typeof editedCampaignBudget === 'number' ? editedCampaignBudget : undefined;
      updated.campaignStatus = editedCampaignStatus;
      // If campaign finalized, set general status to Completado automatically
      if (editedCampaignStatus === 'Finalizada') {
        updated.generalStatus = 'Completado';
        if (!updated.completedAt) updated.completedAt = nowIso;
      }
    }

    // Add history log
    updated.history = [
      ...(task.history || []),
      {
        id: `h-${Date.now()}`,
        timestamp: nowIso,
        user: currentUser,
        action: `Actualizó información de la tarea`,
      },
    ];

    onUpdateTask(updated);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const nowIso = new Date().toISOString();
    const updated: Task = {
      ...task,
      history: [
        ...(task.history || []),
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: currentUser,
          action: `Nota: "${newComment.trim()}"`,
        },
      ],
    };
    onUpdateTask(updated);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-semibold">
              {task.id}
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-300">
              {task.taskType === 'Diseño General' && (
                <span className="flex items-center space-x-1 text-indigo-300 font-medium">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Diseño General</span>
                </span>
              )}
              {task.taskType === 'Orden de Compra' && (
                <span className="flex items-center space-x-1 text-amber-300 font-medium">
                  <Package className="w-3.5 h-3.5" />
                  <span>Orden de Compra</span>
                </span>
              )}
              {task.taskType === 'Campaña Publicitaria' && (
                <span className="flex items-center space-x-1 text-purple-300 font-medium">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Campaña Publicitaria</span>
                </span>
              )}
              <span>·</span>
              <span>Solicita: {task.requesterName} ({task.requesterDept})</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition cursor-pointer"
              >
                Editar Campos
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WIP Warning Banner if triggered */}
        {wipWarning && (
          <div className="bg-amber-500/15 border-b border-amber-300 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{wipWarning}</span>
            </div>
            <button
              onClick={() => setWipWarning(null)}
              className="text-amber-800 hover:text-amber-950 font-bold ml-2"
            >
              Entendido
            </button>
          </div>
        )}

        {/* 48h Supplier Alert Banner */}
        {task.taskType === 'Orden de Compra' && supplierAlert.isAlert && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
              <span className="font-semibold">
                Alerta de Proveedor ({task.poSupplier}): {supplierAlert.label}
              </span>
            </div>
            {onTriggerAlertModal && (
              <button
                onClick={() => onTriggerAlertModal(task)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded text-[11px] font-medium flex items-center space-x-1 cursor-pointer"
              >
                <Bell className="w-3 h-3" />
                <span>Enviar Recordatorio</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Pull Bar if unassigned or in backlog */}
          {canPull && !isEditing && (
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Flujo Pull: ¿Tienes capacidad disponible para tomar esta tarea?</span>
                </p>
                <p className="text-[11px] text-indigo-700">
                  Se asignará automáticamente a ti ({currentUser}) y pasará a &quot;En Proceso&quot;.
                </p>
              </div>
              <button
                onClick={handlePullTask}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Tomar Tarea Ahora</span>
              </button>
            </div>
          )}

          {isEditing ? (
            /* EDIT FORM */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Título de la Tarea
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Asignado a</label>
                  <select
                    value={editedAssignee}
                    onChange={(e) => setEditedAssignee(e.target.value as Assignee)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Sin Asignar">Sin Asignar</option>
                    <option value="Benjy">Benjy</option>
                    <option value="Hilda">Hilda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Estado General</label>
                  <select
                    value={editedGeneralStatus}
                    onChange={(e) => setEditedGeneralStatus(e.target.value as GeneralStatus)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Por Clasificar / Backlog">Por Clasificar / Backlog</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="En Pausa">En Pausa</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value as Priority)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Complejidad</label>
                  <select
                    value={editedComplexity}
                    onChange={(e) => setEditedComplexity(e.target.value as Complexity)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="S">S (&lt; 1h)</option>
                    <option value="M">M (2-5h)</option>
                    <option value="L">L (&gt; 1 día)</option>
                  </select>
                </div>
              </div>

              {/* Conditional PO edit */}
              {task.taskType === 'Orden de Compra' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900">Campos de Orden de Compra</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-amber-950 block">PO #</label>
                      <input
                        type="text"
                        value={editedPoNumber}
                        onChange={(e) => setEditedPoNumber(e.target.value)}
                        className="w-full text-xs bg-white border border-amber-300 rounded p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-amber-950 block">Proveedor</label>
                      <select
                        value={editedPoSupplier}
                        onChange={(e) => setEditedPoSupplier(e.target.value as Supplier)}
                        className="w-full text-xs bg-white border border-amber-300 rounded p-1.5"
                      >
                        <option value="Etimex">Etimex</option>
                        <option value="Focomsa">Focomsa</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-amber-950 block">Producto / Descripción</label>
                    <input
                      type="text"
                      value={editedPoProductDesc}
                      onChange={(e) => setEditedPoProductDesc(e.target.value)}
                      className="w-full text-xs bg-white border border-amber-300 rounded p-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-amber-950 block">Estado de la Orden</label>
                      <select
                        value={editedPoStatus}
                        onChange={(e) => setEditedPoStatus(e.target.value as OrderStatus)}
                        className="w-full text-xs bg-white border border-amber-300 rounded p-1.5"
                      >
                        <option value="Pendiente de enviar archivo">Pendiente de enviar archivo</option>
                        <option value="A la espera de Print cards">A la espera de Print cards</option>
                        <option value="Pendiente firmar Print card">Pendiente firmar Print card</option>
                        <option value="Producción en proceso">Producción en proceso</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-amber-950 block">Fecha Compromiso</label>
                      <input
                        type="date"
                        value={editedPoDate}
                        onChange={(e) => setEditedPoDate(e.target.value)}
                        className="w-full text-xs bg-white border border-amber-300 rounded p-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Campaign edit */}
              {task.taskType === 'Campaña Publicitaria' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-3">
                  <h4 className="text-xs font-bold text-purple-900">Campos de Campaña Publicitaria</h4>
                  <div>
                    <label className="text-[11px] font-medium text-purple-950 block">Qué se publicita</label>
                    <input
                      type="text"
                      value={editedCampaignItem}
                      onChange={(e) => setEditedCampaignItem(e.target.value)}
                      className="w-full text-xs bg-white border border-purple-300 rounded p-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-purple-950 block">Inicio</label>
                      <input
                        type="date"
                        value={editedCampaignStart}
                        onChange={(e) => setEditedCampaignStart(e.target.value)}
                        className="w-full text-xs bg-white border border-purple-300 rounded p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-purple-950 block">Fin</label>
                      <input
                        type="date"
                        value={editedCampaignEnd}
                        onChange={(e) => setEditedCampaignEnd(e.target.value)}
                        className="w-full text-xs bg-white border border-purple-300 rounded p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-purple-950 block">Presupuesto ($)</label>
                      <input
                        type="number"
                        value={editedCampaignBudget}
                        onChange={(e) =>
                          setEditedCampaignBudget(e.target.value ? parseFloat(e.target.value) : '')
                        }
                        className="w-full text-xs bg-white border border-purple-300 rounded p-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-purple-950 block">Estado de Campaña</label>
                    <select
                      value={editedCampaignStatus}
                      onChange={(e) => setEditedCampaignStatus(e.target.value as CampaignStatus)}
                      className="w-full text-xs bg-white border border-purple-300 rounded p-1.5"
                    >
                      <option value="Programada">Programada</option>
                      <option value="Activa">Activa</option>
                      <option value="En Pausa">En Pausa</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          ) : (
            /* VIEW DETAILS */
            <div className="space-y-6">
              {/* Title & Desc */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-snug">{task.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {task.description || 'Sin requerimiento detallado.'}
                </p>
              </div>

              {/* Status & Assignment metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Asignado a:</span>
                  <span
                    className={`font-semibold ${
                      task.assignee === 'Sin Asignar'
                        ? 'text-slate-500 italic'
                        : task.assignee === 'Benjy'
                        ? 'text-blue-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {task.assignee}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Estado General:</span>
                  <span className="font-semibold text-slate-800">{task.generalStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Prioridad:</span>
                  <span
                    className={`font-semibold ${
                      task.priority === 'Alta'
                        ? 'text-rose-600'
                        : task.priority === 'Media'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Complejidad:</span>
                  <span className="font-semibold text-indigo-700">
                    {formatComplexityLabel(task.complexity)}
                  </span>
                </div>
              </div>

              {/* Conditional PO details */}
              {task.taskType === 'Orden de Compra' && (
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                      <Package className="w-4 h-4 text-amber-700" />
                      <span>Rastreo de Orden de Compra (Material de Empaque)</span>
                    </h4>
                    <span className="font-mono text-xs font-bold text-amber-800">
                      {task.poNumber || 'S/N'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Proveedor:</span>
                      <span className="font-semibold text-slate-800">
                        {task.poSupplier === 'Otro' ? task.poSupplierOther : task.poSupplier}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Estado de la Orden:</span>
                      <span className="font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded inline-block">
                        {task.poStatus || 'Pendiente'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Fecha Compromiso Entrega:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDateString(task.poDeliveryCommitmentDate)}
                      </span>
                    </div>
                  </div>

                  {task.poProductDesc && (
                    <div className="text-xs pt-1 border-t border-amber-100">
                      <span className="text-slate-500 block">Producto / Descripción:</span>
                      <p className="text-slate-700 font-medium">{task.poProductDesc}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Campaign details */}
              {task.taskType === 'Campaña Publicitaria' && (
                <div className="border border-purple-200 bg-purple-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center space-x-1.5">
                      <Megaphone className="w-4 h-4 text-purple-700" />
                      <span>Control de Campaña Publicitaria</span>
                    </h4>
                    <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                      {task.campaignStatus || 'Programada'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Vigencia:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDateString(task.campaignStartDate)} -{' '}
                        {formatDateString(task.campaignEndDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Presupuesto ($):</span>
                      <span className="font-semibold text-purple-700 font-mono text-sm">
                        {formatCurrency(task.campaignBudget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Producto / Asunto:</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {task.campaignItem || task.title}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
                    Archivos Adjuntos ({task.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-medium text-slate-700 truncate">{att.name}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] shrink-0">{att.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity / History Log */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
                  Historial de Operación y Comentarios
                </h4>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {task.history && task.history.length > 0 ? (
                    task.history.map((h) => (
                      <div
                        key={h.id}
                        className="text-xs bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-start space-x-2"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">{h.user}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(h.timestamp).toLocaleTimeString('es-MX', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{h.action}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sin historial registrado.</p>
                  )}
                </div>

                {/* Add note input */}
                <div className="mt-3 flex space-x-2">
                  <input
                    type="text"
                    placeholder="Agregar nota interna de seguimiento..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3 py-2 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Anotar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Creada el {formatDateString(task.createdAt)}</span>
            {task.completedAt && (
              <span className="ml-2 font-medium text-emerald-700">
                · Finalizada el {formatDateString(task.completedAt)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (confirm(`¿Estás seguro de eliminar la tarea ${task.id}?`)) {
                  onDeleteTask(task.id);
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
              title="Eliminar tarea"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-1.5 rounded-lg transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
