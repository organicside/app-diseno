import React, { useState } from 'react';
import {
  X,
  Upload,
  Send,
  FileText,
  AlertCircle,
  HelpCircle,
  ShoppingBag,
  Megaphone,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { Task, TaskType, Priority, Complexity, Supplier, OrderStatus, CampaignStatus, TaskAttachment } from '../types';
import { generateNextId } from '../utils/helpers';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
  existingTasks: Task[];
}

export const IntakeModal: React.FC<IntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingTasks,
}) => {
  if (!isOpen) return null;

  // General fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterDept, setRequesterDept] = useState('Mercadotecnia');
  const [taskType, setTaskType] = useState<TaskType>('Diseño General');
  const [priority, setPriority] = useState<Priority>('Media');
  const [complexity, setComplexity] = useState<Complexity>('M');

  // Purchase Order specific
  const [poNumber, setPoNumber] = useState('');
  const [poProductDesc, setPoProductDesc] = useState('');
  const [poSupplier, setPoSupplier] = useState<Supplier>('Etimex');
  const [poSupplierOther, setPoSupplierOther] = useState('');
  const [poStatus, setPoStatus] = useState<OrderStatus>('Pendiente de enviar archivo');
  const [poDeliveryCommitmentDate, setPoDeliveryCommitmentDate] = useState('');

  // Campaign specific
  const [campaignItem, setCampaignItem] = useState('');
  const [campaignStartDate, setCampaignStartDate] = useState('');
  const [campaignEndDate, setCampaignEndDate] = useState('');
  const [campaignBudget, setCampaignBudget] = useState<number | ''>('');
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>('Programada');

  // Attachments simulation
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [simulatedFileName, setSimulatedFileName] = useState('');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState('');

  const handleAddAttachment = () => {
    if (!simulatedFileName.trim()) return;
    const newAtt: TaskAttachment = {
      id: `att-${Date.now()}`,
      name: simulatedFileName.trim(),
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      type: simulatedFileName.endsWith('.pdf') ? 'application/pdf' : 'application/file',
    };
    setAttachments([...attachments, newAtt]);
    setSimulatedFileName('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requesterName.trim()) {
      return;
    }

    const nextId = generateNextId(existingTasks);
    const nowIso = new Date().toISOString();

    const newTask: Task = {
      id: nextId,
      title: title.trim(),
      description: description.trim(),
      requesterName: requesterName.trim(),
      requesterDept: requesterDept.trim(),
      taskType,
      assignee: 'Sin Asignar', // Pull system rule: all enter unassigned
      generalStatus: 'Por Clasificar / Backlog', // Intake rule: directly enters Backlog
      priority,
      complexity,
      createdAt: nowIso,
      attachments,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          user: `${requesterName.trim()} (${requesterDept})`,
          action: 'Ingresó solicitud formal a través del Intake Form centralizado',
        },
      ],
    };

    if (taskType === 'Orden de Compra') {
      newTask.poNumber = poNumber.trim() || `PO-${Math.floor(1000 + Math.random() * 9000)}`;
      newTask.poProductDesc = poProductDesc.trim();
      newTask.poSupplier = poSupplier;
      if (poSupplier === 'Otro') {
        newTask.poSupplierOther = poSupplierOther.trim();
      }
      newTask.poStatus = poStatus;
      newTask.poDeliveryCommitmentDate = poDeliveryCommitmentDate || undefined;
    } else if (taskType === 'Campaña Publicitaria') {
      newTask.campaignItem = campaignItem.trim() || title.trim();
      newTask.campaignStartDate = campaignStartDate || undefined;
      newTask.campaignEndDate = campaignEndDate || undefined;
      newTask.campaignBudget = typeof campaignBudget === 'number' ? campaignBudget : undefined;
      newTask.campaignStatus = campaignStatus;
    }

    onSubmit(newTask);
    setCreatedId(nextId);
    setFormSubmitted(true);
  };

  const handleResetAndClose = () => {
    setFormSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded font-mono font-medium">
                Vía Intake Form
              </span>
              <h2 className="text-lg font-semibold tracking-tight">
                Captura Centralizada de Requerimiento
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ingreso directo al <strong>Backlog</strong> del equipo de Diseño y Mercadotecnia.
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

        {formSubmitted ? (
          /* Confirmation Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">¡Solicitud Ingresada con Éxito!</h3>
              <p className="text-sm text-slate-600 mt-1">
                Se ha generado el folio de seguimiento:{' '}
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {createdId}
                </span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 text-left max-w-md mx-auto space-y-1.5">
              <p className="font-semibold text-slate-800">Próximos pasos en Metodología Pull:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>La tarea ya está registrada en el <strong>Backlog general</strong>.</li>
                <li>Benjy o Hilda tomarán la tarea conforme tengan capacidad operativa disponible.</li>
                <li>Podrás consultar el estado en tiempo real en el <em>Dashboard de Transparencia</em>.</li>
              </ul>
            </div>
            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition cursor-pointer"
              >
                Volver al Sistema
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Rule Callout */}
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-lg text-xs text-indigo-900 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Regla de Intake:</strong> Toda solicitud ingresa sin asignar a la cola de pendientes. Benjy e Hilda la tomarán según prioridad y disponibilidad sin saturar su límite de trabajo en proceso.
              </span>
            </div>

            {/* Solicitante y Departamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Solicitante *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Morales"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Departamento Solicitante *
                </label>
                <select
                  value={requesterDept}
                  onChange={(e) => setRequesterDept(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="Mercadotecnia">Mercadotecnia</option>
                  <option value="Ventas y Expansión">Ventas y Expansión</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Operaciones & Compras">Operaciones & Compras</option>
                  <option value="Desarrollo de Producto">Desarrollo de Producto</option>
                  <option value="Dirección General">Dirección General</option>
                  <option value="Calidad y Regulatorio">Calidad y Regulatorio</option>
                  <option value="Otro">Otro Departamento</option>
                </select>
              </div>
            </div>

            {/* Selector de Tipo de Tarea (CONDICIONAL MAESTRO) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tipo de Tarea * (Despliega campos específicos)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTaskType('Diseño General')}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                    taskType === 'Diseño General'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Palette className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-xs font-bold">Diseño General</span>
                  <span className="text-[11px] text-slate-500">Artes, empaques, banners, PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskType('Orden de Compra')}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                    taskType === 'Orden de Compra'
                      ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-xs font-bold">Orden de Compra</span>
                  <span className="text-[11px] text-slate-500">Material empaque, Etimex/Focomsa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskType('Campaña Publicitaria')}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                    taskType === 'Campaña Publicitaria'
                      ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Megaphone className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-xs font-bold">Campaña Publicitaria</span>
                  <span className="text-[11px] text-slate-500">Pauta digital, presupuesto, fechas</span>
                </button>
              </div>
            </div>

            {/* Título de la tarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Título de la Tarea / Requerimiento *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Diseño de etiqueta para crema hidratante 100ml"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Descripción Detallada / Requerimientos Técnicos
              </label>
              <textarea
                rows={3}
                placeholder="Indica medidas, colores, textos obligatorios, troqueles o especificaciones del arte..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* CAMPOS CONDICIONALES: ORDEN DE COMPRA */}
            {taskType === 'Orden de Compra' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 border-b border-amber-200/80 pb-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Campos Específicos: Orden de Compra (Material de Empaque)
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-950 mb-1">
                      Número de Orden de Compra (PO)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. PO-9450"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-950 mb-1">
                      Proveedor
                    </label>
                    <select
                      value={poSupplier}
                      onChange={(e) => setPoSupplier(e.target.value as Supplier)}
                      className="w-full text-sm bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Etimex">Etimex</option>
                      <option value="Focomsa">Focomsa</option>
                      <option value="Otro">Otro Proveedor</option>
                    </select>
                  </div>
                </div>

                {poSupplier === 'Otro' && (
                  <div>
                    <label className="block text-xs font-medium text-amber-950 mb-1">
                      Especificar Nombre del Proveedor
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del proveedor externo"
                      value={poSupplierOther}
                      onChange={(e) => setPoSupplierOther(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-amber-950 mb-1">
                    Producto / Descripción del Empaque
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Cajas de microcorrugado con acabado mate y barniz UV"
                    value={poProductDesc}
                    onChange={(e) => setPoProductDesc(e.target.value)}
                    className="w-full text-sm bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-950 mb-1">
                      Estado de la Orden
                    </label>
                    <select
                      value={poStatus}
                      onChange={(e) => setPoStatus(e.target.value as OrderStatus)}
                      className="w-full text-sm bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Pendiente de enviar archivo">Pendiente de enviar archivo</option>
                      <option value="A la espera de Print cards">A la espera de Print cards</option>
                      <option value="Pendiente firmar Print card">Pendiente firmar Print card</option>
                      <option value="Producción en proceso">Producción en proceso</option>
                      <option value="Entregado">Entregado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-950 mb-1">
                      Fecha Compromiso de Entrega del Proveedor
                    </label>
                    <input
                      type="date"
                      value={poDeliveryCommitmentDate}
                      onChange={(e) => setPoDeliveryCommitmentDate(e.target.value)}
                      className="w-full text-sm bg-white border border-amber-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-amber-800 mt-1">
                      * El sistema activará alerta preventiva si faltan menos de 48 hrs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CAMPOS CONDICIONALES: CAMPAÑA PUBLICITARIA */}
            {taskType === 'Campaña Publicitaria' && (
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-purple-900 border-b border-purple-200/80 pb-2">
                  <Megaphone className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Campos Específicos: Campañas Publicitarias
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-medium text-purple-950 mb-1">
                    Qué se está publicitando *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Línea Botánica de Invierno - Descuento 20% en combos"
                    value={campaignItem}
                    onChange={(e) => setCampaignItem(e.target.value)}
                    className="w-full text-sm bg-white border border-purple-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-purple-950 mb-1">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={campaignStartDate}
                      onChange={(e) => setCampaignStartDate(e.target.value)}
                      className="w-full text-sm bg-white border border-purple-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-purple-950 mb-1">
                      Fecha de Finalización
                    </label>
                    <input
                      type="date"
                      value={campaignEndDate}
                      onChange={(e) => setCampaignEndDate(e.target.value)}
                      className="w-full text-sm bg-white border border-purple-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-purple-950 mb-1">
                      Presupuesto ($ MXN)
                    </label>
                    <input
                      type="number"
                      placeholder="Ej. 35000"
                      value={campaignBudget}
                      onChange={(e) =>
                        setCampaignBudget(e.target.value ? parseFloat(e.target.value) : '')
                      }
                      className="w-full text-sm bg-white border border-purple-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-purple-950 mb-1">
                    Estado de Campaña
                  </label>
                  <select
                    value={campaignStatus}
                    onChange={(e) => setCampaignStatus(e.target.value as CampaignStatus)}
                    className="w-full text-sm bg-white border border-purple-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Programada">Programada</option>
                    <option value="Activa">Activa</option>
                    <option value="En Pausa">En Pausa</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                </div>
              </div>
            )}

            {/* Prioridad y Complejidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Prioridad Solicitada
                </label>
                <div className="flex space-x-2">
                  {(['Alta', 'Media', 'Baja'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        priority === p
                          ? p === 'Alta'
                            ? 'bg-rose-50 border-rose-500 text-rose-700'
                            : p === 'Media'
                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                            : 'bg-slate-100 border-slate-500 text-slate-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Complejidad Estimada (Talla)
                </label>
                <div className="flex space-x-2">
                  {(['S', 'M', 'L'] as Complexity[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setComplexity(c)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition cursor-pointer ${
                        complexity === c
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {c === 'S' && 'S (<1h)'}
                      {c === 'M' && 'M (2-5h)'}
                      {c === 'L' && 'L (>1 día)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Archivos Adjuntos */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Archivos Adjuntos / Referencias
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Nombre de archivo o URL (ej: Troquel_v2.ai, Referencia.pdf)"
                  value={simulatedFileName}
                  onChange={(e) => setSimulatedFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAttachment();
                    }
                  }}
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 flex items-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Adjuntar</span>
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700"
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-medium truncate">{att.name}</span>
                        <span className="text-slate-400">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Solicitud al Backlog</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
