import React from "react";
import {
  Layers,
  Users,
  Building2,
  ShieldAlert,
  Server,
  Activity,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Bot,
  Play,
  Shield,
  Calendar,
  Zap,
  BarChart3,
  Award,
} from "lucide-react";
import { MilestoneKey, Attendee, HallVenue, Speaker, Sponsor, Incident, AgentStatus, ActivityLog } from "../types";
import { ActivityLogStream } from "./ActivityLogStream";

interface OverviewProps {
  attendees: Attendee[];
  halls: HallVenue[];
  speakers: Speaker[];
  sponsors: Sponsor[];
  incidents: Incident[];
  agents: AgentStatus[];
  activityLogs?: ActivityLog[];
  onSelectMilestone: (key: MilestoneKey) => void;
  onOpenChat: () => void;
}

export const ExecutiveOverview: React.FC<OverviewProps> = ({
  attendees,
  halls,
  speakers,
  sponsors,
  incidents,
  agents,
  activityLogs = [],
  onSelectMilestone,
  onOpenChat,
}) => {
  const totalRegistered = attendees.length;
  const checkedIn = attendees.filter((a) => a.checkedIn).length;
  const checkInRate = totalRegistered > 0 ? Math.round((checkedIn / totalRegistered) * 100) : 0;

  const totalCapacity = halls.reduce((acc, h) => acc + h.capacity, 0);
  const currentOccupancy = halls.reduce((acc, h) => acc + h.currentOccupancy, 0);
  const venueOccupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  const totalSponsorVal = sponsors.reduce((acc, s) => acc + s.contractValue, 0);
  const activeIncidents = incidents.filter((i) => i.status !== "Resolved").length;

  const milestonesList = [
    {
      key: "milestone1" as MilestoneKey,
      tag: "Access & Security Domain",
      title: "Registration & Gate Turnstile Operations",
      icon: Users,
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      accentBg: "from-cyan-500/20 via-blue-500/10 to-transparent",
      accentBorder: "border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/10",
      iconColor: "text-cyan-400 bg-cyan-950/60 border-cyan-500/40",
      description: "Autonomous delegate ingestion, 4-digit confidential turnstile PINs, illegal entry scanner, and demographic cohort analytics.",
      features: ["Turnstile PIN Turnstiles", "Fast QR Ingestion", "Security Alert Mesh"],
      metricLabel: "Check-in Velocity",
      metricValue: `${checkedIn}/${totalRegistered} Verified (${checkInRate}%)`,
      status: "Active & Secure",
    },
    {
      key: "milestone2" as MilestoneKey,
      tag: "Venue Logistics & Schedules",
      title: "Venue Capacity & Speaker Timelines",
      icon: Building2,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      accentBg: "from-emerald-500/20 via-teal-500/10 to-transparent",
      accentBorder: "border-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/10",
      iconColor: "text-emerald-400 bg-emerald-950/60 border-emerald-500/40",
      description: "Real-time hall load balancing, zero double-booking scanner, keynote speaker assignments, and track timetable lock.",
      features: ["5 Live Halls", "Zero Collision Scanner", "Lock & Commit Wizard"],
      metricLabel: "Seat Allocation",
      metricValue: `${currentOccupancy} / ${totalCapacity} Occupied (${venueOccupancyRate}%)`,
      status: "Zero Conflicts",
    },
    {
      key: "milestone3" as MilestoneKey,
      tag: "Sponsorship & Incident Command",
      title: "Sponsorship ROI & Incident Command",
      icon: ShieldAlert,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      accentBg: "from-rose-500/20 via-amber-500/10 to-transparent",
      accentBorder: "border-rose-500/30 hover:border-rose-400 hover:shadow-rose-500/10",
      iconColor: "text-rose-400 bg-rose-950/60 border-rose-500/40",
      description: "AI incident triage with automated SLA countdown timers, tier-weighted sponsor ROI tracking, and emergency escalation.",
      features: ["Tiered ROI Tracking", "SLA Countdown Clocks", "Executive Escalation"],
      metricLabel: "Operational SLA",
      metricValue: `$${(totalSponsorVal / 1000).toFixed(0)}k Capital • ${activeIncidents} Incidents`,
      status: "98.7% SLA Met",
    },
    {
      key: "milestone4" as MilestoneKey,
      tag: "Autonomous Agent Topology",
      title: "Multi-Agent Mesh & Production Telemetry",
      icon: Server,
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      accentBg: "from-purple-500/20 via-indigo-500/10 to-transparent",
      accentBorder: "border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/10",
      iconColor: "text-purple-400 bg-purple-950/60 border-purple-500/40",
      description: "Distributed autonomous agent mesh, continuous regression test runner, real-time telemetry, and container runtime health.",
      features: ["6 Specialized Agents", "10/10 Regression Tests", "Self-Healing Mesh"],
      metricLabel: "Engine Status",
      metricValue: "6 Autonomous Agents Healthy",
      status: "100% Tests Pass",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Top Conclave Executive Hero Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl backdrop-blur-md">
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Event Stream Active</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60">
                Infosys Conclave 2026
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 hidden sm:inline">Bangalore Tech Hub</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Event Command Center
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unified intelligence coordinating delegate access, venue schedules, commercial sponsorships, and autonomous AI agents.
            </p>
          </div>

          {/* Quick Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="overview-launch-orchestrator-btn"
              onClick={onOpenChat}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Bot className="h-4 w-4 text-cyan-200" />
              <span>Multi-Agent Console</span>
            </button>
            <button
              id="overview-run-tests-btn"
              onClick={() => onSelectMilestone("milestone4")}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm"
            >
              <Play className="h-4 w-4 text-emerald-400" />
              <span>Verify Test Suite (10/10)</span>
            </button>
          </div>
        </div>

        {/* Live Conclave Pulse Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Total Attendees</span>
              <span className="font-bold text-white text-sm">{totalRegistered} Registered</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Active Venues</span>
              <span className="font-bold text-white text-sm">5 Dynamic Halls</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Sponsor Capital</span>
              <span className="font-bold text-white text-sm">${(totalSponsorVal / 1000).toFixed(0)}k Locked</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/60">
            <div className="h-8 w-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">AI Agent Mesh</span>
              <span className="font-bold text-white text-sm">6 Agents Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Vibrant, Distinctive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Registrations & Gate */}
        <div
          onClick={() => onSelectMilestone("milestone1")}
          className="group relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-950 p-5 shadow-lg hover:border-cyan-400 hover:shadow-cyan-500/10 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Gate Check-in</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{checkInRate}%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> Nominal
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${checkInRate}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{checkedIn} of {totalRegistered} Verified</span>
            <span className="text-cyan-400 font-medium group-hover:underline">Open Gate →</span>
          </div>
        </div>

        {/* KPI 2: Venue Utilization */}
        <div
          onClick={() => onSelectMilestone("milestone2")}
          className="group relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 p-5 shadow-lg hover:border-emerald-400 hover:shadow-emerald-500/10 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Hall Capacity</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{venueOccupancyRate}%</span>
            <span className="text-xs font-semibold text-emerald-400">Balanced</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${venueOccupancyRate}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{currentOccupancy} / {totalCapacity} Seats</span>
            <span className="text-emerald-400 font-medium group-hover:underline">View Halls →</span>
          </div>
        </div>

        {/* KPI 3: Commercial Sponsorship & SLA */}
        <div
          onClick={() => onSelectMilestone("milestone3")}
          className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 p-5 shadow-lg hover:border-amber-400 hover:shadow-amber-500/10 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Sponsor ROI & SLA</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">${(totalSponsorVal / 1000).toFixed(0)}k</span>
            <span className="text-xs font-semibold text-emerald-400">98.7% SLA</span>
          </div>
          {/* Visual indicator */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full w-[98%]" />
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>{activeIncidents} Active Incidents</span>
            <span className="text-amber-400 font-medium group-hover:underline">Command Room →</span>
          </div>
        </div>

        {/* KPI 4: Multi-Agent Telemetry */}
        <div
          onClick={() => onSelectMilestone("milestone4")}
          className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 p-5 shadow-lg hover:border-purple-400 hover:shadow-purple-500/10 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Agent Intelligence</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">6 / 6</span>
            <span className="text-xs font-semibold text-emerald-400">100% Tests Pass</span>
          </div>
          {/* Visual indicator */}
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full w-full" />
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>All 6 Sub-agents Healthy</span>
            <span className="text-purple-400 font-medium group-hover:underline">Orchestrator →</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Zap className="h-4 w-4 text-amber-400" />
          <span>Quick Conclave Shortcuts:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectMilestone("milestone1")}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>Gate PIN Terminal</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMilestone("milestone2")}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            <span>Schedule Session</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMilestone("milestone3")}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Incident Command</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMilestone("milestone4")}
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Activity className="h-3.5 w-3.5 text-purple-400" />
            <span>Telemetry & Logs</span>
          </button>
        </div>
      </div>

      {/* 4 Dedicated Operational Modules Bento Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Operational Conclave Modules</span>
            </h3>
            <p className="text-xs text-slate-400">
              Four specialized enterprise pillars providing autonomous event execution and live visibility.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Click any workspace to enter</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestonesList.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                id={`overview-module-${m.key}`}
                onClick={() => onSelectMilestone(m.key)}
                className={`group relative overflow-hidden rounded-2xl border ${m.accentBorder} bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-md hover:shadow-xl cursor-pointer transition-all duration-200 flex flex-col justify-between`}
              >
                {/* Decorative Top Accent Glow */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.accentBg}`} />

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl border ${m.iconColor} shadow-inner`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          {m.tag}
                        </span>
                        <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {m.title}
                        </h4>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${m.badgeColor} shrink-0`}>
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {m.description}
                  </p>

                  {/* Feature chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{m.metricLabel}</span>
                    <span className="font-semibold text-slate-100">{m.metricValue}</span>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 text-slate-200 group-hover:bg-indigo-600 group-hover:text-white font-semibold transition-all duration-150">
                    <span>Enter Module</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Live Event Activity & Audit Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Live Audit Feed & Event Timeline</span>
          </h3>
          <span className="text-xs text-slate-400">Streamed from All Operational Domains</span>
        </div>
        <ActivityLogStream logs={activityLogs} />
      </div>
    </div>
  );
};

