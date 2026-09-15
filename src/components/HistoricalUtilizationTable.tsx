import React from "react";
import { Building2, TrendingUp, CheckCircle, Award, BarChart3 } from "lucide-react";
import { HallVenue, Session } from "../types";

interface HistoricalUtilizationTableProps {
  halls: HallVenue[];
  sessions: Session[];
}

export const HistoricalUtilizationTable: React.FC<HistoricalUtilizationTableProps> = ({
  halls,
  sessions,
}) => {
  // Compute utilization dynamically based on completed sessions and baseline metrics
  const utilizationMetrics = halls.map((hall) => {
    const completedSessionsForHall = sessions.filter(
      (s) => s.hallId === hall.id && s.status === "completed"
    );
    const activeSessionsForHall = sessions.filter(
      (s) => s.hallId === hall.id && s.status !== "completed"
    );

    const baseCompleted = hall.historicalSessionsCompleted || 2;
    const baseAttendance = hall.historicalTotalAttendance || hall.capacity * baseCompleted * 0.88;

    const dynamicCompleted = baseCompleted + completedSessionsForHall.length;
    const dynamicAttendance =
      baseAttendance +
      completedSessionsForHall.reduce((sum, s) => sum + (s.registeredCount || s.expectedAttendees || 100), 0);

    const maxPotentialAttendance = hall.capacity * dynamicCompleted;
    const utilizationRate = maxPotentialAttendance > 0
      ? Math.min(100, Math.round((dynamicAttendance / maxPotentialAttendance) * 100))
      : 85;

    return {
      hall,
      sessionsCompleted: dynamicCompleted,
      activeSessions: activeSessionsForHall.length,
      totalAttendance: dynamicAttendance,
      utilizationRate,
    };
  });

  const avgUtilization = Math.round(
    utilizationMetrics.reduce((acc, curr) => acc + curr.utilizationRate, 0) / (utilizationMetrics.length || 1)
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Historical Room Utilization Metrics
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                POST-SESSION AUDIT
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated capacity utilization efficiency across completed conference sessions and keynote stages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Campus Avg Utilization:</span>
          <span
            className={`font-mono font-bold px-2 py-0.5 rounded-md border ${
              avgUtilization >= 90
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30"
            }`}
          >
            {avgUtilization}%
          </span>
        </div>
      </div>

      {/* Utilization Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-medium uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Venue / Hall</th>
              <th className="py-3 px-3">Capacity</th>
              <th className="py-3 px-3">Completed Sessions</th>
              <th className="py-3 px-3">Total Delegates Hosted</th>
              <th className="py-3 px-4 min-w-[180px]">Capacity Utilization (%)</th>
              <th className="py-3 px-3 text-right">Operational Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {utilizationMetrics.map(({ hall, sessionsCompleted, totalAttendance, utilizationRate }) => {
              const isHighUtil = utilizationRate >= 90;
              const isMediumUtil = utilizationRate >= 75 && utilizationRate < 90;

              return (
                <tr key={hall.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white text-sm">{hall.name}</div>
                    <div className="text-[11px] text-slate-400">{hall.floor}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-medium text-slate-200">
                    {hall.capacity} seats
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {sessionsCompleted} sessions
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-200 font-medium">
                    {totalAttendance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isHighUtil
                              ? "bg-emerald-500"
                              : isMediumUtil
                              ? "bg-indigo-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${utilizationRate}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono font-bold text-xs min-w-[38px] text-right ${
                          isHighUtil
                            ? "text-emerald-400"
                            : isMediumUtil
                            ? "text-indigo-400"
                            : "text-amber-400"
                        }`}
                      >
                        {utilizationRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                        isHighUtil
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      }`}
                    >
                      <CheckCircle className="h-3 w-3" />
                      {isHighUtil ? "High Efficiency" : "Optimal Utilization"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
