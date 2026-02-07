import React from "react";
import { AlertTriangle, CheckCircle, XCircle, HelpCircle } from "lucide-react";

const AlertModal = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
}) => {
  if (!isOpen) return null;

  // Tentukan Icon & Warna berdasarkan tipe
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "error":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "confirm":
        return <HelpCircle className="w-12 h-12 text-blue-500" />;
      case "danger":
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      default:
        return <HelpCircle className="w-12 h-12 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-up border border-slate-100">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-slate-50 rounded-full">{getIcon()}</div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-center">
          {/* Tombol Cancel (Hanya muncul jika ada onCancel / Mode Konfirmasi) */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {cancelText}
            </button>
          )}

          {/* Tombol Confirm / OK */}
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 
              ${type === "danger" ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-slate-900 hover:bg-black shadow-slate-200"}
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
