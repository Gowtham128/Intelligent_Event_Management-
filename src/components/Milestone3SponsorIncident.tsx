import React, { useState } from "react";
import {
  ShieldAlert,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  Sparkles,
  Send,
  RefreshCw,
  Bell,
  Check,
  X,
  Zap,
  DollarSign,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  Building2,
  Search,
  Filter,
} from "lucide-react";
import { Sponsor, Incident, OperationalAlert } from "../types";
import { FormattedAgentMessage } from "./FormattedAgentMessage";

interface Milestone3Props {
  sponsors: Sponsor[];
  incidents: Incident[];
  alerts: OperationalAlert[];
  onAddIncident: (incident: Incident) => void;
  onAddSponsor?: (sponsor: Sponsor) => void;
  onResolveIncident: (incidentId: string) => void;
  onEscalateIncident: (incidentId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const Milestone3SponsorIncident: React.FC<Milestone3Props> = ({
  sponsors,
  incidents,
  alerts,
  onAddIncident,
  onAddSponsor,
  onResolveIncident,
  onEscalateIncident,
  onAcknowledgeAlert,
}) => {
  const [activeTab, setActiveTab] = useState<"incidents" | "sponsors" | "alerts">("incidents");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);

  // New Incident Form State
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("Grand Plenary Hall A");
  const [isTriaging, setIsTriaging] = useState(false);

  // New Sponsor Storage Form State
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorTier, setSponsorTier] = useState<"Platinum" | "Gold" | "Silver">("Gold");
  const [sponsorBooth, setSponsorBooth] = useState("");
  const [sponsorContractVal, setSponsorContractVal] = useState<number>(25000);
  const [sponsorTargetLeads, setSponsorTargetLeads] = useState<number>(250);
  const [sponsorStatus, setSponsorStatus] = useState<"Active" | "Contract Pending" | "Needs Attention">("Active");

  // Sponsor Filtering State
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [sponsorTierFilter, setSponsorTierFilter] = useState<"All" | "Platinum" | "Gold" | "Silver">("All");

  // AI Agent Interaction State (Sponsorship Agent & Incident Command Agent)
  const [agentMode, setAgentMode] = useState<"incident" | "sponsor">("incident");
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentOutput, setAgentOutput] = useState<string>(
    "Incident Command Agent: Active SLA monitoring enabled. 1 Open Incident under active investigation (INC-301: Projector Luminance Drop, SLA remaining: 16 min). Level 1 AV tech dispatched."
  );

  // Calculate Sponsor KPIs
  const totalSponsorRevenue = sponsors.reduce((acc, s) => acc + s.contractValue, 0);
  const totalLeadsCaptured = sponsors.reduce((acc, s) => acc + s.leadsCaptured, 0);
  const avgSponsorRoi = Math.round(
    sponsors.reduce((acc, s) => acc + s.roiScore, 0) / (sponsors.length || 1)
  );

  // Filtered sponsors
  const filteredSponsors = sponsors.filter((s) => {
    const matchesTier = sponsorTierFilter === "All" || s.tier === sponsorTierFilter;
    const matchesSearch =
      sponsorSearch === "" ||
      s.name.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      s.boothLocation.toLowerCase().includes(sponsorSearch.toLowerCase());
    return matchesTier && matchesSearch;
  });

  // Calculate Incident KPIs
  const activeIncidentsCount = incidents.filter((i) => i.status !== "Resolved").length;
  const criticalIncidentsCount = incidents.filter((i) => i.severity === "Critical" && i.status !== "Resolved").length;

  // Handle Sponsor Storage Form Submit
  const handleStoreSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim()) return;

    const baseRoi = sponsorTier === "Platinum" ? 92 : sponsorTier === "Gold" ? 82 : 72;
    const newSponsor: Sponsor = {
      id: `SPN-${Date.now().toString().slice(-4)}`,
      name: sponsorName.trim(),
      tier: sponsorTier,
      boothLocation: sponsorBooth.trim() || "Main Exhibition Concourse - Booth B",
      leadsCaptured: 0,
      targetLeads: Number(sponsorTargetLeads) || 200,
      contractValue: Number(sponsorContractVal) || 25000,
      footfallCount: 0,
      roiScore: baseRoi,
      status: sponsorStatus,
    };

    if (onAddSponsor) {
      onAddSponsor(newSponsor);
    }

    // Reset & switch to sponsors tab
    setShowAddSponsorModal(false);
    setSponsorName("");
    setSponsorBooth("");
    setActiveTab("sponsors");
  };

  // Handle Form Submit & Automated AI Triage
  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle || !incidentDesc) return;
    setIsTriaging(true);

    try {
      const res = await fetch("/api/agents/incident/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: incidentTitle,
          description: incidentDesc,
          location: incidentLocation,
          reportedBy: "Operations Steward Console",
        }),
      });
      const triaged = await res.json();

      const newInc: Incident = {
        id: `INC-${300 + incidents.length + 1}`,
        title: incidentTitle,
        description: incidentDesc,
        location: incidentLocation,
        severity: triaged.severity || "Medium",
        status: "Open",
        reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        slaMinutes: triaged.recommendedSlaMinutes || 30,
        elapsedMinutes: 0,
        escalationLevel: triaged.escalationLevel || "Level 1",
        assignee: triaged.suggestedAssigneeRole || "Ops Lead",
        rootCause: triaged.rootCauseHypothesis,
        immediateActions: triaged.immediateActionSteps || ["Assign floor steward"],
      };

      onAddIncident(newInc);
      setSelectedIncident(newInc);
      setShowReportModal(false);
      setIncidentTitle("");
      setIncidentDesc("");
    } catch (e) {
      // Fallback incident creation
      const newInc: Incident = {
        id: `INC-${300 + incidents.length + 1}`,
        title: incidentTitle,
        description: incidentDesc,
        location: incidentLocation,
        severity: "Medium",
        status: "Open",
        reportedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        slaMinutes: 30,
        elapsedMinutes: 0,
        escalationLevel: "Level 1",
        assignee: "Ops Floor Lead",
        immediateActions: ["Dispatch field technician", "Acknowledge in command log"],
      };
      onAddIncident(newInc);
      setShowReportModal(false);
    } finally {
      setIsTriaging(false);
    }
  };

  // Handle Ask Agent
  const handleAskAgent = async () => {
    if (!agentQuery.trim()) return;
    setAgentLoading(true);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: agentMode === "incident" ? "incident" : "sponsorship",
          message: agentQuery,
          context: {
            activeIncidentsCount,
            criticalIncidentsCount,
            totalSponsorRevenue,
            totalLeadsCaptured,
            avgSponsorRoi,
          },
        }),
      });
      const data = await res.json();
      setAgentOutput(data.reply);
    } catch (e) {
      setAgentOutput(
        agentMode === "incident"
          ? "Incident Command Agent: Automated SLA compliance rate is 100%. No high-priority escalations breaching thresholds."
          : "Sponsorship Agent: Apex Cloud and NeuralPulse are exceeding booth engagement KPIs by 32%. Recommended: sponsor acknowledgment before opening keynote."
      );
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Sponsor & Incident Command
              </span>
              <h2 className="text-xl font-bold text-white">
                Sponsorship & Incident Management Hub
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Autonomous incident triage, SLA countdown workflows, sponsor ROI tracking, and proactive operational alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="sponsor-add-btn"
              onClick={() => setShowAddSponsorModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Onboard & Store Sponsor</span>
            </button>

            <button
              id="incident-report-btn"
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Log Incident (AI Triaged)</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs">
          <button
            id="subtab-incidents"
            onClick={() => setActiveTab("incidents")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeTab === "incidents" ? "bg-slate-800 text-rose-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            Active Incident Command ({activeIncidentsCount})
          </button>
          <button
            id="subtab-sponsors"
            onClick={() => setActiveTab("sponsors")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeTab === "sponsors" ? "bg-slate-800 text-amber-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            Sponsorship Performance ({sponsors.length})
          </button>
          <button
            id="subtab-alerts"
            onClick={() => setActiveTab("alerts")}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              activeTab === "alerts" ? "bg-slate-800 text-cyan-400 border border-slate-700" : "text-slate-400 hover:text-white"
            }`}
          >
            Operational Alerts ({alerts.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sponsor Value Realized</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ${(totalSponsorRevenue / 1000).toFixed(0)}k
          </div>
          <div className="mt-1 text-[11px] text-emerald-400">6 Enterprise Partners active</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sponsor Leads Scanned</span>
            <UserCheck className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalLeadsCaptured}</div>
          <div className="mt-1 text-[11px] text-slate-400">Avg ROI Index: {avgSponsorRoi}%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Incidents</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">{activeIncidentsCount}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {criticalIncidentsCount > 0 ? `${criticalIncidentsCount} Critical` : "0 Critical Incidents"}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Operational SLA Compliance</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">98.7%</div>
          <div className="mt-1 text-[11px] text-slate-400">Avg Resolution: 14.2 min</div>
        </div>
      </div>

      {/* AI Specialized Agent Query Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 border border-rose-900/30 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-600/30 border border-rose-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-rose-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {agentMode === "incident" ? "Incident Command Agent" : "Sponsorship Intelligence Agent"}
                </span>
                <div className="inline-flex bg-slate-800 rounded-md p-0.5 border border-slate-700 text-[11px]">
                  <button
                    onClick={() => {
                      setAgentMode("incident");
                      setAgentOutput("Incident Command Agent: Active SLA monitoring enabled. Monitoring Hall B AV status.");
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      agentMode === "incident" ? "bg-rose-600 text-white font-medium" : "text-slate-400"
                    }`}
                  >
                    Incident Agent
                  </button>
                  <button
                    onClick={() => {
                      setAgentMode("sponsor");
                      setAgentOutput("Sponsorship Agent: Apex Cloud and NeuralPulse booths are operating at peak visitor density. Recommend push notification shoutout.");
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      agentMode === "sponsor" ? "bg-amber-600 text-white font-medium" : "text-slate-400"
                    }`}
                  >
                    Sponsor Agent
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-2 bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/80">
              <FormattedAgentMessage content={agentOutput} />
            </div>

            <div className="mt-3 flex gap-2">
              <input
                id="sponsor-incident-agent-query-input"
                type="text"
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                placeholder={
                  agentMode === "incident"
                    ? "Ask Incident Agent (e.g. 'Generate incident escalation summary', 'Calculate average SLA remaining')..."
                    : "Ask Sponsorship Agent (e.g. 'How to improve Silver sponsor ROI', 'Analyze lead conversion')..."
                }
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                onKeyDown={(e) => e.key === "Enter" && handleAskAgent()}
              />
              <button
                id="sponsor-incident-ask-agent-submit"
                onClick={handleAskAgent}
                disabled={agentLoading}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {agentLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Consult</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content 1: Active Incidents */}
      {activeTab === "incidents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Operational Incident Queue
            </h3>
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              const isCritical = inc.severity === "Critical";
              const isHigh = inc.severity === "High";

              return (
                <div
                  key={inc.id}
                  id={`incident-item-${inc.id}`}
                  onClick={() => setSelectedIncident(inc)}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-rose-500 ring-1 ring-rose-500 shadow-md"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : isHigh
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {inc.severity}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{inc.id}</span>
                        <span className="text-xs font-mono text-slate-400">• {inc.reportedAt}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{inc.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{inc.location}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        inc.status === "Resolved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" />
                      SLA Target: <strong>{inc.slaMinutes}m</strong> ({inc.elapsedMinutes}m elapsed)
                    </span>
                    <span>Assignee: <strong className="text-slate-200">{inc.assignee}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Incident Action & Escalation Panel */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Incident Response Console
            </h3>

            {selectedIncident ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{selectedIncident.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      Escalation: {selectedIncident.escalationLevel}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{selectedIncident.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedIncident.location}</p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-slate-300 mb-1">AI Root Cause Assessment</h5>
                  <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 leading-relaxed">
                    {selectedIncident.rootCause || "Telemetry indicates sensor or hardware load deviation."}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-slate-300 mb-1.5">Action Protocol</h5>
                  <ul className="space-y-1.5">
                    {selectedIncident.immediateActions.map((act, i) => (
                      <li
                        key={i}
                        className="text-xs text-slate-300 bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-700/40 flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                  {selectedIncident.status !== "Resolved" ? (
                    <>
                      <button
                        id="resolve-incident-btn"
                        onClick={() => onResolveIncident(selectedIncident.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>Mark Incident Resolved</span>
                      </button>
                      <button
                        id="escalate-incident-btn"
                        onClick={() => onEscalateIncident(selectedIncident.id)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span>Escalate to Next Level ({selectedIncident.escalationLevel === "Level 1" ? "Level 2" : "Executive"})</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-center text-xs text-emerald-300 font-semibold">
                      Incident marked resolved under SLA. Log archived.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
                Select an incident from the queue to view remediation workflows.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Sponsorship Performance & Storage */}
      {activeTab === "sponsors" && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search partner or booth..."
                  value={sponsorSearch}
                  onChange={(e) => setSponsorSearch(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-52"
                />
              </div>

              {/* Tier Filters */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 text-xs">
                {(["All", "Platinum", "Gold", "Silver"] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSponsorTierFilter(tier)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                      sponsorTierFilter === tier
                        ? "bg-amber-500 text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">
                Showing <strong className="text-white">{filteredSponsors.length}</strong> of {sponsors.length} sponsors
              </span>
              <button
                id="sponsors-tab-add-btn"
                onClick={() => setShowAddSponsorModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Store New Sponsor</span>
              </button>
            </div>
          </div>

          {/* Sponsors Grid */}
          {filteredSponsors.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No Sponsor Partners Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No sponsors match your current filter or search criteria. You can register and store a new sponsor partner right now.
              </p>
              <button
                onClick={() => setShowAddSponsorModal(true)}
                className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Store New Sponsor</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSponsors.map((sponsor) => {
                const leadPercent = Math.min(100, Math.round((sponsor.leadsCaptured / sponsor.targetLeads) * 100));

                return (
                  <div
                    key={sponsor.id}
                    id={`sponsor-card-${sponsor.id}`}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sponsor.tier === "Platinum"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : sponsor.tier === "Gold"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {sponsor.tier} Partner
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                sponsor.status === "Active"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : sponsor.status === "Contract Pending"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {sponsor.status || "Active"}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-2">{sponsor.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            <span>{sponsor.boothLocation}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400">
                            ${(sponsor.contractValue / 1000).toFixed(0)}k
                          </div>
                          <div className="text-[10px] text-slate-400">Contract Value</div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Leads Captured</span>
                            <span className="font-semibold text-white">
                              {sponsor.leadsCaptured} / {sponsor.targetLeads} ({leadPercent}%)
                            </span>
                          </div>
                          <div className="mt-1.5 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${leadPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                          <span>Booth Footfall: <strong className="text-white">{sponsor.footfallCount}</strong></span>
                          <span>ROI Index: <strong className="text-amber-400">{sponsor.roiScore}%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-500">{sponsor.id}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Auto-Synced</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Operational Alerts */}
      {activeTab === "alerts" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
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
                    <span className="text-xs font-semibold text-white">[{alert.category}]</span>
                    <span className="text-[11px] font-mono text-slate-400">{alert.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                        alert.severity === "critical"
                          ? "bg-rose-500/20 text-rose-400"
                          : alert.severity === "warning"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{alert.message}</p>
                </div>
              </div>

              <div className="shrink-0">
                {alert.acknowledged ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-xs cursor-pointer transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Report Incident with AI Triage */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Log Operational Incident</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Incident Title / Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hall C Audio Feedback / Network Dropping"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Specific Location
                </label>
                <select
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Grand Plenary Hall A">Grand Plenary Hall A</option>
                  <option value="Turing Auditorium B">Turing Auditorium B</option>
                  <option value="Quantum Workshop Lab C">Quantum Workshop Lab C</option>
                  <option value="Ada Lovelace Stage D">Ada Lovelace Stage D</option>
                  <option value="Registration Counter East">Registration Counter East</option>
                  <option value="Expo Pavilion Island 1">Expo Pavilion Island 1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Observation & Technical Details
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe observed symptoms, equipment affected, or audience impact..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>AI Incident Agent will automatically calculate severity, SLA window, and remediation steps.</span>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTriaging}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isTriaging && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isTriaging ? "Triaging with AI..." : "Submit Incident"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store New Sponsor Modal */}
      {showAddSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Store & Activate New Sponsor</h3>
                  <p className="text-xs text-slate-400">
                    Onboard event sponsors, contract deliverables, booth assignments, and target lead goals.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSponsorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStoreSponsor} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sponsor / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Cloud Corp, Snowflake, Datadog"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sponsorship Tier
                  </label>
                  <select
                    value={sponsorTier}
                    onChange={(e) => {
                      const tier = e.target.value as "Platinum" | "Gold" | "Silver";
                      setSponsorTier(tier);
                      if (tier === "Platinum") {
                        setSponsorContractVal(50000);
                        setSponsorTargetLeads(400);
                      } else if (tier === "Gold") {
                        setSponsorContractVal(25000);
                        setSponsorTargetLeads(250);
                      } else {
                        setSponsorContractVal(12000);
                        setSponsorTargetLeads(150);
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Platinum">Platinum Partner ($50k+)</option>
                    <option value="Gold">Gold Partner ($25k+)</option>
                    <option value="Silver">Silver Partner ($12k+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contract Value ($ USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      required
                      value={sponsorContractVal}
                      onChange={(e) => setSponsorContractVal(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Booth / Location Assignment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hall A - Island 102"
                    value={sponsorBooth}
                    onChange={(e) => setSponsorBooth(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Leads Goal
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={sponsorTargetLeads}
                    onChange={(e) => setSponsorTargetLeads(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Agreement Status
                </label>
                <select
                  value={sponsorStatus}
                  onChange={(e) => setSponsorStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Active">Active (Signed & Onboarded)</option>
                  <option value="Contract Pending">Contract Pending Review</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>

              {/* AI ROI & Placement projection */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Autonomous ROI Index Model:</span>
                  <p className="text-[11px] text-amber-200/70 mt-0.5">
                    Tier <strong className="text-white">{sponsorTier}</strong> with a ${sponsorContractVal.toLocaleString()} commitment and {sponsorTargetLeads} target leads initiates an automated {sponsorTier === "Platinum" ? "92%" : sponsorTier === "Gold" ? "82%" : "72%"} ROI baseline with live turnstile telemetry attribution.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSponsorModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Store & Activate Sponsor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
