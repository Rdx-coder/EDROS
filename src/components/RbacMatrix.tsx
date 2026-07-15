/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ShieldCheck, Check, X, AlertCircle } from "lucide-react";

interface RolePermMap {
  role: string;
  name: string;
  description: string;
  permissions: {
    tenants: boolean;
    hierarchy: boolean;
    viewSensitive: boolean;
    allocate: boolean;
    settleL1: boolean;  // <= 15% haircut
    settleL2: boolean;  // <= 30% haircut
    settleL3: boolean;  // > 30% haircut
    litigate: boolean;
  };
  limitDesc: string;
}

export default function RbacMatrix() {
  const [activeRole, setActiveRole] = useState<string>("BRANCH_MANAGER");

  const matrix: RolePermMap[] = [
    {
      role: "SUPER_ADMIN",
      name: "Super Admin",
      description: "Full-scale platform-wide manager (cross-tenant administrative boundary operator).",
      permissions: { tenants: true, hierarchy: true, viewSensitive: true, allocate: true, settleL1: true, settleL2: true, settleL3: true, litigate: true },
      limitDesc: "No restriction limits. Operates across tenant boundaries."
    },
    {
      role: "TENANT_ADMIN",
      name: "Tenant Admin",
      description: "Administrator of the recovery agency, ARC, or law firm entity.",
      permissions: { tenants: false, hierarchy: true, viewSensitive: true, allocate: true, settleL1: true, settleL2: true, settleL3: true, litigate: true },
      limitDesc: "Bound strictly within tenant boundaries. Cannot add/modify other tenants."
    },
    {
      role: "BANK_COMPLIANCE",
      name: "Bank Compliance Officer",
      description: "Audit-only oversight representative of the partner bank.",
      permissions: { tenants: false, hierarchy: false, viewSensitive: true, allocate: false, settleL1: false, settleL2: false, settleL3: false, litigate: false },
      limitDesc: "Audit-only access. Cannot execute writes, reallocations, or authorize settlements."
    },
    {
      role: "RECOVERY_HEAD",
      name: "State/National Recovery Head",
      description: "Directs national recovery projects and oversees regional heads.",
      permissions: { tenants: false, hierarchy: true, viewSensitive: true, allocate: true, settleL1: true, settleL2: true, settleL3: true, litigate: true },
      limitDesc: "Full operational permissions inside the tenant portfolio."
    },
    {
      role: "REGIONAL_MANAGER",
      name: "Regional Manager",
      description: "Manages a specific state/regional group of branch office structures.",
      permissions: { tenants: false, hierarchy: false, viewSensitive: true, allocate: true, settleL1: true, settleL2: true, settleL3: true, litigate: true },
      limitDesc: "Authorized to approve L3 hair compromise proposals (unlimited haircuts)."
    },
    {
      role: "BRANCH_MANAGER",
      name: "Branch Manager",
      description: "Supervises team leads, office physical hubs, and localized campaigns.",
      permissions: { tenants: false, hierarchy: false, viewSensitive: true, allocate: true, settleL1: true, settleL2: true, settleL3: false, litigate: true },
      limitDesc: "Settlement Cap: Up to 30% hair write-offs (L2 Cap). Escalates larger compromises."
    },
    {
      role: "TEAM_LEADER",
      name: "Team Leader / Supervisor",
      description: "Manages a localized squadron of field/tele-recovery agents.",
      permissions: { tenants: false, hierarchy: false, viewSensitive: true, allocate: true, settleL1: true, settleL2: false, settleL3: false, litigate: false },
      limitDesc: "Settlement Cap: Up to 15% hair write-offs (L1 Cap). Escalates larger compromises."
    },
    {
      role: "RECOVERY_EXECUTIVE",
      name: "Recovery Executive",
      description: "Frontline collector, tele-caller, or field operations investigator.",
      permissions: { tenants: false, hierarchy: false, viewSensitive: false, allocate: false, settleL1: false, settleL2: false, settleL3: false, litigate: false },
      limitDesc: "Zero independent settlement or reallocation authority. Views basic debtor cards only."
    },
    {
      role: "LEGAL_COUNSEL",
      name: "Legal Counsel / Attorney",
      description: "Handles litigation notices, tribunal submissions, and ARC claims.",
      permissions: { tenants: false, hierarchy: false, viewSensitive: true, allocate: false, settleL1: false, settleL2: false, settleL3: false, litigate: true },
      limitDesc: "Dedicated to initiating legal litigation files and issuing formal demand letters."
    }
  ];

  const currentRoleMap = matrix.find((m) => m.role === activeRole) || matrix[5];

  const renderStatus = (val: boolean) => {
    return val ? (
      <Check className="w-4 h-4 text-brand-accent mx-auto stroke-[3]" />
    ) : (
      <X className="w-3.5 h-3.5 text-brand-dark-bg/30 mx-auto stroke-[2]" />
    );
  };

  return (
    <div id="rbac-matrix-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px] text-brand-dark-bg">
      {/* Interactive Roles Table List */}
      <div id="rbac-roles-list" className="lg:grid-cols-4 lg:col-span-4 bg-white border-2 border-brand-dark-bg p-4 overflow-y-auto flex flex-col space-y-2 shadow-tech-sm rounded-none">
        <h3 className="text-sm font-black uppercase text-brand-dark-bg border-b-2 border-brand-dark-bg pb-2 mb-2 font-mono">
          Enterprise Security Roles
        </h3>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {matrix.map((item) => (
            <div
              key={item.role}
              onClick={() => setActiveRole(item.role)}
              className={`p-2.5 border-2 text-left cursor-pointer transition-all ${
                activeRole === item.role
                  ? "bg-brand-dark-bg border-brand-dark-bg text-white font-bold shadow-none"
                  : "bg-white border-brand-dark-bg text-brand-dark-bg hover:bg-brand-gray-light hover:shadow-tech-sm"
              }`}
            >
              <p className="text-xs font-black font-mono">{item.role}</p>
              <p className={`text-[10px] truncate mt-0.5 ${activeRole === item.role ? "text-white/80" : "text-brand-dark-bg/60 font-semibold"}`}>{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Detail Matrix Grid */}
      <div id="rbac-matrix-detail" className="lg:grid-cols-8 lg:col-span-8 bg-white border-2 border-brand-dark-bg p-5 flex flex-col justify-between shadow-tech-sm rounded-none">
        <div className="space-y-4">
          <div className="border-b-2 border-brand-gray-light pb-3">
            <h3 className="text-base font-black uppercase text-brand-dark-bg flex items-center gap-2 font-sans">
              <ShieldCheck className="w-5 h-5 text-brand-accent" /> Security Role Inspector
            </h3>
            <p className="text-xs text-brand-accent font-black uppercase tracking-wider font-mono mt-1">{currentRoleMap.role}</p>
            <p className="text-xs text-brand-dark-bg mt-1.5 leading-relaxed font-sans">{currentRoleMap.description}</p>
          </div>

          {/* Matrix Checklist Table */}
          <div className="bg-white border-2 border-brand-dark-bg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shadow-tech-sm">
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">Manage Tenants</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.tenants)}</div>
            </div>
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">Manage Org</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.hierarchy)}</div>
            </div>
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">Sensitive PII</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.viewSensitive)}</div>
            </div>
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">Allocate Cases</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.allocate)}</div>
            </div>
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">L1 Compromise</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.settleL1)}</div>
            </div>
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">L2 Compromise</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.settleL2)}</div>
            </div>
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">L3 Compromise</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.settleL3)}</div>
            </div>
            <div className="p-2 border-2 border-brand-dark-bg bg-brand-gray-light">
              <p className="text-[10px] font-mono font-bold text-brand-dark-bg/70 uppercase">Litigate File</p>
              <div className="mt-1">{renderStatus(currentRoleMap.permissions.litigate)}</div>
            </div>
          </div>

          <div className="p-3.5 bg-brand-accent/5 border-2 border-brand-accent flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-brand-accent uppercase font-mono">Authority Limitation Summary</p>
              <p className="text-xs text-brand-dark-bg mt-1 font-sans">{currentRoleMap.limitDesc}</p>
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-brand-dark-bg/60 border-t-2 border-brand-gray-light pt-4 mt-6">
          Architect Tip: Notice how the L1/L2/L3 settlement checks are performed at the Application Service layer to avoid route validation bypasses.
        </div>
      </div>
    </div>
  );
}
