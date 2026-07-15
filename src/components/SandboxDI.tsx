/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Key, Layers, RefreshCw, Cpu, Database, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ServiceMetadata {
  key: string;
  implementation: string;
  methods: string[];
  role: string;
  dependencyOf: string[];
  codeSnippet: string;
}

export default function SandboxDI() {
  const [selectedKey, setSelectedKey] = useState<string>("IDebtCaseRepository");
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolvedService, setResolvedService] = useState<ServiceMetadata | null>({
    key: "IDebtCaseRepository",
    implementation: "InMemoryDebtCaseRepository",
    methods: [
      "findById(id: string, tenantId: string): Promise<DebtCase | null>",
      "findByBankId(bankId: string, tenantId: string): Promise<DebtCase[]>",
      "save(debtCase: DebtCase): Promise<DebtCase>",
      "searchCases(tenantId: string, filters: any): Promise<DebtCase[]>"
    ],
    role: "Decouples debt portfolio search and state preservation logic from Express or specific database drivers (e.g. Postgres vs SQL). Allows quick local simulation.",
    dependencyOf: ["DebtRecoveryUseCase", "Express Cases Routing Controller"],
    codeSnippet: "DIContainer.register('IDebtCaseRepository', new InMemoryDebtCaseRepository());"
  });

  const registry: Record<string, ServiceMetadata> = {
    IDebtCaseRepository: {
      key: "IDebtCaseRepository",
      implementation: "InMemoryDebtCaseRepository",
      methods: [
        "findById(id: string, tenantId: string): Promise<DebtCase | null>",
        "findByBankId(bankId: string, tenantId: string): Promise<DebtCase[]>",
        "save(debtCase: DebtCase): Promise<DebtCase>",
        "searchCases(tenantId: string, filters: any): Promise<DebtCase[]>"
      ],
      role: "Decouples debt portfolio search and state preservation logic from Express or specific database drivers (e.g. Postgres vs SQL). Allows quick local simulation.",
      dependencyOf: ["DebtRecoveryUseCase", "Express Cases Routing Controller"],
      codeSnippet: "DIContainer.register('IDebtCaseRepository', new InMemoryDebtCaseRepository());"
    },
    IUserRepository: {
      key: "IUserRepository",
      implementation: "InMemoryUserRepository",
      methods: [
        "findById(id: string, tenantId: string): Promise<User | null>",
        "findByEmail(email: string): Promise<User | null>",
        "findHierarchyReporting(managerId: string): Promise<User[]>",
        "save(user: User): Promise<User>"
      ],
      role: "Manages user state, geographical state/branch hierarchies, reporting guidelines, and authentication verification profiles.",
      dependencyOf: ["DebtRecoveryUseCase", "authenticateOperator Middleware"],
      codeSnippet: "DIContainer.register('IUserRepository', new InMemoryUserRepository());"
    },
    IAuditLogRepository: {
      key: "IAuditLogRepository",
      implementation: "InMemoryAuditLogRepository",
      methods: [
        "log(auditLog: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>",
        "findByTenantId(tenantId: string, limit?: number): Promise<AuditLog[]>",
        "findByCorrelationId(correlationId: string): Promise<AuditLog[]>"
      ],
      role: "Executes immutable log actions. Structured auditing intercepts actions across all modules for banking telemetry audits.",
      dependencyOf: ["DebtRecoveryUseCase", "globalErrorHandler", "auditLog API Controller"],
      codeSnippet: "DIContainer.register('IAuditLogRepository', new InMemoryAuditLogRepository());"
    },
    DebtRecoveryUseCase: {
      key: "DebtRecoveryUseCase",
      implementation: "DebtRecoveryUseCase Service",
      methods: [
        "allocateCase(caseId: string, executiveId: string, operator: User, correlationId: string): Promise<DebtCase>",
        "approveSettlement(caseId: string, settlementAmount: number, approver: User, correlationId: string): Promise<DebtCase>"
      ],
      role: "Primary use case service layer. Governs allocation approvals and L1/L2/L3 settlement haircut limitations based on the current executive hierarchy.",
      dependencyOf: ["Express Cases / Settlement API Routing Handlers"],
      codeSnippet: "DIContainer.register('DebtRecoveryUseCase', new DebtRecoveryUseCase(debtRepo, userRepo, auditRepo));"
    }
  };

  const handleResolve = () => {
    setIsResolving(true);
    setResolvedService(null);
    setTimeout(() => {
      setResolvedService(registry[selectedKey]);
      setIsResolving(false);
    }, 800);
  };

  return (
    <div id="sandbox-di-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px] text-brand-dark-bg">
      {/* Registry Selector */}
      <div id="di-selector" className="lg:grid-cols-4 lg:col-span-4 bg-white border-2 border-brand-dark-bg p-4 flex flex-col justify-between shadow-tech-sm">
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-brand-dark-bg border-b-2 border-brand-dark-bg pb-2 font-mono">
            Active DI Registry Keys
          </h3>

          <div className="space-y-2">
            {Object.keys(registry).map((key) => {
              const isSelected = selectedKey === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-brand-dark-bg border-brand-dark-bg text-white font-bold shadow-none"
                      : "bg-white border-brand-dark-bg text-brand-dark-bg hover:bg-brand-gray-light hover:shadow-tech-sm"
                  }`}
                >
                  <Key className={`w-4 h-4 shrink-0 ${isSelected ? "text-white" : "text-brand-dark-bg"}`} />
                  <span className="font-mono text-xs">{key}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleResolve}
          disabled={isResolving}
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white border-2 border-brand-dark-bg p-2.5 font-black uppercase text-xs font-mono shadow-tech cursor-pointer transition-all mt-4"
        >
          {isResolving ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> RESOLVING INSTANCE...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Layers className="w-4 h-4" /> RESOLVE ACTIVE KEY
            </span>
          )}
        </button>
      </div>

      {/* Dependency Resolution Inspector */}
      <div id="di-inspector" className="lg:grid-cols-8 lg:col-span-8 bg-white border-2 border-brand-dark-bg p-5 overflow-y-auto flex flex-col justify-between shadow-tech-sm">
        {isResolving ? (
          <div className="flex flex-col items-center justify-center text-center h-full text-brand-dark-bg/60 space-y-3 font-mono">
            <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
            <p className="text-sm font-bold uppercase">Querying DIContainer.resolve('{selectedKey}')...</p>
          </div>
        ) : resolvedService ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b-2 border-brand-gray-light pb-3">
              <div>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 font-bold bg-brand-dark-bg text-white border border-brand-dark-bg">
                  Resolved Instance
                </span>
                <h3 className="text-base font-black text-brand-dark-bg font-mono mt-2">
                  {resolvedService.implementation}
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono font-black bg-brand-muted-bg text-brand-dark-bg border-2 border-brand-dark-bg px-2.5 py-1 flex items-center gap-1.5 shadow-tech-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent" /> Singleton Resolved
              </span>
            </div>

            {/* Architectural Role */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-brand-dark-bg flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-brand-accent" /> Architectural Domain Role
              </h4>
              <p className="text-sm text-brand-dark-bg leading-relaxed font-sans">{resolvedService.role}</p>
            </div>

            {/* Methods Interfaces Signatures */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-brand-dark-bg flex items-center gap-1.5 font-mono">
                <Database className="w-3.5 h-3.5 text-brand-accent" /> Interface Methods Signature
              </h4>
              <div className="bg-[#141414] border-2 border-brand-dark-bg p-3 font-mono text-[11px] text-[#D1D0CC] space-y-1.5 shadow-tech-sm">
                {resolvedService.methods.map((method, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    <span className="text-brand-accent shrink-0 font-bold">public</span>
                    <span className="text-white truncate font-medium">{method}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dependencies mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t-2 border-brand-gray-light">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-dark-bg/60 uppercase font-mono">Injectable Dependency Of:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {resolvedService.dependencyOf.map((d, idx) => (
                    <span key={idx} className="text-[10px] bg-brand-muted-bg border border-brand-dark-bg text-brand-dark-bg px-2 py-0.5 font-mono font-bold uppercase">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-dark-bg/60 uppercase font-mono">Registration Code:</span>
                <div className="bg-[#141414] border-2 border-brand-dark-bg p-2 mt-1 font-mono text-[10px] text-[#D1D0CC] truncate shadow-tech-sm">
                  {resolvedService.codeSnippet}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-brand-dark-bg/40">
            <Layers className="w-12 h-12 text-brand-dark-bg/20 mb-2" />
            <p className="text-sm font-bold uppercase font-mono">Select a service and execute resolution above.</p>
          </div>
        )}

        <div className="text-[11px] font-mono text-brand-dark-bg/60 border-t-2 border-brand-gray-light pt-4 mt-6 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          DI completely isolates layers. Domain code is 100% decoupled from third-party frameworks.
        </div>
      </div>
    </div>
  );
}
