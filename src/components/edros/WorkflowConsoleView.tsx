/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sliders,
  FileText,
  Users,
  Check,
  X,
  History,
  UserCheck,
  Bell,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

interface ApprovalRequest {
  id: string;
  type: "DOCUMENT" | "EMPLOYEE" | "EXPENSE" | "RECOVERY" | "BANK" | "ROLE";
  status: "PENDING" | "APPROVED" | "REJECTED";
  makerId: string;
  makerEmail: string;
  checkerId?: string;
  checkerEmail?: string;
  resourceId: string;
  payload: any;
  narration: string;
  submittedAt: string;
  evaluatedAt?: string;
  rejectionReason?: string;
}

interface CronJob {
  id: string;
  schedule: string;
  jobName: string;
  status: string;
}

interface Reminder {
  id: string;
  caseId: string;
  debtorName: string;
  executiveId: string;
  reminderType: string;
  reminderDate: string;
  notes: string;
  status: "PENDING" | "DISMISSED" | "TRIGGERED";
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  status: "SUCCESS" | "DENIED" | "FAILURE";
  correlationId: string;
}

interface RollbackRecord {
  id: string;
  requestId?: string;
  caseId?: string;
  reason: string;
  timestamp: string;
}

interface BackgroundJob {
  id: string;
  jobType: string;
  status: string;
  progress: number;
  queuedAt: string;
}

interface WorkflowConsoleViewProps {
  token: string;
}

export default function WorkflowConsoleView({ token }: WorkflowConsoleViewProps) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [rollbackLogs, setRollbackLogs] = useState<RollbackRecord[]>([]);
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Maker submission form states (to let users test the engine immediately)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [makerType, setMakerType] = useState<"EXPENSE" | "ROLE" | "RECOVERY">("EXPENSE");
  const [makerResourceId, setMakerResourceId] = useState("exp-202");
  const [makerAmount, setMakerAmount] = useState("5000");
  const [makerNarration, setMakerNarration] = useState("Field recovery travel taxi allowance and hotel lodging reimbursement claim.");

  // Filtering logs
  const [auditFilter, setAuditFilter] = useState("");

  const fetchWorkflowTelemetry = () => {
    setLoading(true);
    setError(null);

    // 1. Fetch approvals
    const approvalsPromise = fetch("/api/v2/workflows/approvals", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then((res) => res.json());

    // 2. Fetch scheduler telemetry
    const schedulerPromise = fetch("/api/v2/workflows/scheduler", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then((res) => res.json());

    // 3. Fetch audit logs (compliance)
    const auditPromise = fetch("/api/v1/audit-logs", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then((res) => res.json());

    // 4. Fetch background jobs
    const bgJobsPromise = fetch("/api/v2/jobs", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then((res) => res.json());

    Promise.all([approvalsPromise, schedulerPromise, auditPromise, bgJobsPromise])
      .then(([apprRes, schedRes, auditRes, bgRes]) => {
        if (apprRes.success) {
          setApprovals(apprRes.data);
        }
        if (schedRes.success) {
          setCronJobs(schedRes.data.activeCronJobs || []);
          setReminders(schedRes.data.pendingReminders || []);
          setNotifications(schedRes.data.notifications || []);
          setRollbackLogs(schedRes.data.rollbackLogs || []);
        }
        if (auditRes.success) {
          setAuditLogs(auditRes.data || []);
        }
        if (bgRes.success) {
          setBackgroundJobs(bgRes.data || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load workflow engine dockets.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkflowTelemetry();
  }, [token]);

  // Execute Maker-Checker Decision (APPROVE/REJECT)
  const handleEvaluate = (id: string, action: "APPROVE" | "REJECT", reason?: string) => {
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/v2/workflows/approvals/${id}/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ action, reason })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Decision recorded successfully. State committed: ${action}`);
          fetchWorkflowTelemetry();
        } else {
          setError(payload.message || "Action declined by validation rules.");
        }
      })
      .catch((err) => setError(err.message));
  };

  // Submit mock approval request to sandbox
  const handleMakerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const payload =
      makerType === "EXPENSE"
        ? { amount: Number(makerAmount), purpose: "Reimbursement Claim" }
        : makerType === "ROLE"
        ? { newGrade: "M4" }
        : { proposedSettlement: 180000, haircutPct: 34.5 };

    fetch("/api/v2/workflows/approvals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        type: makerType,
        resourceId: makerResourceId,
        payload,
        narration: makerNarration
      })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg("Maker request added to verification queue successfully.");
          setShowSubmitModal(false);
          fetchWorkflowTelemetry();
        } else {
          setError(payload.message || "Failed to register maker entry.");
        }
      })
      .catch((err) => setError(err.message));
  };

  // Trigger manual tick to cron engines
  const handleSchedulerTick = () => {
    setError(null);
    setSuccessMsg(null);

    fetch("/api/v2/workflows/scheduler/tick", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Scheduler Tick dispatched: ${payload.message}`);
          fetchWorkflowTelemetry();
        } else {
          setError(payload.message || "Failed to tick cron engines.");
        }
      })
      .catch((err) => setError(err.message));
  };

  const filteredAudits = auditLogs.filter((log) => {
    if (!auditFilter) return true;
    const filter = auditFilter.toLowerCase();
    return (
      log.action.toLowerCase().includes(filter) ||
      log.userEmail.toLowerCase().includes(filter) ||
      log.status.toLowerCase().includes(filter) ||
      log.correlationId.toLowerCase().includes(filter)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b-2 border-brand-dark-bg pb-4 gap-4">
        <div>
          <h3 className="text-lg font-black uppercase text-brand-dark-bg flex items-center gap-2 font-sans">
            <Cpu className="w-5 h-5 text-brand-dark-bg" /> Workflow Orchestration & Approvals Nerve Center
          </h3>
          <p className="text-xs font-mono text-brand-dark-bg/80 mt-1">
            Real-time compliance monitoring, dual custody validation boundaries, automated cron schedulers, and background transaction logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-2 text-xs font-bold font-mono border-2 border-brand-dark-bg bg-brand-dark-bg text-white hover:bg-gray-800 flex items-center gap-1.5 cursor-pointer shadow-tech-sm"
          >
            <UserCheck className="w-4 h-4" /> Submit Maker Proposal
          </button>

          <button
            onClick={fetchWorkflowTelemetry}
            className="px-3 py-2 text-xs font-bold font-mono border-2 border-brand-dark-bg bg-white text-brand-dark-bg hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer shadow-tech-sm"
          >
            <RefreshCw className="w-4 h-4" /> Sync Hub
          </button>
        </div>
      </div>

      {/* SYSTEM FEEDBACK NOTIFICATIONS */}
      {error && (
        <div className="p-4 bg-brand-muted-bg border-l-4 border-brand-accent text-brand-accent flex items-start gap-3 shadow-tech-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold uppercase font-mono">[EXCEPTION DECLINED]: </span>
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-green-50 border-l-4 border-green-600 text-green-800 flex items-start gap-3 shadow-tech-sm">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
          <div className="text-xs font-mono">
            <span className="font-bold uppercase">[COMMIT SUCCESS]: </span>
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* TOP SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-brand-dark-bg/60">Approvals Queue</span>
          <span className="text-2xl font-black text-brand-dark-bg mt-1">
            {approvals.filter((a) => a.status === "PENDING").length} <span className="text-xs font-normal">Pending</span>
          </span>
          <div className="text-[10px] font-mono text-green-600 font-bold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Dual-Control Enforced
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-brand-dark-bg/60">Active Schedulers</span>
          <span className="text-2xl font-black text-brand-dark-bg mt-1">
            {cronJobs.length} <span className="text-xs font-normal">Active Crons</span>
          </span>
          <div className="text-[10px] font-mono text-brand-dark-bg/80 mt-2">
            Tick checks: PTP + SLA Breach
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-brand-dark-bg/60">Background Jobs</span>
          <span className="text-2xl font-black text-brand-dark-bg mt-1">
            {backgroundJobs.filter((j) => j.status === "QUEUED" || j.status === "RUNNING").length} <span className="text-xs font-normal">Active</span>
          </span>
          <div className="text-[10px] font-mono text-blue-600 font-bold mt-2">
            Queue workers running
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-brand-dark-bg/60">Rollback Safety Events</span>
          <span className="text-2xl font-black text-brand-accent mt-1">
            {rollbackLogs.length} <span className="text-xs font-normal text-brand-dark-bg">Logged</span>
          </span>
          <div className="text-[10px] font-mono text-brand-accent font-bold mt-2">
            State integrity preserved
          </div>
        </div>
      </div>

      {/* CORE VIEWPORT ROW 1: APPROVALS & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL A: MAKER-CHECKER APPROVALS QUEUE */}
        <div className="lg:col-span-2 bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm flex flex-col justify-between space-y-4">
          <div className="border-b border-gray-200 pb-2 flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-brand-dark-bg flex items-center gap-1.5 font-mono">
              <UserCheck className="w-4 h-4 text-brand-dark-bg" /> Maker-Checker Pending Authorization
            </h4>
            <span className="bg-brand-muted-bg text-brand-dark-bg border border-brand-dark-bg px-2 py-0.5 text-[10px] font-mono font-bold">
              DUAL CONTROLS
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-gray-500 bg-brand-muted-bg/30 border border-dashed border-gray-300">
              Zero pending maker approvals in authorization queue.
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {approvals.map((req) => (
                <div
                  key={req.id}
                  className={`p-3 border-2 ${
                    req.status === "PENDING"
                      ? "border-brand-dark-bg bg-brand-muted-bg/10"
                      : req.status === "APPROVED"
                      ? "border-green-600 bg-green-50/20"
                      : "border-gray-300 bg-gray-50/50"
                  } font-mono`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 text-white ${
                          req.type === "RECOVERY"
                            ? "bg-red-600"
                            : req.type === "EXPENSE"
                            ? "bg-amber-600"
                            : "bg-blue-600"
                        }`}>
                          {req.type} PROPOSAL
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">{req.id}</span>
                      </div>
                      <p className="text-xs font-bold text-brand-dark-bg">{req.narration}</p>
                      <div className="text-[10px] text-gray-600 space-y-0.5">
                        <p>Maker: <span className="font-semibold text-brand-dark-bg">{req.makerEmail}</span></p>
                        <p>Submitted: {new Date(req.submittedAt).toLocaleTimeString()}</p>
                        {req.payload && (
                          <div className="bg-white border p-1.5 mt-1 font-mono text-[9px] text-brand-dark-bg/80">
                            <strong>State Payload:</strong> {JSON.stringify(req.payload)}
                          </div>
                        )}
                      </div>
                    </div>

                    {req.status === "PENDING" ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEvaluate(req.id, "APPROVE")}
                          className="p-1.5 bg-green-600 text-white border border-green-700 hover:bg-green-700 cursor-pointer"
                          title="Authorize Commit"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Enter rejection reason justification:");
                            if (reason) handleEvaluate(req.id, "REJECT", reason);
                          }}
                          className="p-1.5 bg-red-600 text-white border border-red-700 hover:bg-red-700 cursor-pointer"
                          title="Reject / Rollback"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border ${
                          req.status === "APPROVED"
                            ? "border-green-600 text-green-700 bg-green-50"
                            : "border-red-600 text-red-700 bg-red-50"
                        }`}>
                          {req.status}
                        </span>
                        <p className="text-[9px] text-gray-500 mt-1">Checker: {req.checkerEmail}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-brand-muted-bg border-l-2 border-brand-dark-bg text-[10px] font-mono leading-relaxed">
            <strong>Maker-Checker Policy Rules:</strong> Core system configuration adjustments, debt recoveries settlement approvals, and staff promotions must follow <strong>Dual-Control Custody</strong>. Executives can submit proposals (Makers), but team leads or managers (Checkers) must evaluate. Makers are strictly forbidden from approving their own claims.
          </div>
        </div>

        {/* PANEL B: CRON SCHEDULER & NOTIFICATION ALERTS */}
        <div className="bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm space-y-4">
          <div className="border-b border-gray-200 pb-2 flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-brand-dark-bg flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-brand-dark-bg" /> Cron Job & SLA Trigger
            </h4>
            <button
              onClick={handleSchedulerTick}
              className="px-2 py-0.5 border border-brand-dark-bg bg-brand-dark-bg text-white hover:bg-gray-800 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              Tick Scheduler
            </button>
          </div>

          {/* Active Cron Loops */}
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold uppercase text-gray-500">Configured Cron Daemons</span>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto font-mono text-[10px]">
              {cronJobs.map((cron) => (
                <div key={cron.id} className="p-1.5 border border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-none"></span>
                    <span className="font-bold text-brand-dark-bg">{cron.jobName}</span>
                  </div>
                  <span className="text-gray-500 text-[9px] font-semibold">{cron.schedule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reminders / Calendar alert clocks */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-[9px] font-mono font-bold uppercase text-gray-500">Scheduler Reminder Clocks</span>
            {reminders.length === 0 ? (
              <p className="text-[10px] text-gray-400 font-mono italic">No reminders set.</p>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {reminders.map((rem) => (
                  <div key={rem.id} className="p-2 border border-brand-dark-bg bg-brand-muted-bg/5 font-mono text-[10px]">
                    <div className="flex justify-between font-bold text-brand-dark-bg">
                      <span>{rem.reminderType}</span>
                      <span className={rem.status === "TRIGGERED" ? "text-brand-accent animate-pulse" : "text-amber-600"}>
                        {rem.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{rem.notes}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Due: {new Date(rem.reminderDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CORE VIEWPORT ROW 2: TELEMETRY LISTS & SYSTEM AUDITS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL C: COMPLIANCE AUDIT TIMELINE LOGS */}
        <div className="lg:col-span-2 bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm space-y-4">
          <div className="border-b border-gray-200 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-mono">
            <h4 className="text-xs font-black uppercase text-brand-dark-bg flex items-center gap-1.5">
              <History className="w-4 h-4 text-brand-dark-bg" /> Real-time Audit & Rollback Logs
            </h4>
            <input
              type="text"
              placeholder="Filter by Action / Email / CID..."
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="px-2 py-0.5 text-[10px] font-mono border border-brand-dark-bg focus:outline-none w-full sm:w-48 bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Audit Logs Table */}
            <div className="md:col-span-2 space-y-2">
              <span className="text-[9px] font-mono font-bold uppercase text-gray-500">Correlation Tracing Stream</span>
              <div className="border border-brand-dark-bg overflow-x-auto max-h-[220px] text-[10px] font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-dark-bg text-white uppercase text-[8px] tracking-wider">
                      <th className="p-1.5 border border-brand-dark-bg">Action</th>
                      <th className="p-1.5 border border-brand-dark-bg">Operator</th>
                      <th className="p-1.5 border border-brand-dark-bg">Status</th>
                      <th className="p-1.5 border border-brand-dark-bg">Correlation ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAudits.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="p-1 border-r font-bold text-gray-800 text-[9px]">{log.action}</td>
                        <td className="p-1 border-r text-gray-600">{log.userEmail.split("@")[0]}</td>
                        <td className="p-1 border-r">
                          <span className={`font-bold px-1 text-[8px] uppercase ${
                            log.status === "SUCCESS"
                              ? "text-green-700 bg-green-50"
                              : log.status === "DENIED"
                              ? "text-amber-700 bg-amber-50"
                              : "text-red-700 bg-red-50"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-1 text-[9px] text-gray-400">{log.correlationId.substring(0, 8)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rollback Event Log */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 md:pl-4">
              <span className="text-[9px] font-mono font-bold uppercase text-brand-accent">Safely Reverted Exceptions</span>
              {rollbackLogs.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-mono text-gray-400 italic">
                  Zero rollback events. Transactions are clean.
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {rollbackLogs.map((rb) => (
                    <div key={rb.id} className="p-1.5 bg-red-50 border border-brand-accent text-[9px] font-mono text-red-900 leading-tight">
                      <p className="font-bold flex items-center gap-1 text-brand-accent">
                        <AlertTriangle className="w-3 h-3 text-brand-accent" /> TRANSACTION REVERTED
                      </p>
                      <p className="mt-1 font-semibold">{rb.reason}</p>
                      <p className="text-[8px] text-gray-500 mt-0.5">{new Date(rb.timestamp).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL D: REDIS QUEUE BACKGROUND JOBS */}
        <div className="bg-white border-2 border-brand-dark-bg p-4 shadow-tech-sm space-y-4 font-mono text-xs">
          <div className="border-b border-gray-200 pb-2">
            <h4 className="text-xs font-black uppercase text-brand-dark-bg flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-dark-bg" /> Redis Background queue
            </h4>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {backgroundJobs.map((job) => (
              <div key={job.id} className="p-2.5 border border-brand-dark-bg bg-gray-50/50">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-brand-dark-bg">{job.jobType}</span>
                  <span className={`text-[9px] font-semibold px-1 py-0.2 border ${
                    job.status === "COMPLETED"
                      ? "border-green-600 text-green-700 bg-green-50"
                      : job.status === "RUNNING"
                      ? "border-blue-600 text-blue-700 bg-blue-50 animate-pulse"
                      : "border-gray-400 text-gray-600 bg-gray-100"
                  }`}>
                    {job.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[9px] text-gray-500">
                    <span>Task ID: {job.id}</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5">
                    <div
                      className={`h-1.5 transition-all duration-500 ${
                        job.status === "COMPLETED" ? "bg-green-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-[8px] text-gray-400 text-right mt-1">Queued: {new Date(job.queuedAt).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL FOR SUBMITTING MOCK MAKER PROPOSAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-brand-dark-bg/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-brand-dark-bg shadow-tech-lg max-w-md w-full p-6 space-y-4 font-mono text-xs text-brand-dark-bg">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h4 className="font-black uppercase flex items-center gap-1 text-sm">
                <UserCheck className="w-4 h-4" /> Submit Maker Proposal
              </h4>
              <button onClick={() => setShowSubmitModal(false)} className="text-red-500 hover:font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMakerSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-gray-500">Workflow Type</label>
                <select
                  value={makerType}
                  onChange={(e: any) => {
                    const t = e.target.value;
                    setMakerType(t);
                    if (t === "EXPENSE") {
                      setMakerResourceId("exp-202");
                      setMakerAmount("2500");
                      setMakerNarration("Field visit lodging and taxi reimbursement claim.");
                    } else if (t === "ROLE") {
                      setMakerResourceId("emp-901");
                      setMakerAmount("");
                      setMakerNarration("Request role elevation for Rohan Sharma to Team Leader (M4).");
                    } else {
                      setMakerResourceId("case-001");
                      setMakerAmount("180000");
                      setMakerNarration("Proposed settlement haircut approval request.");
                    }
                  }}
                  className="w-full px-2.5 py-2 border-2 border-brand-dark-bg focus:outline-none"
                >
                  <option value="EXPENSE">EXPENSE CLAIM APPROVAL</option>
                  <option value="ROLE">ROLE PROMOTION APPROVAL</option>
                  <option value="RECOVERY">RECOVERY SETTLEMENT (HAIRCUT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-gray-500">Referenced Resource ID</label>
                <input
                  type="text"
                  required
                  value={makerResourceId}
                  onChange={(e) => setMakerResourceId(e.target.value)}
                  className="w-full px-2.5 py-2 border-2 border-brand-dark-bg focus:outline-none"
                />
              </div>

              {makerType === "EXPENSE" && (
                <div className="space-y-1">
                  <label className="font-bold text-[10px] uppercase text-gray-500">Claim Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={makerAmount}
                    onChange={(e) => setMakerAmount(e.target.value)}
                    className="w-full px-2.5 py-2 border-2 border-brand-dark-bg focus:outline-none"
                  />
                </div>
              )}

              {makerType === "RECOVERY" && (
                <div className="space-y-1">
                  <label className="font-bold text-[10px] uppercase text-gray-500">Proposed Payoff Settlement Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={makerAmount}
                    onChange={(e) => setMakerAmount(e.target.value)}
                    className="w-full px-2.5 py-2 border-2 border-brand-dark-bg focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[10px] uppercase text-gray-500">Justification / Narration</label>
                <textarea
                  required
                  rows={3}
                  value={makerNarration}
                  onChange={(e) => setMakerNarration(e.target.value)}
                  className="w-full px-2.5 py-2 border-2 border-brand-dark-bg focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-3.5 py-2 border-2 border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border-2 border-brand-dark-bg bg-brand-dark-bg text-white hover:bg-gray-800 cursor-pointer font-bold"
                >
                  Submit Maker Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
