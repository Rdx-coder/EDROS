/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import {
  Layers,
  FolderOpen,
  Network,
  Users,
  Activity,
  Cpu,
  ShieldAlert,
  Server,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  LogOut,
  Sliders,
  TrendingUp,
  Landmark,
  Scale,
  PhoneCall,
  UserCheck,
  Terminal
} from "lucide-react";

import FolderExplorer from "./components/FolderExplorer";
import HierarchyChart from "./components/HierarchyChart";
import PipelineTrace from "./components/PipelineTrace";
import SandboxDI from "./components/SandboxDI";
import RbacMatrix from "./components/RbacMatrix";
import ConfigExporter from "./components/ConfigExporter";

// Import our newly created enterprise-grade operations views
import AuthScreen from "./components/edros/AuthScreen";
import DashboardView from "./components/edros/DashboardView";
import OrganizationView from "./components/edros/OrganizationView";
import EmployeeView from "./components/edros/EmployeeView";
import CustomerLoanView from "./components/edros/CustomerLoanView";
import RecoveryPipelineView from "./components/edros/RecoveryPipelineView";
import LegalCourtView from "./components/edros/LegalCourtView";
import DocumentsView from "./components/edros/DocumentsView";
import SettingsView from "./components/edros/SettingsView";
import WorkflowConsoleView from "./components/edros/WorkflowConsoleView";
import DevOpsCenterView from "./components/edros/DevOpsCenterView";

type ActiveTab = "EXPLORER" | "DIAGRAM" | "HIERARCHY" | "TRACE" | "DI_SANDBOX" | "RBAC" | "EXPORTER";
type ConsoleMode = "OPERATIONS" | "ARCHITECTURE";
type OperationsTab = "DASHBOARD" | "ORGANIZATION" | "EMPLOYEES" | "DEBTORS" | "RECOVERY" | "LEGAL" | "DOCUMENTS" | "SETTINGS" | "WORKFLOWS" | "DEVELOPER_OPS";

interface HealthCheckData {
  status: string;
  timestamp: string;
  engine: string;
  version: string;
  diContainerReady: boolean;
  isolationTenant: string;
}

interface LoggedInUser {
  id: string;
  email: string;
  role: string;
  token: string;
}

export default function App() {
  const [consoleMode, setConsoleMode] = useState<ConsoleMode>("OPERATIONS");
  const [activeTab, setActiveTab] = useState<ActiveTab>("EXPLORER");
  const [operationsTab, setOperationsTab] = useState<OperationsTab>("DASHBOARD");

  // Authentication State
  const [user, setUser] = useState<LoggedInUser | null>(null);

  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Poll Express API V1 Health endpoint to prove real container full-stack integration
  const fetchHealthStatus = () => {
    setHealthLoading(true);
    setHealthError(null);
    fetch("/api/v1/health")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then((data: HealthCheckData) => {
        setHealth(data);
        setHealthLoading(false);
      })
      .catch((err) => {
        setHealthError(err.message || "Failed to reach backend node.");
        setHealthLoading(false);
      });
  };

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setOperationsTab("DASHBOARD");
  };

  return (
    <div id="edros-workspace-wrapper" className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans select-none antialiased p-4 md:p-6 lg:p-8">
      {/* CENTRALIZED INDUSTRIAL BRUTALIST CONSOLE CONTEXT */}
      <div id="edros-workspace" className="w-full max-w-7xl mx-auto bg-brand-bg text-brand-text flex flex-col overflow-hidden border-4 md:border-8 border-brand-dark-bg shadow-tech-lg">
        {/* 1. ARCHITECT BRAND HEADER */}
        <header className="border-b-2 border-brand-dark-bg flex flex-col lg:flex-row lg:items-center lg:justify-between px-6 py-4 bg-brand-muted-bg gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-dark-bg flex items-center justify-center shrink-0">
              <div className="w-5 h-5 border-2 border-white rotate-45"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 font-mono">System Design Authority</span>
              <h1 className="text-xl font-black tracking-tight leading-none uppercase font-sans text-brand-dark-bg">EDROS / Enterprise Debt Recovery OS</h1>
            </div>
          </div>

          {/* Mode Switcher Group */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white border-2 border-brand-dark-bg p-1 font-mono text-xs shadow-tech-sm">
              <button
                onClick={() => setConsoleMode("OPERATIONS")}
                className={`px-3 py-1 font-bold cursor-pointer transition-all ${
                  consoleMode === "OPERATIONS" ? "bg-brand-dark-bg text-white" : "hover:bg-gray-100 text-brand-dark-bg"
                }`}
              >
                OPERATIONS DECK
              </button>
              <button
                onClick={() => setConsoleMode("ARCHITECTURE")}
                className={`px-3 py-1 font-bold cursor-pointer transition-all ${
                  consoleMode === "ARCHITECTURE" ? "bg-brand-dark-bg text-white" : "hover:bg-gray-100 text-brand-dark-bg"
                }`}
              >
                ARCHITECTURE HUB
              </button>
            </div>

            {/* Real-time server telemetry integration status */}
            <div className="flex items-center gap-3 bg-white border-2 border-brand-dark-bg p-1.5 text-[11px] font-mono shadow-tech-sm">
              <Server className="w-4 h-4 text-brand-dark-bg shrink-0" />
              <div className="flex items-center gap-1">
                {healthLoading ? (
                  <span className="text-amber-600 font-bold animate-pulse">Querying Backend...</span>
                ) : health ? (
                  <span className="text-brand-dark-bg font-black flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 border border-brand-dark-bg rounded-none"></span> API LIVE
                  </span>
                ) : (
                  <span className="text-brand-accent font-bold">DISCONNECTED</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Console layout depending on ConsoleMode */}
        {consoleMode === "OPERATIONS" ? (
          /* =========================================================================
             OPERATIONS CONSOLE MODE
             ========================================================================= */
          <div className="flex-1 flex flex-col bg-brand-bg min-h-[600px]">
            {!user ? (
              <div className="p-6 md:p-12 flex-1 flex items-center justify-center">
                <AuthScreen onLoginSuccess={(u) => setUser(u)} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Secondary Command bar & User Identity */}
                <div className="px-6 py-2 bg-white border-b-2 border-brand-dark-bg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span>
                      Operator: <span className="font-bold">{user.email}</span> • Authority: <span className="font-bold uppercase bg-gray-100 px-1.5 border border-gray-300 text-red-600">{user.role}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="self-start sm:self-auto flex items-center gap-1 font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out Gate
                  </button>
                </div>

                {/* Sub nav tab controllers */}
                <div className="p-4 bg-brand-muted-bg border-b-2 border-brand-dark-bg">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOperationsTab("DASHBOARD")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "DASHBOARD"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" /> Telemetry Dashboard
                    </button>

                    <button
                      onClick={() => setOperationsTab("ORGANIZATION")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "ORGANIZATION"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <Landmark className="w-4 h-4" /> Bank & Org Setups
                    </button>

                    <button
                      onClick={() => setOperationsTab("EMPLOYEES")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "EMPLOYEES"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <Users className="w-4 h-4" /> Staff Roster & Payroll
                    </button>

                    <button
                      onClick={() => setOperationsTab("DEBTORS")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "DEBTORS"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <Layers className="w-4 h-4" /> Debtors Registries
                    </button>

                    <button
                      onClick={() => setOperationsTab("RECOVERY")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "RECOVERY"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <PhoneCall className="w-4 h-4" /> Settlement Sandbox
                    </button>

                    <button
                      onClick={() => setOperationsTab("LEGAL")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "LEGAL"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <Scale className="w-4 h-4" /> Court & Notices Desk
                    </button>

                    <button
                      onClick={() => setOperationsTab("DOCUMENTS")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "DOCUMENTS"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <FileText className="w-4 h-4" /> Secure File Vault
                    </button>                     <button
                      onClick={() => setOperationsTab("SETTINGS")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "SETTINGS"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <Sliders className="w-4 h-4" /> RBAC & Profiles
                    </button>

                    <button
                      onClick={() => setOperationsTab("WORKFLOWS")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "WORKFLOWS"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <Cpu className="w-4 h-4" /> Workflows & Engines
                    </button>

                    <button
                      onClick={() => setOperationsTab("DEVELOPER_OPS")}
                      className={`px-3 py-1.5 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationsTab === "DEVELOPER_OPS"
                          ? "bg-brand-dark-bg text-white"
                          : "bg-white text-brand-dark-bg hover:bg-gray-100"
                      }`}
                    >
                      <Terminal className="w-4 h-4 text-red-600" /> Developer Ops (DOC)
                    </button>
                  </div>
                </div>

                {/* Operations active panel content viewport */}
                <div className="flex-1 bg-brand-gray-light p-4 md:p-6 min-h-[500px]">
                  {operationsTab === "DASHBOARD" && <DashboardView token={user.token} />}
                  {operationsTab === "ORGANIZATION" && <OrganizationView />}
                  {operationsTab === "EMPLOYEES" && <EmployeeView token={user.token} operatorEmail={user.email} />}
                  {operationsTab === "DEBTORS" && <CustomerLoanView token={user.token} />}
                  {operationsTab === "RECOVERY" && <RecoveryPipelineView token={user.token} operatorRole={user.role} />}
                  {operationsTab === "LEGAL" && <LegalCourtView token={user.token} />}
                  {operationsTab === "DOCUMENTS" && <DocumentsView />}
                  {operationsTab === "SETTINGS" && (
                    <SettingsView
                      operatorEmail={user.email}
                      operatorRole={user.role}
                      onUpdateOperatorRole={(newRole) => setUser({
                        ...user,
                        role: newRole,
                        token: `jwt-token-edros:${user.email}:${newRole}`
                      })}
                    />
                  )}
                  {operationsTab === "WORKFLOWS" && <WorkflowConsoleView token={user.token} />}
                  {operationsTab === "DEVELOPER_OPS" && (
                    <DevOpsCenterView
                      token={user.token}
                      operatorRole={user.role}
                      operatorEmail={user.email}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             ARCHITECTURE HUB PORTAL MODE
             ========================================================================= */
          <div className="flex-1 flex flex-col bg-brand-bg">
            {/* 2. OPERATIONAL TELEMETRY METRICS */}
            <div className="bg-brand-gray-light border-b-2 border-brand-dark-bg grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-brand-dark-bg">
              <div className="p-4 flex items-center gap-3.5 bg-white/10 hover:bg-white/30 transition-all">
                <div className="p-2 bg-brand-dark-bg text-white border border-brand-dark-bg shadow-tech-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-brand-dark-bg/70 font-semibold">Dependency Injection</p>
                  <p className="text-sm font-black text-brand-dark-bg">4 Singletons Registered</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3.5 bg-white/10 hover:bg-white/30 transition-all">
                <div className="p-2 bg-brand-dark-bg text-white border border-brand-dark-bg shadow-tech-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-brand-dark-bg/70 font-semibold">Org Hierarchy Layers</p>
                  <p className="text-sm font-black text-brand-dark-bg">State → Agent (5 Tiers)</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3.5 bg-white/10 hover:bg-white/30 transition-all">
                <div className="p-2 bg-brand-dark-bg text-white border border-brand-dark-bg shadow-tech-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-brand-dark-bg/70 font-semibold">API Gateway Security</p>
                  <p className="text-sm font-black text-brand-dark-bg">Rate Limiter + CSP + RBAC</p>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3.5 bg-white/10 hover:bg-white/30 transition-all">
                <div className="p-2 bg-brand-dark-bg text-white border border-brand-dark-bg shadow-tech-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-brand-dark-bg/70 font-semibold">Isolation Boundaries</p>
                  <p className="text-sm font-black text-brand-dark-bg">Multi-Tenant / Multi-Bank</p>
                </div>
              </div>
            </div>

            {/* 3. CORE VIEWPORT TABS COMMAND STRIP */}
            <div className="p-4 bg-brand-muted-bg border-b-2 border-brand-dark-bg">
              <h2 className="font-serif italic text-xs uppercase tracking-wider text-brand-dark-bg/60 mb-2.5">Workspace Modules / Boundary Commands</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab("EXPLORER")}
                  className={`px-4 py-2 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "EXPLORER"
                      ? "bg-brand-dark-bg text-white shadow-none"
                      : "bg-white text-brand-dark-bg hover:bg-brand-bg hover:shadow-tech-sm shadow-none"
                  }`}
                >
                  <FolderOpen className="w-4 h-4 shrink-0" /> 📁 Code File Explorer
                </button>

                <button
                  onClick={() => setActiveTab("DIAGRAM")}
                  className={`px-4 py-2 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "DIAGRAM"
                      ? "bg-brand-dark-bg text-white shadow-none"
                      : "bg-white text-brand-dark-bg hover:bg-brand-bg hover:shadow-tech-sm shadow-none"
                  }`}
                >
                  <Network className="w-4 h-4 shrink-0" /> 🔗 Dependency Boundaries
                </button>

                <button
                  onClick={() => setActiveTab("HIERARCHY")}
                  className={`px-4 py-2 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "HIERARCHY"
                      ? "bg-brand-dark-bg text-white shadow-none"
                      : "bg-white text-brand-dark-bg hover:bg-brand-bg hover:shadow-tech-sm shadow-none"
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" /> 🏢 Org Hierarchy Map
                </button>

                <button
                  onClick={() => setActiveTab("TRACE")}
                  className={`px-4 py-2 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "TRACE"
                      ? "bg-brand-dark-bg text-white shadow-none"
                      : "bg-white text-brand-dark-bg hover:bg-brand-bg hover:shadow-tech-sm shadow-none"
                  }`}
                >
                  <Activity className="w-4 h-4 shrink-0" /> ⚡ Middleware Pipeline Trace
                </button>

                <button
                  onClick={() => setActiveTab("DI_SANDBOX")}
                  className={`px-4 py-2 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "DI_SANDBOX"
                      ? "bg-brand-dark-bg text-white shadow-none"
                      : "bg-white text-brand-dark-bg hover:bg-brand-bg hover:shadow-tech-sm shadow-none"
                  }`}
                >
                  <Cpu className="w-4 h-4 shrink-0" /> ⚙️ Sandbox DI Resolution
                </button>

                <button
                  onClick={() => setActiveTab("RBAC")}
                  className={`px-4 py-2 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "RBAC"
                      ? "bg-brand-dark-bg text-white shadow-none"
                      : "bg-white text-brand-dark-bg hover:bg-brand-bg hover:shadow-tech-sm shadow-none"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" /> 🛡️ RBAC Permissions
                </button>

                <button
                  onClick={() => setActiveTab("EXPORTER")}
                  className={`px-4 py-2 text-xs font-bold border-2 border-brand-dark-bg font-mono flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "EXPORTER"
                      ? "bg-brand-dark-bg text-white shadow-none"
                      : "bg-white text-brand-dark-bg hover:bg-brand-bg hover:shadow-tech-sm shadow-none"
                  }`}
                >
                  <FileText className="w-4 h-4 shrink-0" /> 📝 Hardened Config Exporter
                </button>
              </div>
            </div>

            {/* 4. ACTIVE PORTAL VIEWPORT PANEL */}
            <div className="flex-1 bg-brand-gray-light p-4 md:p-6 min-h-[580px] flex flex-col justify-start text-brand-dark-bg">
              {activeTab === "EXPLORER" && <FolderExplorer />}

              {activeTab === "DIAGRAM" && (
                <div className="space-y-6 h-[550px] overflow-y-auto flex flex-col justify-between">
                  <div className="space-y-2 border-b-2 border-brand-dark-bg pb-3">
                    <h3 className="text-lg font-black uppercase text-brand-dark-bg flex items-center gap-2">
                      <Network className="w-5 h-5" /> Clean Architecture Module Dependency Boundaries
                    </h3>
                    <p className="text-xs font-mono text-brand-dark-bg/80">
                      The dependency rule is absolute: Dependencies strictly point inwards toward the pure Domain logic layer.
                    </p>
                  </div>

                  {/* Dynamic Vector/Canvas diagram representation in Swiss Grid style */}
                  <div className="flex-1 border-2 border-brand-dark-bg border-dashed flex flex-col lg:flex-row items-center justify-around gap-6 py-8 bg-white/40 p-4 shadow-tech-sm">
                    {/* 1. Presentation Node */}
                    <div className="p-4 bg-white border-2 border-brand-dark-bg text-center w-56 shadow-tech transition-all">
                      <span className="text-[9px] uppercase font-mono tracking-widest font-bold bg-brand-dark-bg text-white px-2 py-0.5">
                        Layer 4 (External)
                      </span>
                      <h4 className="text-sm font-bold text-brand-dark-bg mt-2 font-mono">Presentation Layer</h4>
                      <p className="text-[10px] text-brand-dark-bg/70 mt-1">Express API Routing & Security Middlewares</p>
                      <div className="mt-2 text-[10px] text-white font-mono bg-brand-dark-bg p-1.5">
                        req ──► RBAC Guard
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-brand-dark-bg shrink-0 rotate-90 lg:rotate-0" />

                    {/* 2. Application Node */}
                    <div className="p-4 bg-white border-2 border-brand-dark-bg text-center w-56 shadow-tech transition-all">
                      <span className="text-[9px] uppercase font-mono tracking-widest font-bold bg-brand-dark-bg text-white px-2 py-0.5">
                        Layer 3 (Workflows)
                      </span>
                      <h4 className="text-sm font-bold text-brand-dark-bg mt-2 font-mono">Application Layer</h4>
                      <p className="text-[10px] text-brand-dark-bg/70 mt-1">Orchestration workflows, transaction boundaries</p>
                      <div className="mt-2 text-[10px] text-white font-mono bg-brand-dark-bg p-1.5">
                        DebtRecoveryUseCase
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-brand-dark-bg shrink-0 rotate-90 lg:rotate-0" />

                    {/* 3. Domain Node */}
                    <div className="p-4 bg-white border-2 border-brand-accent text-center w-56 shadow-[4px_4px_0px_#FF4444] transition-all scale-[1.05]">
                      <span className="text-[9px] uppercase font-mono tracking-widest font-bold bg-brand-accent text-white px-2 py-0.5">
                        Layer 1 (Core)
                      </span>
                      <h4 className="text-sm font-bold text-brand-accent mt-2 font-mono">Domain Layer</h4>
                      <p className="text-[10px] text-brand-accent mt-1">Entities, Models, Repository contracts</p>
                      <div className="mt-2 text-[10px] text-white font-mono bg-brand-accent p-1.5 font-bold">
                        IDebtCaseRepository
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-brand-dark-bg shrink-0 rotate-90 lg:rotate-0" />

                    {/* 4. Infrastructure Inverted Node */}
                    <div className="p-4 bg-white border-2 border-brand-dark-bg text-center w-56 shadow-tech transition-all">
                      <span className="text-[9px] uppercase font-mono tracking-widest font-bold bg-brand-dark-bg text-white px-2 py-0.5">
                        Layer 2 (Adapters)
                      </span>
                      <h4 className="text-sm font-bold text-brand-dark-bg mt-2 font-mono">Infrastructure Layer</h4>
                      <p className="text-[10px] text-brand-dark-bg/70 mt-1">Postgres persistent, Redis rates caching</p>
                      <div className="mt-2 text-[10px] text-white font-mono bg-brand-dark-bg p-1.5">
                        Implements IDebtRepo
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-2 border-brand-dark-bg shadow-tech-sm space-y-2">
                    <h4 className="text-xs font-black text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-accent" /> Solid Dependency Inversion principle in Action
                    </h4>
                    <p className="text-xs text-brand-dark-bg leading-relaxed">
                      Notice how the Infrastructure Adapter (Postgres Database, etc.) depends ON the Domain contracts interfaces.
                      The code is inverted. This ensures changes to PostgreSQL, SQL queries, or migration tables do not bubble up or break your core domain logic!
                      It achieves maximum multi-tenant reliability and enables seamless mocking in local development profiles.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "HIERARCHY" && <HierarchyChart />}
              {activeTab === "TRACE" && <PipelineTrace />}
              {activeTab === "DI_SANDBOX" && <SandboxDI />}
              {activeTab === "RBAC" && <RbacMatrix />}
              {activeTab === "EXPORTER" && <ConfigExporter />}
            </div>
          </div>
        )}
      </div>

      {/* 5. PORT INGRESS FOOTER STATUS */}
      <footer className="border-t-2 border-brand-dark-bg bg-brand-dark-bg px-6 py-3 text-xs font-mono text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 shadow-tech">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-accent shrink-0" />
          <span>Ingress Gateway Listening: </span>
          <span className="text-brand-accent font-black">http://0.0.0.0:3000</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-none"></span> Multi-Tenant Secure Isolation
          </span>
          <span className="text-[10px] uppercase bg-white text-brand-dark-bg px-2 py-0.5 font-bold">
            SOLID compliant
          </span>
        </div>
      </footer>
    </div>
  );
}
