import React from "react";
import {
  Sparkles,
  Layers,
  Users,
  Building2,
  ShieldAlert,
  Server,
  Activity,
  Bot,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { MilestoneKey, OperationalAlert } from "../types";

interface HeaderProps {
  currentTab: MilestoneKey;
  setCurrentTab: (tab: MilestoneKey) => void;
  alerts: OperationalAlert[];
  onOpenChat: () => void;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  alerts,
  onOpenChat,
  onOpenAlerts,
}) => {
  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const navItems: { key: MilestoneKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "overview", label: "Executive Overview", icon: Layers },
    { key: "milestone1", label: "Registration & Gate Entry", icon: Users },
    { key: "milestone2", label: "Venue & Speaker Scheduling", icon: Building2 },
    { key: "milestone3", label: "Sponsorship & Incident Command", icon: ShieldAlert },
    { key: "milestone4", label: "System Health & Orchestration", icon: Server },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-inner">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  EventIntellect Enterprise
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  Enterprise System Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unified Autonomous Event Intelligence Platform • Global Tech Conclave
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Telemetry Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Engine Status: <strong className="text-emerald-400">Optimal</strong></span>
              <span className="text-slate-500">|</span>
              <span>6 Agents Live</span>
            </div>

            {/* Operational Alerts Trigger */}
            <button
              id="header-alerts-btn"
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              title="Operational Alerts"
            >
              <Bell className="h-4 w-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* AI Agent Console Button */}
            <button
              id="header-agent-chat-btn"
              onClick={onOpenChat}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Bot className="h-4 w-4 text-cyan-200" />
              <span>Multi-Agent Console</span>
            </button>
          </div>
        </div>

        {/* Milestone Navigation Tabs */}
        <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;

            // Custom vibrant active styles per milestone
            let activeColorClass = "bg-indigo-600/20 text-cyan-300 border-indigo-500/40 shadow-xs";
            let iconColorClass = "text-cyan-400";
            if (item.key === "milestone1") {
              activeColorClass = "bg-cyan-600/20 text-cyan-300 border-cyan-500/40 shadow-xs";
              iconColorClass = "text-cyan-400";
            } else if (item.key === "milestone2") {
              activeColorClass = "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-xs";
              iconColorClass = "text-emerald-400";
            } else if (item.key === "milestone3") {
              activeColorClass = "bg-rose-600/20 text-rose-300 border-rose-500/40 shadow-xs";
              iconColorClass = "text-rose-400";
            } else if (item.key === "milestone4") {
              activeColorClass = "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-xs";
              iconColorClass = "text-purple-400";
            }

            return (
              <button
                key={item.key}
                id={`nav-tab-${item.key}`}
                onClick={() => setCurrentTab(item.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? `${activeColorClass} border`
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? iconColorClass : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
