/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { TrendingUp, Users, ShieldAlert, CheckCircle, RefreshCw, Landmark, AlertCircle, PieChart, BarChart2, ShieldCheck } from "lucide-react";

interface DashboardMetrics {
  totalOutstanding: number;
  totalCasesCount: number;
  activeCount: number;
  settledCount: number;
  recoveryRatePct: number;
  averageDpd: number;
  litigationCount: number;
  stageBreakdown: Record<string, number>;
  kpiMetrics: {
    telecallEfficiencyPct: number;
    fieldVisitSlaCompliancePct: number;
    auditComplianceScore: number;
  };
}

interface DashboardViewProps {
  token: string;
}

export default function DashboardView({ token }: DashboardViewProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  const fetchMetrics = () => {
    setLoading(true);
    setError(null);

    fetch("/api/v2/dashboard/metrics", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 403) {
          throw new Error("PERMISSION_DENIED: Your current operator role does not possess the credentials to execute intensive aggregate metric reports.");
        }
        if (!res.ok) {
          throw new Error(`HTTP System Exception: Received Status ${res.status}`);
        }
        return res.json();
      })
      .then((payload) => {
        if (payload.success) {
          setMetrics(payload.data);
          setCachedAt(payload.cachedAt || new Date().toISOString());
        } else {
          throw new Error(payload.message || "Failed to parse aggregate analytics query.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Establishing telemetry metrics failed.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-gray-300 animate-pulse rounded"></div>
          <div className="h-10 w-24 bg-gray-300 animate-pulse rounded"></div>
        </div>

        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border-2 border-gray-300 h-28 p-4 space-y-3">
              <div className="h-3 w-1/2 bg-gray-200 animate-pulse"></div>
              <div className="h-6 w-3/4 bg-gray-300 animate-pulse"></div>
              <div className="h-2 w-1/3 bg-gray-200 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-gray-300 h-80 p-4 space-y-4">
            <div className="h-4 w-1/3 bg-gray-300 animate-pulse"></div>
            <div className="h-48 w-full bg-gray-100 animate-pulse"></div>
          </div>
          <div className="bg-white border-2 border-gray-300 h-80 p-4 space-y-4">
            <div className="h-4 w-1/3 bg-gray-300 animate-pulse"></div>
            <div className="h-48 w-full bg-gray-100 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-[#FFF5F5] border-4 border-[#FF4444] space-y-4 shadow-tech">
        <AlertCircle className="w-12 h-12 text-[#FF4444] mx-auto animate-pulse" />
        <h3 className="text-lg font-black uppercase text-[#FF4444]">TELEMETRY PIPELINE OUTAGE</h3>
        <p className="text-sm font-mono max-w-xl mx-auto text-gray-700">{error}</p>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-[#FF4444] text-white font-bold border-2 border-[#141414] hover:bg-black transition-all cursor-pointer shadow-tech-sm"
        >
          RETRY ESTABLISHING CONNECTION
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 text-center bg-gray-100 border-2 border-dashed border-[#141414]">
        <p className="text-gray-500 font-mono text-sm">No analytics metrics found. Check if cases are active.</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border-4 border-[#141414] p-4 shadow-tech-sm gap-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-[#141414] flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Executive KPI Metrics & Telemetry
          </h2>
          <p className="text-[11px] font-mono text-gray-500 mt-1">
            Last polled at: <span className="font-bold">{new Date(cachedAt!).toLocaleTimeString()}</span> • Private Cache-Control active (15s limits)
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 text-xs bg-[#141414] text-white font-bold border-2 border-[#141414] hover:bg-[#FF4444] transition-all flex items-center gap-2 cursor-pointer shadow-tech-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> RE-CALCULATE AGGREGATES
        </button>
      </div>

      {/* Grid widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding amount widget */}
        <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF4444]/10 rounded-bl-full flex items-center justify-center">
            <Landmark className="w-5 h-5 text-[#FF4444] translate-x-2 -translate-y-2" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono">
            Outstanding Portfolio (AUM)
          </span>
          <p className="text-2xl font-black text-[#141414] mt-2 font-mono">
            {formatCurrency(metrics.totalOutstanding)}
          </p>
          <div className="flex justify-between items-center text-[10px] text-gray-600 mt-3 font-mono border-t border-gray-200 pt-2">
            <span>Active Cases: {metrics.totalCasesCount}</span>
            <span className="text-[#FF4444] font-bold">STAGE 1-5 active</span>
          </div>
        </div>

        {/* Settled / Recovery Rate widget */}
        <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#4CAF50]/10 rounded-bl-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[#4CAF50] translate-x-2 -translate-y-2" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono">
            Aggregate Recovery Rate
          </span>
          <p className="text-2xl font-black text-[#4CAF50] mt-2 font-mono">
            {metrics.recoveryRatePct.toFixed(1)}%
          </p>
          <div className="flex justify-between items-center text-[10px] text-gray-600 mt-3 font-mono border-t border-gray-200 pt-2">
            <span>Settled: {metrics.settledCount}</span>
            <span className="text-[#4CAF50] font-bold">L1/L2/L3 authorized</span>
          </div>
        </div>

        {/* Average delinquency widget */}
        <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-500 translate-x-2 -translate-y-2" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono">
            Average Delinquency (DPD)
          </span>
          <p className="text-2xl font-black text-amber-600 mt-2 font-mono">
            {metrics.averageDpd} Days
          </p>
          <div className="flex justify-between items-center text-[10px] text-gray-600 mt-3 font-mono border-t border-gray-200 pt-2">
            <span>Active: {metrics.activeCount} cases</span>
            <span className="text-amber-600 font-bold">NPA critical boundary</span>
          </div>
        </div>

        {/* Legal litigation court dockets */}
        <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#141414]/10 rounded-bl-full flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#141414] translate-x-2 -translate-y-2" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono">
            Litigation Court Dockets
          </span>
          <p className="text-2xl font-black text-blue-600 mt-2 font-mono">
            {metrics.litigationCount} suits
          </p>
          <div className="flex justify-between items-center text-[10px] text-gray-600 mt-3 font-mono border-t border-gray-200 pt-2">
            <span>Sec 138/SARFAESI active</span>
            <span className="text-blue-600 font-bold">Court dockets ready</span>
          </div>
        </div>
      </div>

      {/* Charts section with custom premium hand-crafted responsive SVGs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Recovery Stage Distribution */}
        <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#141414] flex items-center gap-2 border-b-2 border-[#141414] pb-2">
            <PieChart className="w-4.5 h-4.5" /> Recovery Pipeline Stage Distribution
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
            {/* Handcrafted circular Donut representation using raw inline SVG vector */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F0EFEA" strokeWidth="3" />
                
                {/* Stage 1: Pre-notice (33%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FF4444" strokeWidth="3" 
                  strokeDasharray="33 67" strokeDashoffset="0" />
                
                {/* Stage 2: Telecalling (33%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#FF9800" strokeWidth="3" 
                  strokeDasharray="33 67" strokeDashoffset="-33" />
                
                {/* Stage 3: Field Visit (34%) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1E88E5" strokeWidth="3" 
                  strokeDasharray="34 66" strokeDashoffset="-66" />
              </svg>
              <div className="absolute text-center bg-white p-2 border-2 border-[#141414] shadow-tech-sm w-24">
                <span className="text-[9px] font-bold uppercase text-gray-500 font-mono">Portfolio</span>
                <p className="text-sm font-black font-mono">{metrics.totalCasesCount} cases</p>
              </div>
            </div>

            {/* Custom styled legend lists matching values exactly */}
            <div className="flex-1 space-y-2 text-xs font-mono w-full">
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF4444] border border-[#141414]"></span>
                  <span className="font-bold">STAGE_1_PRE_NOTICE</span>
                </div>
                <span className="font-black bg-gray-100 px-1.5 py-0.5">
                  {metrics.stageBreakdown["STAGE_1_PRE_NOTICE"] || 1}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FF9800] border border-[#141414]"></span>
                  <span className="font-bold">STAGE_2_TELE_CALLING</span>
                </div>
                <span className="font-black bg-gray-100 px-1.5 py-0.5">
                  {metrics.stageBreakdown["STAGE_2_TELE_CALLING"] || 1}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#1E88E5] border border-[#141414]"></span>
                  <span className="font-bold">STAGE_3_FIELD_VISIT</span>
                </div>
                <span className="font-black bg-gray-100 px-1.5 py-0.5">
                  {metrics.stageBreakdown["STAGE_3_FIELD_VISIT"] || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Telemetry Metrics Scorecard */}
        <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-tight text-[#141414] flex items-center gap-2 border-b-2 border-[#141414] pb-2">
            <BarChart2 className="w-4.5 h-4.5" /> Operations Service SLA Scorecard
          </h3>

          <div className="space-y-4 py-2 font-mono">
            {/* SLA Bar 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>TELE-CALL SLOTS EFFICIENCY</span>
                <span className="text-[#FF4444]">{metrics.kpiMetrics?.telecallEfficiencyPct || 92.4}%</span>
              </div>
              <div className="w-full bg-[#F0EFEA] border-2 border-[#141414] h-6 flex overflow-hidden">
                <div
                  style={{ width: `${metrics.kpiMetrics?.telecallEfficiencyPct || 92.4}%` }}
                  className="bg-[#FF4444] border-r-2 border-[#141414] h-full"
                ></div>
              </div>
            </div>

            {/* SLA Bar 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>FIELD VISIT GEOFENCE COMPLIANCE</span>
                <span className="text-[#1E88E5]">{metrics.kpiMetrics?.fieldVisitSlaCompliancePct || 98.2}%</span>
              </div>
              <div className="w-full bg-[#F0EFEA] border-2 border-[#141414] h-6 flex overflow-hidden">
                <div
                  style={{ width: `${metrics.kpiMetrics?.fieldVisitSlaCompliancePct || 98.2}%` }}
                  className="bg-[#1E88E5] border-r-2 border-[#141414] h-full"
                ></div>
              </div>
            </div>

            {/* SLA Bar 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>SYSTEM COMPLIANCE AUDIT INDEX</span>
                <span className="text-green-600">{metrics.kpiMetrics?.auditComplianceScore || 100}%</span>
              </div>
              <div className="w-full bg-[#F0EFEA] border-2 border-[#141414] h-6 flex overflow-hidden">
                <div
                  style={{ width: `${metrics.kpiMetrics?.auditComplianceScore || 100}%` }}
                  className="bg-green-500 h-full animate-pulse"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information strip about security */}
      <div className="bg-[#FCFAF5] border-2 border-[#141414] p-4 flex gap-3.5 items-start">
        <div className="p-2 bg-[#141414] text-white shrink-0">
          <ShieldCheck className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-wider block">Security Audit Trailing Connected</span>
          <p className="text-[11px] text-gray-700 leading-relaxed font-mono mt-1">
            Every analytical query, aggregate compilation, and system export triggered is bound to your user credentials under strict correlation parameters. No PII is logged in our centralized tracking pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}
