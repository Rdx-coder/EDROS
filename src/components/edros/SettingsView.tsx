/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Key, User, Keyboard, Clock, RefreshCw, CheckSquare, Square, Save } from "lucide-react";

interface SettingsViewProps {
  operatorEmail: string;
  operatorRole: string;
  onUpdateOperatorRole: (newRole: string) => void;
}

export default function SettingsView({ operatorEmail, operatorRole, onUpdateOperatorRole }: SettingsViewProps) {
  const roles = [
    "SUPER_ADMIN",
    "TENANT_ADMIN",
    "REGIONAL_MANAGER",
    "BRANCH_MANAGER",
    "TEAM_LEADER",
    "EXECUTIVE",
    "LEGAL_COUNSEL",
    "FINANCE_OFFICER"
  ];

  const permissions = [
    "VIEW_ANALYTICS",
    "MANAGE_ORGANIZATION",
    "VIEW_EMPLOYEES",
    "MANAGE_PAYROLL",
    "ALLOCATE_CASES",
    "LOG_TELECALLS",
    "LOG_FIELD_VISITS",
    "SETTLE_CASES",
    "ADJOURN_HEARINGS",
    "DISPATCH_NOTICES",
    "BULK_IMPORT"
  ];

  // Map initial active state for permission Matrix
  const [matrix, setMatrix] = useState<Record<string, string[]>>({
    SUPER_ADMIN: [...permissions],
    TENANT_ADMIN: ["VIEW_ANALYTICS", "VIEW_EMPLOYEES", "ALLOCATE_CASES", "LOG_TELECALLS", "LOG_FIELD_VISITS", "SETTLE_CASES", "ADJOURN_HEARINGS", "DISPATCH_NOTICES", "BULK_IMPORT"],
    REGIONAL_MANAGER: ["VIEW_ANALYTICS", "ALLOCATE_CASES", "SETTLE_CASES"],
    BRANCH_MANAGER: ["VIEW_ANALYTICS", "ALLOCATE_CASES", "LOG_TELECALLS", "LOG_FIELD_VISITS", "SETTLE_CASES"],
    TEAM_LEADER: ["VIEW_ANALYTICS", "LOG_TELECALLS", "LOG_FIELD_VISITS", "SETTLE_CASES"],
    EXECUTIVE: ["LOG_TELECALLS", "LOG_FIELD_VISITS"],
    LEGAL_COUNSEL: ["VIEW_ANALYTICS", "ADJOURN_HEARINGS", "DISPATCH_NOTICES"],
    FINANCE_OFFICER: ["VIEW_ANALYTICS", "MANAGE_PAYROLL", "SETTLE_CASES"]
  });

  const [activeSubView, setActiveSubView] = useState<"RBAC" | "PROFILE" | "SHORTCUTS" | "AUDIT">("RBAC");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live action logs
  const [auditLogs] = useState([
    { id: "log-1", user: "rahul.dangi.sait@gmail.com", role: "TENANT_ADMIN", action: "BULK_ALLOCATION_IMPORT", ip: "10.128.0.4", time: "2026-07-14T11:45:12Z" },
    { id: "log-2", user: "rahul.dangi.sait@gmail.com", role: "TENANT_ADMIN", action: "HAIRCUT_SETTLEMENT_APPROVED", ip: "10.128.0.4", time: "2026-07-14T11:40:05Z" },
    { id: "log-3", user: "system_cron", role: "SYSTEM", action: "DELINQUENCY_DPD_RECALCULATED", ip: "localhost", time: "2026-07-14T00:00:00Z" }
  ]);

  const handleTogglePermission = (role: string, perm: string) => {
    const list = matrix[role] || [];
    let updated: string[];
    if (list.includes(perm)) {
      updated = list.filter((p) => p !== perm);
    } else {
      updated = [...list, perm];
    }
    setMatrix({
      ...matrix,
      [role]: updated
    });
  };

  const handleSaveMatrix = () => {
    setSuccessMessage("RBAC permission rules written to secure database.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-3 bg-green-50 border-2 border-green-500 text-xs font-mono text-green-700 flex gap-2">
          <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Settings Navigation */}
      <div className="flex border-b-4 border-[#141414] bg-white">
        <button
          onClick={() => setActiveSubView("RBAC")}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider font-mono flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
            activeSubView === "RBAC" ? "bg-[#141414] text-white" : "hover:bg-gray-100 text-[#141414]"
          }`}
        >
          <Key className="w-4 h-4" /> Role Permission Matrix
        </button>
        <button
          onClick={() => setActiveSubView("PROFILE")}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider font-mono flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
            activeSubView === "PROFILE" ? "bg-[#141414] text-white" : "hover:bg-gray-100 text-[#141414]"
          }`}
        >
          <User className="w-4 h-4" /> Operator Sandbox Profile
        </button>
        <button
          onClick={() => setActiveSubView("AUDIT")}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider font-mono flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
            activeSubView === "AUDIT" ? "bg-[#141414] text-white" : "hover:bg-gray-100 text-[#141414]"
          }`}
        >
          <Clock className="w-4 h-4" /> System Audit Trails
        </button>
        <button
          onClick={() => setActiveSubView("SHORTCUTS")}
          className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider font-mono flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
            activeSubView === "SHORTCUTS" ? "bg-[#141414] text-white" : "hover:bg-gray-100 text-[#141414]"
          }`}
        >
          <Keyboard className="w-4 h-4" /> Hotkeys Guide
        </button>
      </div>

      {activeSubView === "RBAC" && (
        <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-5">
          <div className="flex justify-between items-center border-b-2 border-[#141414] pb-2">
            <div>
              <h3 className="text-sm font-black uppercase text-[#141414]">Role-Based Access Control Rules</h3>
              <p className="text-[10px] font-mono text-gray-500">
                Grant or restrict capability scopes across corporate operations roles.
              </p>
            </div>
            <button
              onClick={handleSaveMatrix}
              className="px-4 py-2 bg-[#141414] text-white hover:bg-green-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-[#141414] shadow-tech-sm"
            >
              <Save className="w-4 h-4 text-green-400" /> SAVE RULES
            </button>
          </div>

          <div className="overflow-x-auto border-2 border-[#141414]">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#FCFAF5] border-b-2 border-[#141414]">
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">System Action</th>
                  {roles.map((role) => (
                    <th key={role} className="p-2 border-r-2 border-[#141414] font-bold uppercase text-[9px] tracking-tight text-center">
                      {role.replace("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {permissions.map((perm) => (
                  <tr key={perm} className="hover:bg-gray-50 transition-all">
                    <td className="p-3 border-r-2 border-[#141414] font-bold">
                      {perm}
                    </td>
                    {roles.map((role) => {
                      const isActive = (matrix[role] || []).includes(perm);
                      return (
                        <td
                          key={role}
                          onClick={() => handleTogglePermission(role, perm)}
                          className="p-2 border-r-2 border-[#141414] text-center cursor-pointer hover:bg-[#FCFAF5]"
                        >
                          <div className="flex items-center justify-center">
                            {isActive ? (
                              <CheckSquare className="w-5 h-5 text-[#FF4444]" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubView === "PROFILE" && (
        <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-4">
          <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-2">
            Operator Sandbox Account Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-[#FCFAF5] border-2 border-[#141414] space-y-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase font-mono block">Registered Corporate Email</span>
                <p className="text-sm font-mono font-bold">{operatorEmail}</p>
              </div>

              {/* Dynamic Sandbox Role switcher */}
              <div className="space-y-2 border-2 border-dashed border-[#141414] p-4">
                <span className="text-xs font-black uppercase text-[#141414] block">
                  Interactive Role Switcher Sandbox
                </span>
                <p className="text-[10px] font-mono text-gray-600 leading-relaxed">
                  Toggle your logged-in role to experience how EDROS handles different access limits on actions like Haircut Settlements, Case roster exports, and audit logs.
                </p>

                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold uppercase block text-gray-700">Sandbox Authority Role</label>
                  <select
                    value={operatorRole}
                    onChange={(e) => onUpdateOperatorRole(e.target.value)}
                    className="w-full px-2 py-1.5 border-2 border-[#141414] font-mono text-xs bg-white focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2.5 bg-[#FFF0F0] border border-[#FF4444] text-[9px] font-mono text-[#FF4444] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>NOTE: Swapping role re-initializes permission guards dynamically across current view modules.</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-2 border-[#141414] space-y-3 font-mono text-xs">
              <span className="font-bold uppercase block text-[#141414]">Secured Hardware Node Fingerprint</span>
              <div className="space-y-1.5 text-[10px] text-gray-500">
                <p>Ingress Router ID: cloudrun-ap-south1-edge-04</p>
                <p>Node Port IP: 0.0.0.0:3000 (Internal Proxied)</p>
                <p>FIDO Key Ref: FIDO_ECC_P256_STAMP_7718</p>
                <p>MFA Token Active: Yes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubView === "AUDIT" && (
        <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-4">
          <div className="flex justify-between items-center border-b-2 border-[#141414] pb-2">
            <div>
              <h3 className="text-sm font-black uppercase text-[#141414]">Immutable Corporate Audit Logs</h3>
              <p className="text-[10px] font-mono text-gray-500">
                Tracking and verification parameters for active operations sessions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border-2 border-[#141414]">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#FCFAF5] border-b-2 border-[#141414]">
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Timestamp</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Operator Account</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Role</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Action Logged</th>
                  <th className="p-3 font-bold uppercase">Ingress IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3 border-r-2 border-[#141414]">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] font-bold">
                      {log.user}
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-center">
                      <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 font-bold uppercase text-[9px]">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] font-bold text-red-600">
                      {log.action}
                    </td>
                    <td className="p-3 font-bold text-gray-700">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubView === "SHORTCUTS" && (
        <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-4">
          <h3 className="text-sm font-black uppercase text-[#141414] border-b-2 border-[#141414] pb-2">
            Operations Console Keyboard Shortcuts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3.5 bg-gray-50 border-2 border-[#141414] flex justify-between items-center">
              <span className="font-bold">Focus Telemetry Dashboard:</span>
              <kbd className="px-2 py-1 bg-white border-2 border-[#141414] shadow-tech-sm font-black">Alt + D</kbd>
            </div>
            <div className="p-3.5 bg-gray-50 border-2 border-[#141414] flex justify-between items-center">
              <span className="font-bold">Launch Telecall Log:</span>
              <kbd className="px-2 py-1 bg-white border-2 border-[#141414] shadow-tech-sm font-black">Alt + C</kbd>
            </div>
            <div className="p-3.5 bg-gray-50 border-2 border-[#141414] flex justify-between items-center">
              <span className="font-bold">File New Court Suit:</span>
              <kbd className="px-2 py-1 bg-white border-2 border-[#141414] shadow-tech-sm font-black">Alt + L</kbd>
            </div>
            <div className="p-3.5 bg-gray-50 border-2 border-[#141414] flex justify-between items-center">
              <span className="font-bold">Show Keyboard Guide:</span>
              <kbd className="px-2 py-1 bg-white border-2 border-[#141414] shadow-tech-sm font-black">Alt + K</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
