import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Delete,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  User,
  Clock,
  History,
  Sparkles,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { Attendee, ActivityLog } from "../types";

interface GateSecurityTerminalProps {
  attendees: Attendee[];
  activityLogs: ActivityLog[];
  onCheckInAttendee: (attendeeId: string) => void;
  onAddActivityLog: (log: ActivityLog) => void;
  onTriggerSecurityAlert?: (message: string) => void;
  onOpenTicketLookup: () => void;
  selectedPin?: string;
}

export const GateSecurityTerminal: React.FC<GateSecurityTerminalProps> = ({
  attendees,
  activityLogs,
  onCheckInAttendee,
  onAddActivityLog,
  onTriggerSecurityAlert,
  onOpenTicketLookup,
  selectedPin = "",
}) => {
  const [pin, setPin] = useState(selectedPin);
  const [activeGate, setActiveGate] = useState<string>("Gate 1 - North Concourse");
  const [verificationResult, setVerificationResult] = useState<{
    status: "IDLE" | "SUCCESS" | "ALREADY_CHECKED_IN" | "DENIED";
    message: string;
    attendee?: Attendee;
    timestamp?: string;
  }>({
    status: "IDLE",
    message: "Enter 4-digit security PIN to grant gate access.",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync selectedPin prop if updated externally (e.g. from Ticket Lookup)
  React.useEffect(() => {
    if (selectedPin) {
      setPin(selectedPin);
    }
  }, [selectedPin]);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
    setVerificationResult({
      status: "IDLE",
      message: "Enter 4-digit security PIN to grant gate access.",
    });
  };

  const handleVerify = async (pinToVerify?: string) => {
    const targetPin = (pinToVerify || pin).trim();
    if (!targetPin) return;

    setIsVerifying(true);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. First check against the live attendees list (includes pre-seeded & newly registered attendees)
    const localAttendee = attendees.find(
      (a) => a.entryPin?.toString().trim() === targetPin
    );

    if (localAttendee) {
      if (localAttendee.checkedIn) {
        // DOUBLE ENTRY WARNING
        setVerificationResult({
          status: "ALREADY_CHECKED_IN",
          message: `Double entry attempt: ${localAttendee.name} was already verified at ${localAttendee.checkInTime || "earlier"}.`,
          attendee: localAttendee,
          timestamp: now,
        });

        const log: ActivityLog = {
          id: `ACT-${Date.now()}`,
          action_type: "WARNING",
          message: `WARNING: Double entry attempt by ${localAttendee.name} with PIN [${targetPin}] at ${activeGate}.`,
          timestamp: now,
        };
        onAddActivityLog(log);

        // Notify server asynchronously in background
        fetch(`/api/verify-pin/${encodeURIComponent(targetPin)}`).catch(() => {});
      } else {
        // SUCCESSFUL CHECK-IN
        onCheckInAttendee(localAttendee.id);

        const checkedInAttendee: Attendee = {
          ...localAttendee,
          checkedIn: true,
          checkInTime: now,
        };

        setVerificationResult({
          status: "SUCCESS",
          message: `ENTRY: ${localAttendee.name} securely verified. Gate turnstile unlocked.`,
          attendee: checkedInAttendee,
          timestamp: now,
        });

        const log: ActivityLog = {
          id: `ACT-${Date.now()}`,
          action_type: "ENTRY",
          message: `ENTRY: ${localAttendee.name} verified with PIN [${targetPin}] at ${activeGate}.`,
          timestamp: now,
        };
        onAddActivityLog(log);

        // Notify server asynchronously in background
        fetch(`/api/verify-pin/${encodeURIComponent(targetPin)}`).catch(() => {});
      }
      setIsVerifying(false);
      return;
    }

    // 2. Fallback: Query backend API in case attendee is stored on the server
    try {
      const res = await fetch(`/api/verify-pin/${encodeURIComponent(targetPin)}`);
      const data = await res.json();

      if (res.ok && data.status === "SUCCESS") {
        const att = data.attendee;
        if (att) {
          onCheckInAttendee(att.id);
        }
        setVerificationResult({
          status: "SUCCESS",
          message: data.message || `ENTRY: ${att?.name || "Delegate"} securely verified. Gate turnstile unlocked.`,
          attendee: att,
          timestamp: now,
        });
        onAddActivityLog({
          id: `ACT-${Date.now()}`,
          action_type: "ENTRY",
          message: `ENTRY: ${att?.name || "Delegate"} verified with PIN [${targetPin}] at ${activeGate}.`,
          timestamp: now,
        });
        setIsVerifying(false);
        return;
      } else if (res.ok && data.status === "ALREADY_CHECKED_IN") {
        const att = data.attendee;
        setVerificationResult({
          status: "ALREADY_CHECKED_IN",
          message: data.message || `Double entry attempt: ${att?.name} was already verified earlier.`,
          attendee: att,
          timestamp: now,
        });
        onAddActivityLog({
          id: `ACT-${Date.now()}`,
          action_type: "WARNING",
          message: `WARNING: Double entry attempt with PIN [${targetPin}] at ${activeGate}.`,
          timestamp: now,
        });
        setIsVerifying(false);
        return;
      }
    } catch (err) {
      console.warn("Backend PIN verification query failed:", err);
    }

    // 3. Neither local attendees nor backend has this PIN -> Truly Invalid PIN
    setVerificationResult({
      status: "DENIED",
      message: `Security Alert: Failed entry attempt with invalid PIN '${targetPin}'. Access Denied.`,
      timestamp: now,
    });

    const log: ActivityLog = {
      id: `ACT-${Date.now()}`,
      action_type: "ILLEGAL_ENTRY",
      message: `ILLEGAL_ENTRY: Security Alert: Failed entry attempt with invalid PIN '${targetPin}' at ${activeGate}.`,
      timestamp: now,
    };
    onAddActivityLog(log);

    if (onTriggerSecurityAlert) {
      onTriggerSecurityAlert(`Security Incident at ${activeGate}: Unauthorized gate entry attempt with invalid PIN '${targetPin}'`);
    }

    setIsVerifying(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
      {/* Terminal Title & Gate Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xs">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Gate Entry & PIN Verification Terminal
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE TERMINAL
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              High-throughput turnstile credential verification, double-entry prevention, and illegal entry security audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeGate}
            onChange={(e) => setActiveGate(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-cyan-500"
          >
            <option value="Gate 1 - North Concourse">Gate 1 - North Concourse</option>
            <option value="Gate 2 - VIP SkyBridge">Gate 2 - VIP SkyBridge</option>
            <option value="Gate 3 - Exhibition East">Gate 3 - Exhibition East</option>
            <option value="Gate 4 - Workshop Labs">Gate 4 - Workshop Labs</option>
          </select>

          <button
            onClick={onOpenTicketLookup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-blue-400" />
            <span>Lookup PIN</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Keypad and PIN Input */}
        <div className="lg:col-span-6 space-y-4">
          {/* PIN Display Screen */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-[11px] text-slate-500 uppercase tracking-widest font-mono mb-1">
              SECURITY ACCESS CODE
            </div>
            <div className="flex items-center justify-center gap-3 my-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-12 w-12 rounded-xl border flex items-center justify-center text-2xl font-mono font-bold transition-all ${
                    pin[index]
                      ? "border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-500/20"
                      : "border-slate-800 bg-slate-900/60 text-slate-600"
                  }`}
                >
                  {pin[index] ? "•" : ""}
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {pin ? `Input: ${pin}` : "Ready for PIN input"}
            </div>
          </div>

          {/* Quick Manual Typing Input */}
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Or type PIN directly..."
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-center font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
            <button
              onClick={() => handleVerify()}
              disabled={isVerifying || !pin}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              {isVerifying ? "Verifying..." : "Verify PIN"}
            </button>
          </div>

          {/* Numeric Touch Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num.toString())}
                className="h-11 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-mono font-semibold text-lg rounded-xl border border-slate-700/60 transition-colors active:scale-95 cursor-pointer shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-11 bg-slate-800/50 hover:bg-red-950/50 hover:text-red-300 text-slate-400 font-semibold text-xs rounded-xl border border-slate-700/60 transition-colors active:scale-95 cursor-pointer"
            >
              CLR
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress("0")}
              className="h-11 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-mono font-semibold text-lg rounded-xl border border-slate-700/60 transition-colors active:scale-95 cursor-pointer shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 bg-slate-800/50 hover:bg-slate-700 text-slate-300 flex items-center justify-center rounded-xl border border-slate-700/60 transition-colors active:scale-95 cursor-pointer"
            >
              <Delete className="h-4 w-4" />
            </button>
          </div>

          {/* Security Protocol & Admin Simulation */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">Admin Gate Verification Protocol</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Delegates hold their confidential 4-digit PIN in their private registration pass. Request the PIN from the attendee in person and input it via the keypad or numeric entry to confirm presence and unlock turnstile.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  const pending = attendees.find((a) => !a.checkedIn);
                  if (pending && pending.entryPin) {
                    setPin(pending.entryPin);
                    handleVerify(pending.entryPin);
                  } else {
                    setPin("6810");
                    handleVerify("6810");
                  }
                }}
                className="px-2.5 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 rounded-lg cursor-pointer transition-colors text-[11px] font-medium"
              >
                Test Valid Delegate Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  const checked = attendees.find((a) => a.checkedIn);
                  if (checked && checked.entryPin) {
                    setPin(checked.entryPin);
                    handleVerify(checked.entryPin);
                  } else {
                    setPin("4829");
                    handleVerify("4829");
                  }
                }}
                className="px-2.5 py-1.5 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 rounded-lg cursor-pointer transition-colors text-[11px] font-medium"
              >
                Test Duplicate (Double Entry)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPin("9999");
                  handleVerify("9999");
                }}
                className="px-2.5 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 rounded-lg cursor-pointer transition-colors text-[11px] font-medium"
              >
                Test Invalid PIN (Breach Alert)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Verification Feedback & Live Gate Audit */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* Verification Status Card */}
          <div
            className={`rounded-xl border p-5 transition-all duration-300 ${
              verificationResult.status === "SUCCESS"
                ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-200"
                : verificationResult.status === "ALREADY_CHECKED_IN"
                ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                : verificationResult.status === "DENIED"
                ? "bg-red-950/40 border-red-500/60 text-red-200"
                : "bg-slate-950 border-slate-800 text-slate-300"
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="shrink-0 mt-0.5">
                {verificationResult.status === "SUCCESS" && (
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                )}
                {verificationResult.status === "ALREADY_CHECKED_IN" && (
                  <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                )}
                {verificationResult.status === "DENIED" && (
                  <div className="h-10 w-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 animate-bounce">
                    <XCircle className="h-6 w-6" />
                  </div>
                )}
                {verificationResult.status === "IDLE" && (
                  <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {verificationResult.status === "SUCCESS" && "Access Granted - Turnstile Open"}
                    {verificationResult.status === "ALREADY_CHECKED_IN" && "Warning: Double Entry Detected"}
                    {verificationResult.status === "DENIED" && "Illegal Entry: Security Alert"}
                    {verificationResult.status === "IDLE" && "Gate Standby Ready"}
                  </span>
                  {verificationResult.timestamp && (
                    <span className="text-[11px] font-mono opacity-75">{verificationResult.timestamp}</span>
                  )}
                </div>

                <p className="text-sm font-medium">{verificationResult.message}</p>

                {/* Verified Attendee Badge */}
                {verificationResult.attendee && (
                  <div className="mt-3 pt-3 border-t border-current/15 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="opacity-70 block text-[11px]">Attendee</span>
                      <strong className="block text-sm">{verificationResult.attendee.name}</strong>
                      <span className="opacity-80 block text-[11px]">{verificationResult.attendee.company}</span>
                    </div>
                    <div>
                      <span className="opacity-70 block text-[11px]">Tier & Source</span>
                      <span className="font-semibold block">{verificationResult.attendee.ticketTier}</span>
                      <span className="opacity-80 block text-[11px]">{verificationResult.attendee.registrationSource}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Gate Activity Feed */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-cyan-400" />
                Live Gate Security Audit Feed
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Real-time Turnstiles</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-48 pr-1 flex-1">
              {activityLogs
                .filter((l) => ["ENTRY", "WARNING", "ILLEGAL_ENTRY"].includes(l.action_type))
                .slice(0, 6)
                .map((log) => (
                  <div
                    key={log.id}
                    className={`text-xs p-2 rounded-lg border flex items-start justify-between gap-2 ${
                      log.action_type === "ILLEGAL_ENTRY"
                        ? "bg-red-950/30 border-red-900/40 text-red-300"
                        : log.action_type === "WARNING"
                        ? "bg-amber-950/30 border-amber-900/40 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                          log.action_type === "ILLEGAL_ENTRY"
                            ? "bg-red-400"
                            : log.action_type === "WARNING"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span className="font-medium text-[11px] leading-relaxed">{log.message}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
