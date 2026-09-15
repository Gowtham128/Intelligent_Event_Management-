import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Building2,
  Mic,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  ChevronRight,
  Sparkles,
  Users,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import { HallVenue, Speaker, Session, ActivityLog } from "../types";

interface AdvancedSchedulingWizardProps {
  halls: HallVenue[];
  speakers: Speaker[];
  sessions: Session[];
  initialHallId?: string;
  initialSpeakerId?: string;
  onScheduleSession?: (session: Session) => void;
  onSessionScheduled?: (session: Session) => void;
  onCompleteSession?: (sessionId: string) => void;
  onAddActivityLog?: (log: ActivityLog) => void;
  onViewSchedule?: () => void;
}

// Helper to convert "09:30 AM" string to minutes from midnight
export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export const AdvancedSchedulingWizard: React.FC<AdvancedSchedulingWizardProps> = ({
  halls,
  speakers,
  sessions,
  initialHallId,
  initialSpeakerId,
  onScheduleSession,
  onSessionScheduled,
  onCompleteSession,
  onAddActivityLog,
  onViewSchedule,
}) => {
  // Wizard Steps: 1: Venue, 2: Speaker
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  // Form State
  const [sessionTitle, setSessionTitle] = useState("");
  const [selectedHallId, setSelectedHallId] = useState<string>(initialHallId || halls[0]?.id || "");
  const [isHallLocked, setIsHallLocked] = useState(true);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(initialSpeakerId || speakers[0]?.id || "");
  const [isSpeakerLocked, setIsSpeakerLocked] = useState(true);

  const [startTime, setStartTime] = useState("02:00 PM");
  const [endTime, setEndTime] = useState("03:00 PM");
  const [track, setTrack] = useState<Session["track"]>("AI & GenAI");
  const [expectedAttendees, setExpectedAttendees] = useState<number>(140);
  const [justScheduledId, setJustScheduledId] = useState<string | null>(null);

  const [scheduleStatusMessage, setScheduleStatusMessage] = useState<{
    type: "idle" | "success" | "conflict";
    message: string;
  }>({
    type: "idle",
    message: "Configure venue, speaker, and timeline to run live conflict evaluation.",
  });

  // Calculate Availability across all halls and speakers for current startTime & endTime
  const availabilityMatrix = useMemo(() => {
    const newStart = parseTimeToMinutes(startTime);
    const newEnd = parseTimeToMinutes(endTime);

    // Active (non-completed) sessions to check overlap against
    const activeSessions = sessions.filter((s) => s.status !== "completed");

    const hallStatus: Record<string, { free: boolean; conflictingSession?: Session }> = {};
    const speakerStatus: Record<string, { free: boolean; conflictingSession?: Session }> = {};

    halls.forEach((h) => {
      const conflict = activeSessions.find((s) => {
        if (s.hallId !== h.id) return false;
        const sStart = parseTimeToMinutes(s.startTime);
        const sEnd = parseTimeToMinutes(s.endTime);
        return Math.max(newStart, sStart) < Math.min(newEnd, sEnd);
      });
      hallStatus[h.id] = { free: !conflict, conflictingSession: conflict };
    });

    speakers.forEach((spk) => {
      const conflict = activeSessions.find((s) => {
        if (s.speakerId !== spk.id) return false;
        const sStart = parseTimeToMinutes(s.startTime);
        const sEnd = parseTimeToMinutes(s.endTime);
        return Math.max(newStart, sStart) < Math.min(newEnd, sEnd);
      });
      speakerStatus[spk.id] = { free: !conflict, conflictingSession: conflict };
    });

    return { hallStatus, speakerStatus };
  }, [startTime, endTime, sessions, halls, speakers]);

  // Check current selection conflict
  const currentHallConflict = availabilityMatrix.hallStatus[selectedHallId];
  const currentSpeakerConflict = availabilityMatrix.speakerStatus[selectedSpeakerId];
  const selectedHall = halls.find((h) => h.id === selectedHallId);
  const selectedSpeaker = speakers.find((s) => s.id === selectedSpeakerId);

  // Capacity Check
  const capacityWarning = selectedHall && expectedAttendees > selectedHall.capacity;

  const hasConflict =
    !currentHallConflict?.free ||
    !currentSpeakerConflict?.free ||
    parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime);

  // Handle Submit Schedule
  const handleCreateSession = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Ensure venue and speaker are locked
    setIsHallLocked(true);
    setIsSpeakerLocked(true);

    // Automatic smart title generation if left empty
    const finalTitle =
      sessionTitle.trim() ||
      `${selectedSpeaker?.name || "Featured Keynote"}: ${track} Deep Dive`;

    if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
      setScheduleStatusMessage({
        type: "conflict",
        message: "End time must be later than start time.",
      });
      return;
    }

    if (!currentHallConflict?.free) {
      setScheduleStatusMessage({
        type: "conflict",
        message: `Venue Conflict: ${selectedHall?.name} is already booked for "${currentHallConflict?.conflictingSession?.title}" (${currentHallConflict?.conflictingSession?.startTime} - ${currentHallConflict?.conflictingSession?.endTime}). Please select another hall or adjust time.`,
      });
      return;
    }

    if (!currentSpeakerConflict?.free) {
      setScheduleStatusMessage({
        type: "conflict",
        message: `Speaker Collision: ${selectedSpeaker?.name} is already presenting "${currentSpeakerConflict?.conflictingSession?.title}" (${currentSpeakerConflict?.conflictingSession?.startTime} - ${currentSpeakerConflict?.conflictingSession?.endTime}). Please choose another speaker or time window.`,
      });
      return;
    }

    const newSessionId = `SES-${100 + sessions.length + 1}`;
    const newSession: Session = {
      id: newSessionId,
      title: finalTitle,
      hallId: selectedHallId,
      speakerId: selectedSpeakerId,
      startTime,
      endTime,
      track,
      registeredCount: Number(expectedAttendees),
      expectedAttendees: Number(expectedAttendees),
      capacity: selectedHall ? selectedHall.capacity : 200,
      status: "scheduled",
    };

    // Safely execute callback supporting both prop naming patterns
    const scheduleFn = onScheduleSession || onSessionScheduled;
    if (scheduleFn) {
      scheduleFn(newSession);
    }

    if (onAddActivityLog) {
      onAddActivityLog({
        id: `ACT-${Date.now()}`,
        action_type: "SCHEDULING",
        message: `SCHEDULING: "${finalTitle}" successfully scheduled in ${selectedHall?.name} with ${selectedSpeaker?.name} (${startTime} - ${endTime}). Conflict verification passed.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    setJustScheduledId(newSessionId);
    setScheduleStatusMessage({
      type: "success",
      message: `Session "${finalTitle}" successfully scheduled and locked in ${selectedHall?.name} with ${selectedSpeaker?.name} (${startTime} - ${endTime})!`,
    });

    // Clear title for next entry while retaining locked resources
    setSessionTitle("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Advanced Scheduling & Conflict Detection Wizard
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                2-STEP LOCK ENGINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pick Venue & Speaker, lock resources, run live overlap matrix evaluation, and enforce capacity thresholds.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setWizardStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
              wizardStep === 1
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Step 1: Pick Venue {isHallLocked && "🔒"}</span>
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <button
            onClick={() => setWizardStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
              wizardStep === 2
                ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Step 2: Pick Speaker {isSpeakerLocked && "🔒"}</span>
          </button>
        </div>
      </div>

      {/* Time & Session Parameters Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Session Title</label>
            <input
              type="text"
              placeholder="e.g. Masterclass: Autonomous Multi-Agent Reasoning..."
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Track</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500"
            >
              <option value="AI & GenAI">AI & GenAI</option>
              <option value="Cloud Architecture">Cloud Architecture</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="DevOps & SRE">DevOps & SRE</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Expected Attendees</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={10}
                max={600}
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 shrink-0">seats</span>
            </div>
          </div>
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-900">
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-indigo-400" /> Start Time
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="09:30 AM">09:30 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="01:30 PM">01:30 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="04:30 PM">04:30 PM</option>
              <option value="05:00 PM">05:00 PM</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-indigo-400" /> End Time
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
            >
              <option value="10:00 AM">10:00 AM</option>
              <option value="10:30 AM">10:30 AM</option>
              <option value="11:15 AM">11:15 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="12:45 PM">12:45 PM</option>
              <option value="02:30 PM">02:30 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="04:15 PM">04:15 PM</option>
              <option value="05:15 PM">05:15 PM</option>
              <option value="06:00 PM">06:00 PM</option>
            </select>
          </div>

          {/* Quick Pre-set Time slots */}
          <div className="md:col-span-2 flex items-end gap-1.5">
            <span className="text-[10px] text-slate-500 mb-2">Pre-sets:</span>
            <button
              type="button"
              onClick={() => {
                setStartTime("02:00 PM");
                setEndTime("03:00 PM");
              }}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-800 cursor-pointer"
            >
              02:00 - 03:00 PM
            </button>
            <button
              type="button"
              onClick={() => {
                setStartTime("04:30 PM");
                setEndTime("05:30 PM");
              }}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-800 cursor-pointer"
            >
              04:30 - 05:30 PM
            </button>
            <button
              type="button"
              onClick={() => {
                // Test overlap collision intentionally
                setStartTime("09:30 AM");
                setEndTime("10:30 AM");
              }}
              className="px-2 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded text-[10px] border border-amber-800/40 cursor-pointer"
            >
              Trigger Overlap (09:30 AM)
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: Pick Venue View */}
      {wizardStep === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-400" />
              Step 1: Select Venue (Live Conflict Evaluation for {startTime} - {endTime})
            </span>
            <span className="text-[11px] text-slate-400">
              {isHallLocked ? "🔒 Venue Locked" : "Click to select and lock venue"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {halls.map((hall) => {
              const availability = availabilityMatrix.hallStatus[hall.id];
              const isSelected = selectedHallId === hall.id;
              const isOverCapacity = expectedAttendees > hall.capacity;

              return (
                <div
                  key={hall.id}
                  onClick={() => {
                    setSelectedHallId(hall.id);
                    setIsHallLocked(true);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/40"
                      : "bg-slate-950 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-400 uppercase">{hall.floor}</div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{hall.name}</h4>
                    </div>

                    {availability?.free ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Free
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Busy
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Capacity: <strong className="text-slate-200">{hall.capacity}</strong>
                    </span>
                    {isOverCapacity && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <AlertTriangle className="h-3 w-3" /> Overflow ({expectedAttendees} needed)
                      </span>
                    )}
                  </div>

                  {!availability?.free && availability?.conflictingSession && (
                    <div className="mt-2 text-[10px] text-red-300/90 bg-red-950/30 p-1.5 rounded border border-red-900/30 truncate">
                      Overlap: "{availability.conflictingSession.title}" ({availability.conflictingSession.startTime} - {availability.conflictingSession.endTime})
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                      {hall.equipment[0]}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHallId(hall.id);
                        setIsHallLocked(!isHallLocked || selectedHallId !== hall.id);
                        setWizardStep(2);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-[11px] flex items-center gap-1"
                    >
                      <span>Lock & Next</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Pick Speaker View */}
      {wizardStep === 2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-indigo-400" />
              Step 2: Select Speaker (Live Conflict Evaluation for {startTime} - {endTime})
            </span>
            <button
              onClick={() => setWizardStep(1)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ← Back to Venue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {speakers.map((speaker) => {
              const availability = availabilityMatrix.speakerStatus[speaker.id];
              const isSelected = selectedSpeakerId === speaker.id;

              return (
                <div
                  key={speaker.id}
                  onClick={() => {
                    setSelectedSpeakerId(speaker.id);
                    setIsSpeakerLocked(true);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/40"
                      : "bg-slate-950 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                        {speaker.avatarInitial}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{speaker.name}</h4>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{speaker.organization}</div>
                      </div>
                    </div>

                    {availability?.free ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Free
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Busy
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                    {speaker.bio}
                  </p>

                  {!availability?.free && availability?.conflictingSession && (
                    <div className="mt-2 text-[10px] text-red-300/90 bg-red-950/30 p-1.5 rounded border border-red-900/30 truncate">
                      Collision: "{availability.conflictingSession.title}" ({availability.conflictingSession.startTime} - {availability.conflictingSession.endTime})
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex gap-1 flex-wrap max-w-[170px]">
                      {speaker.expertise.slice(0, 2).map((exp, i) => (
                        <span key={i} className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                          {exp}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSpeakerId(speaker.id);
                        setIsSpeakerLocked(true);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-[11px]"
                    >
                      Lock Speaker
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Resource Summary & Conflict Validation Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Locked Resources:</span>
            <button
              type="button"
              onClick={() => setIsHallLocked(!isHallLocked)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isHallLocked
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-600/50"
                  : "bg-amber-950/30 text-amber-300 border-amber-600/50"
              }`}
            >
              {isHallLocked ? <Lock className="h-3.5 w-3.5 text-emerald-400" /> : <Unlock className="h-3.5 w-3.5 text-amber-400" />}
              <span>Venue: {selectedHall?.name}</span>
              <span className="text-[10px] opacity-75">({selectedHall?.capacity} seats)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSpeakerLocked(!isSpeakerLocked)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isSpeakerLocked
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-600/50"
                  : "bg-amber-950/30 text-amber-300 border-amber-600/50"
              }`}
            >
              {isSpeakerLocked ? <Lock className="h-3.5 w-3.5 text-emerald-400" /> : <Unlock className="h-3.5 w-3.5 text-amber-400" />}
              <span>Speaker: {selectedSpeaker?.name}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Time Window:</span>
            <span className="font-mono text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {startTime} - {endTime}
            </span>
          </div>
        </div>

        {/* Inline Session Title with Quick Suggestions */}
        <div className="pt-2 border-t border-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>Session Title</span>
              <span className="text-[10px] text-slate-400 font-normal">(custom or click a suggestion)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
              <span className="text-[10px] text-slate-500">Suggestions:</span>
              <button
                type="button"
                onClick={() => setSessionTitle(`${selectedSpeaker?.name || "Keynote"}: Keynote Address`)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white border border-slate-800 text-[10px] cursor-pointer"
              >
                Keynote
              </button>
              <button
                type="button"
                onClick={() => setSessionTitle(`${track} Architecture Masterclass`)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white border border-slate-800 text-[10px] cursor-pointer"
              >
                Masterclass
              </button>
              <button
                type="button"
                onClick={() => setSessionTitle(`Hands-on Deep Dive: ${track}`)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white border border-slate-800 text-[10px] cursor-pointer"
              >
                Deep Dive
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder={`e.g. ${selectedSpeaker?.name || "Speaker"} - ${track} Keynote (or leave blank to auto-generate)`}
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Real-time Conflict Alert or All-Clear */}
        {hasConflict ? (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Scheduling Conflict Detected!</strong>
              {!currentHallConflict?.free && (
                <span>Venue Overlap: {selectedHall?.name} is busy during this time window. </span>
              )}
              {!currentSpeakerConflict?.free && (
                <span>Speaker Collision: {selectedSpeaker?.name} has an overlapping presentation. </span>
              )}
              {parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime) && (
                <span>Invalid time bounds (end time must be later than start time). </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2.5 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Conflict Scanner: Zero overlapping room or speaker collisions detected. Ready to commit schedule!</span>
            </div>
            {capacityWarning && (
              <span className="text-[11px] text-amber-400 font-medium">
                ⚠️ Expected attendees ({expectedAttendees}) exceeds room capacity ({selectedHall?.capacity})
              </span>
            )}
          </div>
        )}

        {scheduleStatusMessage.type !== "idle" && (
          <div
            className={`text-xs p-3 rounded-lg border flex items-center justify-between gap-3 ${
              scheduleStatusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-600/40 text-emerald-200"
                : "bg-red-950/40 border-red-600/40 text-red-200"
            }`}
          >
            <span>{scheduleStatusMessage.message}</span>
            {scheduleStatusMessage.type === "success" && onViewSchedule && (
              <button
                type="button"
                onClick={onViewSchedule}
                className="px-2.5 py-1 bg-emerald-600/40 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold cursor-pointer shrink-0 transition-colors"
              >
                View in Timelines →
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => handleCreateSession()}
            disabled={hasConflict}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Lock & Commit Scheduled Session</span>
          </button>
        </div>
      </div>

      {/* Active & Scheduled Sessions Timeline List with 'Complete Session' Action */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            Active Session Schedule & Operational Controls
          </span>
          <span className="text-[10px] text-slate-500">
            {sessions.length} sessions configured • Click 'Complete Session' to update historical room utilization
          </span>
        </div>

        <div className="space-y-2">
          {sessions.map((sess) => {
            const hall = halls.find((h) => h.id === sess.hallId);
            const speaker = speakers.find((spk) => spk.id === sess.speakerId);
            const isCompleted = sess.status === "completed";
            const isJustAdded = justScheduledId === sess.id;

            return (
              <div
                key={sess.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isJustAdded
                    ? "bg-indigo-950/40 border-indigo-500/80 shadow-md"
                    : isCompleted
                    ? "bg-slate-900/40 border-slate-800/60 opacity-75"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {sess.id}
                    </span>
                    <span className="text-xs font-semibold text-white">{sess.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {sess.track}
                    </span>
                    {isJustAdded && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold animate-pulse">
                        Just Scheduled
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {sess.startTime} - {sess.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-500" />
                      {hall?.name || sess.hallId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mic className="h-3 w-3 text-slate-500" />
                      {speaker?.name || sess.speakerId}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {sess.registeredCount || sess.expectedAttendees || 120} registered
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onCompleteSession) {
                          onCompleteSession(sess.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-300 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Complete Session</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Logged to Utilization
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
