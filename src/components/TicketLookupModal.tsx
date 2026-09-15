import React, { useState } from "react";
import { X, Search, Ticket, Mail, Phone, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { Attendee } from "../types";

interface TicketLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendees: Attendee[];
  onSelectPinForVerification?: (pin: string) => void;
}

export const TicketLookupModal: React.FC<TicketLookupModalProps> = ({
  isOpen,
  onClose,
  attendees,
  onSelectPinForVerification,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "email" | "phone">("all");
  const [lookupResult, setLookupResult] = useState<Attendee | null>(null);
  const [searched, setSearched] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen) return null;

  const handleLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const cleanDigits = query.replace(/[^0-9]/g, "");

    const found = attendees.find((a) => {
      const matchEmail = a.email.toLowerCase().includes(query);
      const matchName = a.name.toLowerCase().includes(query);
      const matchPhone = a.phone && cleanDigits && a.phone.replace(/[^0-9]/g, "").includes(cleanDigits);
      const matchId = a.id.toLowerCase() === query;

      if (searchType === "email") return matchEmail;
      if (searchType === "phone") return matchPhone;
      return matchEmail || matchName || matchPhone || matchId;
    });

    setLookupResult(found || null);
    setSearched(true);
  };

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Find My Ticket & Entry PIN</h3>
              <p className="text-xs text-slate-400">Lookup security pass by email address or registered mobile number</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Search Form */}
          <form onSubmit={handleLookup} className="space-y-3">
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSearchType("all")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  searchType === "all" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                All Fields
              </button>
              <button
                type="button"
                onClick={() => setSearchType("email")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  searchType === "email" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSearchType("phone")}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  searchType === "phone" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  searchType === "email"
                    ? "Enter email (e.g. gowtham.sakthivel@enterprise.net)"
                    : searchType === "phone"
                    ? "Enter phone number (e.g. 9876543210)"
                    : "Enter attendee name, email, or mobile number..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Find Ticket
              </button>
            </div>
          </form>

          {/* Quick Suggestions for Demo */}
          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500">Quick tests:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("gowtham.sakthivel@enterprise.net");
                setSearchType("email");
              }}
              className="text-blue-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
            >
              gowtham.sakthivel
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("aravind.sundaram@infosys.com");
                setSearchType("email");
              }}
              className="text-blue-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
            >
              aravind.sundaram
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("m.krishnan@datasphere.org");
                setSearchType("email");
              }}
              className="text-blue-400 hover:underline bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60"
            >
              m.krishnan (Unchecked)
            </button>
          </div>

          {/* Result Card */}
          {searched && lookupResult && (
            <div className="bg-slate-950 border border-blue-900/40 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-400">
                    {lookupResult.id} • {lookupResult.ticketTier}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{lookupResult.name}</h4>
                  <p className="text-xs text-slate-400">{lookupResult.role} @ {lookupResult.company}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                    lookupResult.checkedIn
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {lookupResult.checkedIn ? "Checked In" : "Pending Check-In"}
                </span>
              </div>

              {/* Security PIN Display */}
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-800/40 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Gate Security Entry PIN</div>
                  <div className="text-2xl font-mono font-bold tracking-widest text-emerald-400 mt-0.5">
                    {lookupResult.entryPin || "4829"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyPin(lookupResult.entryPin || "4829")}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1 border border-slate-700"
                    title="Copy PIN"
                  >
                    {copiedPin ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedPin ? "Copied" : "Copy"}</span>
                  </button>

                  {onSelectPinForVerification && (
                    <button
                      onClick={() => {
                        onSelectPinForVerification(lookupResult.entryPin || "4829");
                        onClose();
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      Use in Keypad
                    </button>
                  )}
                </div>
              </div>

              {/* Attendee Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Registered Email</span>
                  <span className="text-slate-200 font-mono text-[11px] truncate block">{lookupResult.email}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Mobile Phone</span>
                  <span className="text-slate-200 font-mono text-[11px] block">{lookupResult.phone || "+1-555-0199"}</span>
                </div>
              </div>
            </div>
          )}

          {searched && !lookupResult && (
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-5 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
              <h4 className="text-sm font-semibold text-white">Ticket Not Found</h4>
              <p className="text-xs text-slate-400">
                No matching registration found for "{searchQuery}". Please check the spelling or ask registration support at Helpdesk 1.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
