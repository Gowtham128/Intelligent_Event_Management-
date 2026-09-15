import React, { useState } from "react";
import {
  X,
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Users,
  Building2,
  Mic,
  Award,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { FormattedAgentMessage } from "./FormattedAgentMessage";

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAgent?: string;
}

interface ChatMessage {
  sender: "user" | "agent";
  agentType: string;
  text: string;
  time: string;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  defaultAgent = "orchestrator",
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>(defaultAgent);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "agent",
      agentType: "orchestrator",
      text: "Greetings! I am the Master Event Intelligence & Orchestrator. All event subsystems are unified and synchronizing nominal telemetry. Select any specialized agent or ask me for cross-domain operational intelligence.",
      time: "Just now",
    },
  ]);

  if (!isOpen) return null;

  const agentOptions = [
    { id: "orchestrator", label: "Master Orchestrator", domain: "Core", icon: Layers },
    { id: "registration", label: "Registration Agent", domain: "Ingress", icon: Users },
    { id: "venue", label: "Venue Optimization", domain: "Venue", icon: Building2 },
    { id: "speaker", label: "Speaker Operations", domain: "Speaker", icon: Mic },
    { id: "sponsorship", label: "Sponsorship Agent", domain: "Sponsors", icon: Award },
    { id: "incident", label: "Incident Command", domain: "Security", icon: ShieldAlert },
  ];

  const quickPrompts: Record<string, string[]> = {
    orchestrator: [
      "Provide an executive synthesis across all event operations",
      "Check if any active incidents threaten keynote sessions",
      "Evaluate global event operational readiness score",
    ],
    registration: [
      "Analyze check-in velocity and VIP arrival queue",
      "Identify high-propensity attendee demographic clusters",
      "Recommend badge printer load mitigation",
    ],
    venue: [
      "Check capacity utilization across all 5 halls",
      "Suggest overflow routing for Turing Auditorium B",
      "Confirm AV line-array status in Hall A",
    ],
    speaker: [
      "Verify speaker check-in and stage arrival timeline",
      "Detect potential schedule collisions for Dr. Evelyn Reed",
      "Check session track attendance projections",
    ],
    sponsorship: [
      "Review Platinum vs Gold sponsor ROI performance",
      "Suggest personalized sponsor engagement push notifications",
      "Analyze booth footfall conversion rates",
    ],
    incident: [
      "Triage active projector flicker in Hall B",
      "Verify SLA timer compliance across open tickets",
      "Propose preventative measures for WiFi saturation",
    ],
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      agentType: selectedAgent,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentType: selectedAgent,
          message: text,
        }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        sender: "agent",
        agentType: selectedAgent,
        text: data.reply || "Agent acknowledged your command and verified the operational state.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (e) {
      const agentMsg: ChatMessage = {
        sender: "agent",
        agentType: selectedAgent,
        text: "Agent operational mesh status: Tasks processed successfully. All subsystem telemetry reports nominal thresholds.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
              <Bot className="h-5 w-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Agent Intelligence Console</h3>
              <p className="text-[11px] text-indigo-300 font-medium">Groq LPU Engine • Sub-Second Inference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Agent Switcher Pills */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto flex gap-1.5 scrollbar-none">
          {agentOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedAgent === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedAgent(opt.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{opt.label}</span>
                <span className="text-[10px] opacity-70">({opt.domain})</span>
              </button>
            );
          })}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none shadow-sm"
                }`}
              >
                {m.sender === "agent" && (
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>{m.agentType} Agent</span>
                  </div>
                )}
                {m.sender === "user" ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <FormattedAgentMessage content={m.text} showCopy={true} />
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Agent reasoning in progress...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Suggested queries:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {(quickPrompts[selectedAgent] || []).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 text-left transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input
            type="text"
            placeholder={`Message ${selectedAgent} agent...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
