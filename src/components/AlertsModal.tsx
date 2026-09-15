import React from "react";
import { X, AlertTriangle, CheckCircle2, Bell, Check } from "lucide-react";
import { OperationalAlert } from "../types";

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: OperationalAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Operational Alert Stream</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto space-y-2">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active alerts. All systems running at optimal levels.
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-800/70 border border-slate-700/70 rounded-lg flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-1.5 rounded-md mt-0.5 ${
                      alert.severity === "critical"
                        ? "bg-rose-500/20 text-rose-400"
                        : alert.severity === "warning"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{alert.category}</span>
                      <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
                    </div>
                    <p className="text-slate-300 mt-1 leading-normal">{alert.message}</p>
                  </div>
                </div>

                <div>
                  {alert.acknowledged ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="h-3 w-3" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[11px] cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">{alerts.length} total operational alerts</span>
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
          >
            Acknowledge All
          </button>
        </div>
      </div>
    </div>
  );
};
