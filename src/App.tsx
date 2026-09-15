import React, { useState } from "react";
import { Header } from "./components/Header";
import { ExecutiveOverview } from "./components/ExecutiveOverview";
import { Milestone1Registration } from "./components/Milestone1Registration";
import { Milestone2VenueSpeaker } from "./components/Milestone2VenueSpeaker";
import { Milestone3SponsorIncident } from "./components/Milestone3SponsorIncident";
import { Milestone4DeploymentOrchestration } from "./components/Milestone4DeploymentOrchestration";
import { AgentChatDrawer } from "./components/AgentChatDrawer";
import { AlertsModal } from "./components/AlertsModal";
import {
  initialAttendees,
  initialHalls,
  initialSpeakers,
  initialSessions,
  initialSponsors,
  initialIncidents,
  initialAlerts,
  initialAgents,
  initialActivityLogs,
} from "./data/initialData";
import { MilestoneKey, Attendee, Incident, OperationalAlert, ActivityLog, Session, Sponsor } from "./types";
import { Bot, Sparkles } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<MilestoneKey>("overview");
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [halls, setHalls] = useState(initialHalls);
  const [speakers, setSpeakers] = useState(initialSpeakers);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(initialAlerts);
  const [agents, setAgents] = useState(initialAgents);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Sync initial attendees to backend
  React.useEffect(() => {
    fetch("/api/sync-attendees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendees: attendees.map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          phone: a.phone,
          company: a.company,
          role: a.role,
          ticketTier: a.ticketTier,
          entryPin: a.entryPin,
          checkedIn: a.checkedIn,
          checkInTime: a.checkInTime,
        })),
      }),
    }).catch(() => {});
  }, []);

  // Check-in toggle handler
  const handleToggleCheckIn = (attendeeId: string) => {
    setAttendees((prev) =>
      prev.map((att) => {
        if (att.id === attendeeId) {
          const newChecked = !att.checkedIn;
          return {
            ...att,
            checkedIn: newChecked,
            checkInTime: newChecked
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        }
        return att;
      })
    );
  };

  // Add new attendee handler
  const handleAddAttendee = (newAttendee: Attendee) => {
    setAttendees((prev) => [newAttendee, ...prev]);
  };

  // Activity Log Handler
  const handleAddActivityLog = (newLog: ActivityLog) => {
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Security Alert Trigger (from Gate terminal)
  const handleTriggerSecurityAlert = (message: string) => {
    const newAlert: OperationalAlert = {
      id: `ALT-SEC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      severity: "critical",
      message,
      category: "Registration",
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Schedule Session Handler
  const handleScheduleSession = (newSession: Session) => {
    setSessions((prev) => [...prev, newSession]);
  };

  // Complete Session Handler
  const handleCompleteSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return { ...s, status: "completed" as const };
        }
        return s;
      })
    );

    // Update Hall metrics
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      const addedAttendance = target.registeredCount || target.expectedAttendees || 120;
      setHalls((prev) =>
        prev.map((h) => {
          if (h.id === target.hallId) {
            const currentSessions = h.historicalSessionsCompleted || 2;
            const currentTotal = h.historicalTotalAttendance || Math.round(h.capacity * currentSessions * 0.85);
            return {
              ...h,
              historicalSessionsCompleted: currentSessions + 1,
              historicalTotalAttendance: currentTotal + addedAttendance,
            };
          }
          return h;
        })
      );
    }
  };

  // Incident handlers
  const handleAddIncident = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    // Also push a live operational alert
    const newAlert: OperationalAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      severity: newIncident.severity === "Critical" ? "critical" : "warning",
      message: `New Incident logged: ${newIncident.title} (${newIncident.location})`,
      category: "Incident",
      acknowledged: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Sponsor storage handler
  const handleAddSponsor = (newSponsor: Sponsor) => {
    setSponsors((prev) => [newSponsor, ...prev]);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const log: ActivityLog = {
      id: `ACT-${Date.now()}`,
      action_type: "SPONSOR",
      message: `SPONSOR: New partner ${newSponsor.name} onboarded under ${newSponsor.tier} tier ($${(newSponsor.contractValue / 1000).toFixed(0)}k). Booth: ${newSponsor.boothLocation}.`,
      timestamp: now,
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  const handleResolveIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: "Resolved" } : inc))
    );
  };

  const handleEscalateIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const nextLevel = inc.escalationLevel === "Level 1" ? "Level 2" : "Executive";
          return { ...inc, escalationLevel: nextLevel, severity: "High" };
        }
        return inc;
      })
    );
  };

  // Alert handlers
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((al) => (al.id === alertId ? { ...al, acknowledged: true } : al))
    );
  };

  const handleClearAllAlerts = () => {
    setAlerts((prev) => prev.map((al) => ({ ...al, acknowledged: true })));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        alerts={alerts}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === "overview" && (
          <ExecutiveOverview
            attendees={attendees}
            halls={halls}
            speakers={speakers}
            sponsors={sponsors}
            incidents={incidents}
            agents={agents}
            activityLogs={activityLogs}
            onSelectMilestone={setCurrentTab}
            onOpenChat={() => setIsChatOpen(true)}
          />
        )}

        {currentTab === "milestone1" && (
          <Milestone1Registration
            attendees={attendees}
            activityLogs={activityLogs}
            onToggleCheckIn={handleToggleCheckIn}
            onAddAttendee={handleAddAttendee}
            onAddActivityLog={handleAddActivityLog}
            onTriggerSecurityAlert={handleTriggerSecurityAlert}
          />
        )}

        {currentTab === "milestone2" && (
          <Milestone2VenueSpeaker
            halls={halls}
            speakers={speakers}
            sessions={sessions}
            onScheduleSession={handleScheduleSession}
            onCompleteSession={handleCompleteSession}
            onAddActivityLog={handleAddActivityLog}
          />
        )}

        {currentTab === "milestone3" && (
          <Milestone3SponsorIncident
            sponsors={sponsors}
            incidents={incidents}
            alerts={alerts}
            onAddIncident={handleAddIncident}
            onAddSponsor={handleAddSponsor}
            onResolveIncident={handleResolveIncident}
            onEscalateIncident={handleEscalateIncident}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}

        {currentTab === "milestone4" && (
          <Milestone4DeploymentOrchestration agents={agents} />
        )}
      </main>

      {/* Multi-Agent Chat Console Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Operational Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onClearAll={handleClearAllAlerts}
      />
    </div>
  );
}
