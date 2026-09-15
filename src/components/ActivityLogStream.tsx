import React, { useState, useMemo } from "react";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Calendar,
  AlertTriangle,
  Award,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Radio,
} from "lucide-react";
import { ActivityLog } from "../types";

interface ActivityLogStreamProps {
  logs: ActivityLog[];
  maxHeight?: string;
  showFilters?: boolean;
}

export const ActivityLogStream: React.FC<ActivityLogStreamProps> = ({
  logs,
  maxHeight = "max-h-[380px]",
  showFilters = true,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = filterType === "ALL" || log.action_type === filterType;
      const matchesSearch =
        searchTerm === "" ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.timestamp.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [logs, filterType, searchTerm]);

  const getActionBadge = (type: ActivityLog["action_type"]) => {
    switch (type) {
      case "ENTRY":
        return {
          icon: ShieldCheck,
          label: "GATE ENTRY",
          bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      case "ILLEGAL_ENTRY":
        return {
          icon: ShieldAlert,
          label: "SECURITY BREACH",
          bg: "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse",
        };
      case "WARNING":
        return {
          icon: AlertTriangle,
          label: "WARNING",
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
      case "REGISTRATION":
        return {
          icon: UserPlus,
          label: "REGISTRATION",
          bg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };
      case "SCHEDULING":
        return {
          icon: Calendar,
          label: "SCHEDULING",
          bg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        };
      case "INCIDENT":
        return {
          icon: AlertTriangle,
          label: "INCIDENT",
          bg: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        };
      case "SPONSOR":
        return {
          icon: Award,
          label: "SPONSOR ROI",
          bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        };
      default:
        return {
          icon: Activity,
          label: type,
          bg: "bg-slate-800 text-slate-300 border-slate-700",
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Live Event Activity & Audit Stream</h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                SYNCED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified real-time feed capturing gate turnstile entries, PIN authentications, scheduling updates, and critical incidents.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-medium text-slate-400">
            Total Logged Events: <strong className="text-cyan-400">{logs.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {showFilters && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-4">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>Filter:</span>
            </span>
            {[
              { id: "ALL", label: "All Events" },
              { id: "ENTRY", label: "Gate Entries" },
              { id: "ILLEGAL_ENTRY", label: "Security Breaches" },
              { id: "REGISTRATION", label: "Registrations" },
              { id: "SCHEDULING", label: "Scheduling" },
              { id: "INCIDENT", label: "Incidents" },
              { id: "SPONSOR", label: "Sponsors" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  filterType === cat.id
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search log messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Logs Scrollable Stream */}
      <div className={`mt-4 ${maxHeight} overflow-y-auto overflow-x-hidden space-y-2 pr-1 divide-y divide-slate-800/50`}>
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No activity logs found matching the selected filter.
          </div>
        ) : (
          filteredLogs.map((item) => {
            const badge = getActionBadge(item.action_type);
            const Icon = badge.icon;
            const isBreach = item.action_type === "ILLEGAL_ENTRY";

            return (
              <div
                key={item.id}
                className={`pt-2.5 pb-2 flex items-start gap-3 transition-colors ${
                  isBreach ? "bg-rose-950/20 px-2 rounded-lg border border-rose-900/40" : ""
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-relaxed ${
                      isBreach ? "text-rose-200 font-semibold" : "text-slate-200"
                    }`}
                  >
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-mono">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{item.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
