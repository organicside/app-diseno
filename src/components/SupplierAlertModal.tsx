import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Bell,
  Mail,
  MessageSquare,
  Check,
  Clock,
  Package,
  Send,
} from 'lucide-react';
import { Task } from '../types';
import { checkSupplierAlert, formatDateString } from '../utils/helpers';

interface SupplierAlertModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReminder: (task: Task, method: 'email' | 'whatsapp') => void;
}

export const SupplierAlertModal: React.FC<SupplierAlertModalProps> = ({
  task,
  isOpen,
  onClose,
  onSendReminder,
}) => {
  if (!isOpen || !task) return null;

  const [reminderSent, setReminderSent] = useState(false);
  const alertInfo = checkSupplierAlert(task);

  const supplierEmail =
    task.poSupplier === 'Etimex'
      ? 'atencion@etimex.com'
      : task.poSupplier === 'Focomsa'
      ? 'operaciones@focomsa.com'
      : 'contacto@proveedor.com';

  const defaultMessage = `Estimado equipo de ${task.poSupplier},

Les recordamos atentamente que la orden de compra ${task.poNumber || 'S/N'} (${task.poProductDesc || task.title}) tiene como fecha compromiso de entrega el día ${formatDateString(task.poDeliveryCommitmentDate)} (faltan aprox. ${alertInfo.hoursRemaining} horas).

Estado actual registrado: "${task.poStatus}".
Agradecemos confirmarnos el estatus de despacho para programar la recepción en nuestro almacén central.

Atentamente,
Departamento de Diseño y Mercadotecnia`;

  const [message, setMessage] = useState(defaultMessage);

  const handleSend = (method: 'email' | 'whatsapp') => {
    onSendReminder(task, method);
    setReminderSent(true);
    setTimeout(() => {
      setReminderSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-rose-900 text-white flex items-center justify-between border-b border-rose-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-300 animate-pulse" />
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Alerta Preventiva al Proveedor (&lt;48h)
              </h3>
              <p className="text-xs text-rose-200">
                Regla de negocio 3: Envío preventivo de recordatorio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-rose-300 hover:text-white p-1 rounded-lg hover:bg-rose-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status info box */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-slate-900">
                {task.poNumber} · {task.poSupplier}
              </span>
              <span className="bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                {alertInfo.hoursRemaining < 0
                  ? '¡ORDEN VENCIDA!'
                  : `¡QUEDAN ${alertInfo.hoursRemaining} HORAS!`}
              </span>
            </div>

            <p className="text-slate-700 font-medium">{task.poProductDesc || task.title}</p>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-rose-200 text-slate-600">
              <div>
                <span>Fecha Compromiso:</span>
                <span className="block font-bold text-slate-900">
                  {formatDateString(task.poDeliveryCommitmentDate)}
                </span>
              </div>
              <div>
                <span>Estado Actual:</span>
                <span className="block font-bold text-amber-800">{task.poStatus}</span>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Destinatario ({task.poSupplier}):
            </label>
            <input
              type="text"
              readOnly
              value={supplierEmail}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-mono text-slate-700"
            />
          </div>

          {/* Editable message body */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Mensaje del Recordatorio:
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 border rounded-lg px-3 py-1.5"
          >
            Cancelar
          </button>

          {reminderSent ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center space-x-1 animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Recordatorio enviado exitosamente</span>
            </span>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => handleSend('whatsapp')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleSend('email')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar Correo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
