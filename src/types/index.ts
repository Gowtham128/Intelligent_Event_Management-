export type MilestoneKey = "overview" | "milestone1" | "milestone2" | "milestone3" | "milestone4";

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  role: string;
  registrationSource: "Direct Portal" | "LinkedIn" | "Eventbrite" | "Corporate SSO";
  ticketTier: "VIP Executive" | "Full Conference" | "Workshop Only" | "Student / Academic";
  checkedIn: boolean;
  checkInTime?: string;
  entryPin: string; // 4-digit security gate access PIN
  dietaryRequirements: string;
  interests: string[];
  propensityScore: number; // 0 - 100 AI score of likely attendance
}

export interface HallVenue {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  currentOccupancy: number;
  equipment: string[];
  status: "Optimal" | "Crowded" | "Critical" | "Maintenance";
  historicalSessionsCompleted?: number;
  historicalTotalAttendance?: number;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  bio: string;
  rating: number;
  assignedHallId: string;
  status: "Confirmed" | "En Route" | "Checked In" | "Delayed";
  expertise: string[];
  avatarInitial: string;
}

export interface Session {
  id: string;
  title: string;
  hallId: string;
  speakerId: string;
  startTime: string;
  endTime: string;
  track: "AI & GenAI" | "Cloud Architecture" | "Cybersecurity" | "DevOps & SRE";
  registeredCount: number;
  capacity: number;
  expectedAttendees?: number;
  status?: "scheduled" | "conflict" | "completed";
}

export interface ActivityLog {
  id: string;
  action_type: "REGISTRATION" | "ENTRY" | "ILLEGAL_ENTRY" | "WARNING" | "SPONSOR" | "INCIDENT" | "STATUS_UPDATE" | "SYSTEM" | "SCHEDULING";
  message: string;
  timestamp: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tier: "Platinum" | "Gold" | "Silver";
  boothLocation: string;
  leadsCaptured: number;
  targetLeads: number;
  contractValue: number;
  footfallCount: number;
  roiScore: number; // calculated %
  status: "Active" | "Contract Pending" | "Needs Attention";
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "Investigating" | "In Progress" | "Resolved";
  reportedAt: string;
  slaMinutes: number;
  elapsedMinutes: number;
  escalationLevel: "Level 1" | "Level 2" | "Executive";
  assignee: string;
  rootCause?: string;
  immediateActions: string[];
}

export interface OperationalAlert {
  id: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  message: string;
  category: "Venue" | "Incident" | "Registration" | "Sponsor" | "System";
  acknowledged: boolean;
}

export interface AgentStatus {
  id: string;
  agentType: "registration" | "venue" | "speaker" | "sponsorship" | "incident" | "orchestrator";
  name: string;
  milestone: string;
  description: string;
  status: "ONLINE" | "BUSY" | "STANDBY";
  activeTasks: number;
  lastAutonomousDecision: string;
}

export interface TestResult {
  id: string;
  milestone: string;
  name: string;
  status: "PASS" | "FAIL" | "PENDING";
  durationMs: number;
  details: string;
}
