/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Play, ArrowRight, CheckCircle2, XCircle, ShieldCheck, Terminal, RefreshCw, Key } from "lucide-react";

interface PipelineStep {
  name: string;
  description: string;
  icon: string;
}

export default function PipelineTrace() {
  const [selectedAction, setSelectedAction] = useState<"REALLOCATE" | "SETTLE_L1" | "SETTLE_L3">("SETTLE_L1");
  const [selectedRole, setSelectedRole] = useState<string>("RECOVERY_EXECUTIVE");
  const [isTracing, setIsTracing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [correlationId, setCorrelationId] = useState<string>("");
  const [traceLogs, setTraceLogs] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const steps: PipelineStep[] = [
    { name: "Correlation Tracing ID", description: "Injects standard transaction tracking X-Correlation-ID header.", icon: "id" },
    { name: "Security Hardening Headers", description: "Applies CSP, XSS-Blocking, HSTS, frame anchors and iframe restrictions.", icon: "shield" },
    { name: "Sliding-Window Rate Limiter", description: "Assesses Client IP/Tenant request thresholds (Limit: 120 RPM).", icon: "limit" },
    { name: "JWT Operator Hydration", description: "Verifies session payload and loads operator details from database.", icon: "key" },
    { name: "RBAC Permission Guard", description: "Asserts operator capability matches required authorization matrix.", icon: "lock" },
    { name: "Controller Execution", description: "Triggers domain application use-cases and transactional repositories.", icon: "cpu" },
    { name: "Audit Logger System", description: "Persists structured secure telemetry logs (WORM-compliant records).", icon: "database" }
  ];

  const getTraceVerdict = (action: string, role: string) => {
    if (action === "REALLOCATE") {
      // Reallocate requires Team Leader, Branch Mgr, Regional Mgr, Recovery Head
      return ["TEAM_LEADER", "BRANCH_MANAGER", "REGIONAL_MANAGER", "SUPER_ADMIN"].includes(role);
    }
    if (action === "SETTLE_L1") {
      // Settle L1 (15% haircut) requires Team Leader, Branch Mgr, Regional Mgr
      return ["TEAM_LEADER", "BRANCH_MANAGER", "REGIONAL_MANAGER", "SUPER_ADMIN"].includes(role);
    }
    if (action === "SETTLE_L3") {
      // Settle L3 (40% haircut) requires Regional Manager
      return ["REGIONAL_MANAGER", "SUPER_ADMIN"].includes(role);
    }
    return false;
  };

  const executeTrace = () => {
    setIsTracing(true);
    setCurrentStep(0);
    const generatedId = `tx-${Math.random().toString(36).substr(2, 9)}`;
    setCorrelationId(generatedId);
    setTraceLogs([]);
    setIsSuccess(null);

    const logs: string[] = [];
    let stepIdx = 0;

    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        let msg = "";
        const verdict = getTraceVerdict(selectedAction, selectedRole);

        switch (stepIdx) {
          case 0:
            msg = `[HTTP-IN] Received request | X-Correlation-ID generated: ${generatedId}`;
            break;
          case 1:
            msg = `[SECURITY] Hardening injected: Content-Security-Policy strict-origin, X-Frame-Options DENY applied successfully.`;
            break;
          case 2:
            msg = `[RATE-LIMIT] Tenant window checked. Client requests count: 42/120. Requests allowed.`;
            break;
          case 3:
            msg = `[AUTH] JWT Hydrated operator: ${selectedRole.toLowerCase()}@edros.net | Tenant isolated: tenant-delta`;
            break;
          case 4:
            if (!verdict && selectedAction !== "SETTLE_L3") {
              msg = `[FORBIDDEN] RBAC Violation: Role ${selectedRole} lacks ALLOCATE_CASE authority bounds.`;
            } else if (!verdict && selectedAction === "SETTLE_L3") {
              msg = `[FORBIDDEN] RBAC Violation: Role ${selectedRole} lacks L3 Haircut limit permissions (>30%).`;
            } else {
              msg = `[RBAC] Authorization verified. Permission matches required clearance metrics.`;
            }
            break;
          case 5:
            if (!verdict) {
              msg = `[HALT] Controller execution aborted. Status Code: 403 Forbidden.`;
            } else {
              msg = `[CONTROLLER] Execution success. Invoked DebtRecoveryUseCase. Database rows modified: 1.`;
            }
            break;
          case 6:
            msg = `[AUDIT] Log saved: ID=audit-${Math.random().toString(36).substr(2, 5)} | User=${selectedRole.toLowerCase()} | Status=${verdict ? "SUCCESS" : "DENIED"}`;
            setIsSuccess(verdict);
            break;
        }

        logs.push(msg);
        setTraceLogs([...logs]);
        setCurrentStep(stepIdx);
        stepIdx++;

        // Fast-fail pipeline if authorization fails at step 4
        if (stepIdx === 5 && !verdict) {
          // Skip directly to audit log block representing the failure path
          stepIdx = 6;
        }
      } else {
        clearInterval(interval);
        setIsTracing(false);
      }
    }, 1200);
  };

  return (
    <div id="pipeline-trace-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px] text-brand-dark-bg">
      {/* Selection Control Panel */}
      <div id="trace-setup" className="lg:grid-cols-4 lg:col-span-4 bg-white border-2 border-brand-dark-bg p-4 flex flex-col justify-between shadow-tech-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-brand-dark-bg border-b-2 border-brand-dark-bg pb-2 font-mono">
            Simulate Request Gate
          </h3>

          <div className="space-y-1.5 font-mono">
            <label className="text-xs font-bold uppercase text-brand-dark-bg/70">1. Target Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as any)}
              className="w-full bg-white border-2 border-brand-dark-bg p-2 text-xs font-bold text-brand-dark-bg outline-none"
              disabled={isTracing}
            >
              <option value="REALLOCATE">Reallocate Case to Rohan</option>
              <option value="SETTLE_L1">Approve L1 Settle (12% Haircut)</option>
              <option value="SETTLE_L3">Approve L3 Settle (40% Haircut)</option>
            </select>
          </div>

          <div className="space-y-1.5 font-mono">
            <label className="text-xs font-bold uppercase text-brand-dark-bg/70">2. Operator Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-white border-2 border-brand-dark-bg p-2 text-xs font-bold text-brand-dark-bg outline-none"
              disabled={isTracing}
            >
              <option value="RECOVERY_EXECUTIVE">Recovery Executive (Rohan)</option>
              <option value="TEAM_LEADER">Team Leader (Priya)</option>
              <option value="BRANCH_MANAGER">Branch Manager (Sharma)</option>
              <option value="REGIONAL_MANAGER">Regional Manager (Verma)</option>
            </select>
          </div>

          <div className="p-3 bg-brand-gray-light border-2 border-brand-dark-bg text-xs text-brand-dark-bg space-y-1 leading-relaxed shadow-tech-sm">
            <p className="font-bold text-brand-accent uppercase font-mono tracking-wider text-[10px]">Expected Boundary Rules:</p>
            {selectedAction === "REALLOCATE" && (
              <p className="font-sans">Executives cannot reallocate cases. Only Team Leaders, Branch Managers, or Regional Managers can.</p>
            )}
            {selectedAction === "SETTLE_L1" && (
              <p className="font-sans">L1 Settles (&lt;= 15% haircut) are within limits for Team Leaders, Branch Managers, and Regional Managers.</p>
            )}
            {selectedAction === "SETTLE_L3" && (
              <p className="font-sans">L3 Settles (40% haircut) require Regional Manager permissions. Lower roles will get rejected.</p>
            )}
          </div>
        </div>

        <button
          onClick={executeTrace}
          disabled={isTracing}
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white border-2 border-brand-dark-bg p-2.5 font-black uppercase text-xs font-mono shadow-tech cursor-pointer transition-all mt-4"
        >
          {isTracing ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> TRACING PIPELINE...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4 fill-white" /> EXECUTE TRACE
            </span>
          )}
        </button>
      </div>

      {/* Middleware Visual Flow chart */}
      <div id="trace-visualizer" className="lg:grid-cols-4 lg:col-span-4 bg-white border-2 border-brand-dark-bg p-4 overflow-y-auto flex flex-col shadow-tech-sm">
        <h3 className="text-sm font-black uppercase text-brand-dark-bg border-b-2 border-brand-dark-bg pb-2 mb-3 font-mono">
          Security Middleware Chain
        </h3>
        <div className="flex-1 flex flex-col justify-between pr-1">
          <div className="space-y-2">
            {steps.map((step, idx) => {
              const isPassed = currentStep > idx;
              const isCurrent = currentStep === idx;
              const isFailed = currentStep === idx && isSuccess === false && idx === 4;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-2.5 border-2 transition-all duration-300 ${
                    isFailed
                      ? "bg-brand-accent text-white border-brand-dark-bg shadow-tech-sm"
                      : isCurrent
                      ? "bg-brand-dark-bg text-white border-brand-dark-bg"
                      : isPassed
                      ? "bg-brand-gray-light border-brand-gray-mid text-brand-dark-bg/50 opacity-70"
                      : "bg-white border-brand-gray-mid text-brand-dark-bg/40"
                  }`}
                >
                  <span className={`text-[10px] font-mono font-black w-5 h-5 border flex items-center justify-center shrink-0 mt-0.5 ${
                    isFailed
                      ? "border-white text-white"
                      : isCurrent
                      ? "border-white text-brand-dark-bg bg-white"
                      : "border-brand-gray-mid text-brand-dark-bg/60"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-black font-mono ${isFailed ? "text-white" : isCurrent ? "text-white" : "text-brand-dark-bg"}`}>{step.name}</p>
                    <p className={`text-[10px] leading-tight mt-0.5 font-semibold ${isFailed || isCurrent ? "text-white/80" : "text-brand-dark-bg/60"}`}>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Terminal Telemetry / Result logs */}
      <div id="trace-terminal" className="lg:grid-cols-4 lg:col-span-4 bg-brand-dark-bg border-2 border-brand-dark-bg p-4 flex flex-col justify-between shadow-tech-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b-2 border-brand-gray-mid pb-2">
            <Terminal className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-mono font-black text-white uppercase tracking-wider">APM Real-Time Logs</span>
          </div>

          <div className="font-mono text-[11px] space-y-2 h-[340px] overflow-y-auto bg-brand-dark-bg text-brand-gray-mid p-1 pr-2 leading-relaxed">
            {traceLogs.length > 0 ? (
              traceLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.includes("[HALT]") || log.includes("[FORBIDDEN]")
                      ? "text-brand-accent font-black"
                      : log.includes("[SUCCESS]") || log.includes("[RBAC]")
                      ? "text-white font-black"
                      : "text-brand-gray-mid/80"
                  }`}
                >
                  {log}
                </div>
              ))
            ) : (
              <div className="text-brand-gray-mid/50 italic">Initialize pipeline trace to dump live server execution output...</div>
            )}
          </div>
        </div>

        {isSuccess !== null && (
          <div className={`mt-3 p-3 border-2 flex items-center gap-3 font-mono ${
            isSuccess
              ? "bg-[#44FF44]/15 border-white text-white"
              : "bg-brand-accent/20 border-brand-accent text-brand-accent"
          }`}>
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight">VERDICT: SUCCESS (200 OK)</p>
                  <p className="text-[10px] opacity-80 leading-tight">Database transaction committed securely with clean logs.</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight">VERDICT: FORBIDDEN (403)</p>
                  <p className="text-[10px] opacity-80 leading-tight">RBAC guard arrested execution. Transaction rolled back.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
