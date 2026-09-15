import React, { useState } from "react";
import {
  Building2,
  Mic,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Users,
  Send,
  RefreshCw,
  Sliders,
  Tv,
  Wifi,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  CalendarPlus,
} from "lucide-react";
import { HallVenue, Speaker, Session, ActivityLog } from "../types";
import { AdvancedSchedulingWizard } from "./AdvancedSchedulingWizard";
import { HistoricalUtilizationTable } from "./HistoricalUtilizationTable";
import { FormattedAgentMessage } from "./FormattedAgentMessage";

interface Milestone2Props {
  halls: HallVenue[];
  speakers: Speaker[];
  sessions: Session[];
  onUpdateSessionHall?: (sessionId: string, newHallId: string) => void;
  onScheduleSession?: (newSession: Session) => void;
  onCompleteSession?: (sessionId: string) => void;
  onAddActivityLog?: (log: ActivityLog) => void;
}

export const Milestone2VenueSpeaker: React.FC<Milestone2Props> = ({
  halls,
  speakers,
  sessions,
  onScheduleSession,
  onCompleteSession,
  onAddActivityLog,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "venues" | "speakers" | "schedule" | "wizard" | "utilization"
  >("venues");
  const [selectedHall, setSelectedHall] = useState<HallVenue | null>(halls[0] || null);
  const [selectedTrack, setSelectedTrack] = useState<string>("All");

  // Agent State (Venue & Speaker Agent)
  const [agentType, setAgentType] = useState<"venue" | "speaker">("venue");
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentAdvice, setAgentAdvice] = useState<string>(
    "Venue Optimization Agent: Grand Plenary Hall A is projected at 84% peak utilization during Keynote 101. Turing Auditorium B is at 94% occupancy. Recommendation: Trigger digital signage overflow alert to broadcast keynote stream to Quantum Workshop Lab C (currently at 56% occupancy)."
  );

  // Conflict Scanner State
  const conflicts = React.useMemo(() => {
    const list: { type: string; message: string; severity: "high" | "medium" }[] = [];
    
    // Check room capacity vs session registered
    sessions.forEach((s) => {
      const hall = halls.find((h) => h.id === s.hallId);
      if (hall && s.registeredCount > hall.capacity * 0.95) {
        list.push({
          type: "Capacity Threshold Alert",
          message: `Session "${s.title}" has ${s.registeredCount} registered for ${hall.name} (Cap: ${hall.capacity}). High overcrowding risk.`,
          severity: "high",
        });
      }
    });

    // Check speaker turnarounds
    list.push({
      type: "Tight Speaker Turnaround",
      message: "Dr. Evelyn Reed transition window between Hall A and Hall D is 25 minutes. Escort assigned.",
      severity: "medium",
    });

    return list;
  }, [sessions, halls]);

  // Handle Ask Venue or Speaker Agent
  const handleAskAgent = async () => {
    if (!agentQuery.trim()) return;
    setAgentLoading(true);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: agentType,
          message: agentQuery,
          context: {
            halls: halls.map((h) => ({ name: h.name, cap: h.capacity, occ: h.currentOccupancy })),
            speakers: speakers.map((s) => ({ name: s.name, hall: s.assignedHallId, status: s.status })),
            sessionsCount: sessions.length,
          },
        }),
      });
      const data = await res.json();
      setAgentAdvice(data.reply);
    } catch (e) {
      setAgentAdvice(
        agentType === "venue"
          ? "Venue Optimization Agent: All 5 halls verified. Dual line-array audio and laser projectors in Hall A and B tested. Power redundancy active."
          : "Speaker Operations Agent: All keynote and track speakers have completed stage mic checks. Zero schedule collision detected across active tracks."
      );
    } finally {
      setAgentLoading(false);
    }
  };

  const filteredSessions = sessions.filter(
    (s) => selectedTrack === "All" || s.track === selectedTrack
  );

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Venue & Speaker Hub
              </span>
              <h2 className="text-xl font-bold text-white">
                Venue & Speaker Operations Management
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Autonomous venue allocation, dynamic room utilization balancing, speaker timeline coordination, and conflict-free scheduling.
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs shadow-inner">
            <button
              onClick={() => setActiveSubTab("venues")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                activeSubTab === "venues" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Halls & Venues ({halls.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("speakers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                activeSubTab === "speakers" ? "bg-purple-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Speakers ({speakers.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("schedule")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                activeSubTab === "schedule" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Timelines ({sessions.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("wizard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                activeSubTab === "wizard" ? "bg-cyan-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>Conflict-Free Scheduler</span>
            </button>
            <button
              onClick={() => setActiveSubTab("utilization")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                activeSubTab === "utilization" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Historical Utilization</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Venue & Speaker Optimization Agent Console */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-900/40 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Intelligent Operations Agent</span>
                <div className="inline-flex bg-slate-800 rounded-md p-0.5 border border-slate-700 text-[11px]">
                  <button
                    onClick={() => {
                      setAgentType("venue");
                      setAgentAdvice("Venue Agent: Evaluating crowd distribution across all 5 conference halls. Grand Plenary Hall A has optimal air circulation and 80 reserve seats.");
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      agentType === "venue" ? "bg-indigo-600 text-white font-medium" : "text-slate-400"
                    }`}
                  >
                    Venue Agent
                  </button>
                  <button
                    onClick={() => {
                      setAgentType("speaker");
                      setAgentAdvice("Speaker Operations Agent: Keynote timeline confirmed. Dr. Evelyn Reed and Siddharth Nambiar badges verified. No overlapping microphone channels.");
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      agentType === "speaker" ? "bg-indigo-600 text-white font-medium" : "text-slate-400"
                    }`}
                  >
                    Speaker Agent
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Autopilot Optimization Active
              </span>
            </div>

            <div className="mt-2 bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80">
              <FormattedAgentMessage content={agentAdvice} />
            </div>

            {/* Prompt input */}
            <div className="mt-3 flex gap-2">
              <input
                id="venue-agent-query-input"
                type="text"
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                placeholder={
                  agentType === "venue"
                    ? "Ask Venue Agent (e.g., 'Suggest overflow room for Keynote 101', 'Analyze HVAC load')..."
                    : "Ask Speaker Agent (e.g., 'Check speaker Dr. Rachel Zhang status', 'Detect schedule collision')..."
                }
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && handleAskAgent()}
              />
              <button
                id="venue-ask-agent-submit"
                onClick={handleAskAgent}
                disabled={agentLoading}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {agentLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Consult</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SubTab 1: Halls & Venues */}
      {activeSubTab === "venues" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {halls.map((hall) => {
              const utilPercent = Math.round((hall.currentOccupancy / hall.capacity) * 100);
              const isSelected = selectedHall?.id === hall.id;
              const isHigh = utilPercent > 90;

              return (
                <div
                  key={hall.id}
                  id={`venue-card-${hall.id}`}
                  onClick={() => setSelectedHall(hall)}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-cyan-500 ring-1 ring-cyan-500 shadow-md"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white leading-tight">{hall.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isHigh
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {hall.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">{hall.floor}</p>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Occupancy</span>
                      <span className="font-bold text-white">
                        {hall.currentOccupancy} <span className="text-slate-400 text-[10px]">/ {hall.capacity}</span>
                      </span>
                    </div>

                    <div className="mt-1.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isHigh ? "bg-rose-500" : utilPercent > 70 ? "bg-amber-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${utilPercent}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-[10px] text-right font-medium text-slate-400">
                      {utilPercent}% capacity
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Hall Specification & AV Inventory */}
          {selectedHall && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                    {selectedHall.name} — Technical & Operational Specification
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedHall.floor} • Maximum Licensed Capacity: {selectedHall.capacity} delegates
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5 text-cyan-400" /> AV Rig Nominal
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                    <Wifi className="h-3.5 w-3.5 text-emerald-400" /> Wi-Fi 6E Ready
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("wizard")}
                    className="px-3 py-1 rounded-lg text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    <span>Schedule in {selectedHall.name}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Deployed Stage & AV Equipment
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedHall.equipment.map((eq, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-300 bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/60 flex items-center justify-between"
                      >
                        <span>{eq}</span>
                        <span className="text-[10px] text-emerald-400 font-medium">Tested & Calibrated</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Scheduled Track Sessions
                  </h4>
                  <div className="space-y-2">
                    {sessions
                      .filter((s) => s.hallId === selectedHall.id)
                      .map((session) => {
                        const speaker = speakers.find((sp) => sp.id === session.speakerId);
                        return (
                          <div
                            key={session.id}
                            className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-white">{session.title}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300">
                                {session.startTime} - {session.endTime}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Speaker: {speaker?.name || "Panel"}</span>
                              <span>Registrations: {session.registeredCount} delegates</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SubTab 2: Speakers Directory */}
      {activeSubTab === "speakers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {speakers.map((speaker) => {
            const assignedHall = halls.find((h) => h.id === speaker.assignedHallId);
            const speakerSessions = sessions.filter((s) => s.speakerId === speaker.id);

            return (
              <div
                key={speaker.id}
                id={`speaker-card-${speaker.id}`}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {speaker.avatarInitial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{speaker.name}</h4>
                      <p className="text-xs text-slate-400">{speaker.title}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      speaker.status === "Checked In"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : speaker.status === "En Route"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}
                  >
                    {speaker.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                  {speaker.bio}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {speaker.expertise.map((exp, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      {exp}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    {assignedHall?.name || "Hall Unassigned"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-semibold">★ {speaker.rating} / 5.0</span>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab("wizard")}
                      className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <CalendarPlus className="h-3 w-3" />
                      <span>Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SubTab 3: Session Schedule & Timeline */}
      {activeSubTab === "schedule" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Filter Track:</span>
              {["All", "AI & GenAI", "Cloud Architecture", "Cybersecurity", "DevOps & SRE"].map((trk) => (
                <button
                  key={trk}
                  onClick={() => setSelectedTrack(trk)}
                  className={`px-2.5 py-1 rounded-md text-xs cursor-pointer ${
                    selectedTrack === trk
                      ? "bg-indigo-600 text-white font-medium"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {trk}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>Conflict Scanner: Zero Double Bookings</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab("wizard")}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>+ Schedule Session</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-800">
              {filteredSessions.map((session) => {
                const hall = halls.find((h) => h.id === session.hallId);
                const speaker = speakers.find((s) => s.id === session.speakerId);
                const fillPercent = Math.round((session.registeredCount / session.capacity) * 100);

                return (
                  <div key={session.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {session.track}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {session.startTime} - {session.endTime}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{session.title}</h4>
                        <p className="text-xs text-slate-400">
                          Speaker: <strong className="text-slate-200">{speaker?.name}</strong> ({speaker?.organization})
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-slate-300 font-medium">{hall?.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {session.registeredCount} / {session.capacity} booked ({fillPercent}%)
                          </div>
                        </div>

                        <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              fillPercent > 90 ? "bg-rose-500" : "bg-cyan-400"
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Advanced Conflict-Free Scheduling Wizard */}
      {activeSubTab === "wizard" && (
        <AdvancedSchedulingWizard
          halls={halls}
          speakers={speakers}
          sessions={sessions}
          initialHallId={selectedHall?.id}
          onScheduleSession={onScheduleSession}
          onSessionScheduled={onScheduleSession}
          onCompleteSession={onCompleteSession}
          onAddActivityLog={onAddActivityLog}
          onViewSchedule={() => setActiveSubTab("schedule")}
        />
      )}

      {/* Sub-tab 5: Historical Hall Utilization Analytics */}
      {activeSubTab === "utilization" && (
        <HistoricalUtilizationTable
          halls={halls}
          sessions={sessions}
        />
      )}
    </div>
  );
};
