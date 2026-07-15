/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Landmark, PhoneCall, MapPin, BadgePercent, ShieldCheck, RefreshCw, AlertCircle, PlusCircle, CheckCircle, Smartphone } from "lucide-react";

interface Case {
  id: string;
  accountNumber: string;
  debtorName: string;
  outstandingAmount: number;
  delinquencyDays: number;
  stage: string;
  status: string;
  allocatedExecutiveId: string | null;
}

interface RecoveryPipelineViewProps {
  token: string;
  operatorRole: string;
}

export default function RecoveryPipelineView({ token, operatorRole }: RecoveryPipelineViewProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected state
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"CALL" | "VISIT" | "SETTLE">("CALL");

  // Call form states
  const [disposition, setDisposition] = useState("PROMISE_TO_PAY");
  const [callNotes, setCallNotes] = useState("");
  const [ptpAmount, setPtpAmount] = useState("");
  const [ptpDate, setPtpDate] = useState("");

  // Visit form states
  const [lat, setLat] = useState("19.0760"); // default Mumbai coordinates
  const [lng, setLng] = useState("72.8777");
  const [visitStatus, setVisitStatus] = useState("CONTACTED_DEBTOR");
  const [visitNotes, setVisitNotes] = useState("");

  // Settlement Form states
  const [proposedAmount, setProposedAmount] = useState("");
  const [haircutPct, setHaircutPct] = useState(0);
  const [authTier, setAuthTier] = useState("L1");
  const [reqRole, setReqRole] = useState("TEAM_LEADER");

  const fetchCases = () => {
    setLoading(true);
    setError(null);

    fetch("/api/v2/cases", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (payload.success) {
          setCases(payload.data);
          if (payload.data.length > 0 && !selectedCase) {
            setSelectedCase(payload.data[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load recovery cases.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCases();
  }, [token]);

  // Recalculate haircut percentage on change
  useEffect(() => {
    if (!selectedCase || !proposedAmount || isNaN(Number(proposedAmount))) {
      setHaircutPct(0);
      return;
    }
    const propVal = Number(proposedAmount);
    const outstanding = selectedCase.outstandingAmount;

    if (propVal >= outstanding) {
      setHaircutPct(0);
      return;
    }

    const cutAmt = outstanding - propVal;
    const pct = (cutAmt / outstanding) * 100;
    setHaircutPct(pct);

    // Calc required authority
    if (pct <= 15) {
      setAuthTier("L1");
      setReqRole("TEAM_LEADER");
    } else if (pct > 15 && pct <= 30) {
      setAuthTier("L2");
      setReqRole("BRANCH_MANAGER");
    } else {
      setAuthTier("L3");
      setReqRole("REGIONAL_MANAGER");
    }
  }, [proposedAmount, selectedCase]);

  const handleRegisterCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/v2/cases/${selectedCase.id}/calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        disposition,
        notes: callNotes,
        ptpAmount: ptpAmount ? Number(ptpAmount) : undefined,
        ptpDate: ptpDate || undefined
      })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Tele-call log registered successfully. Stage updated.`);
          setCallNotes("");
          setPtpAmount("");
          setPtpDate("");
          fetchCases();
        } else {
          setError(payload.message || "Failed to log call.");
        }
      })
      .catch((err) => setError(err.message));
  };

  const handleRegisterVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/v2/cases/${selectedCase.id}/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        latitude: Number(lat),
        longitude: Number(lng),
        contactStatus: visitStatus,
        summary: visitNotes
      })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Field visit registered. GPS coordinate stamp validated.`);
          setVisitNotes("");
          fetchCases();
        } else {
          setError(payload.message || "Failed to register visit.");
        }
      })
      .catch((err) => setError(err.message));
  };

  const handleAuthorizeSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/v2/cases/${selectedCase.id}/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        proposedAmount: Number(proposedAmount)
      })
    })
      .then((res) => {
        if (res.status === 403) {
          throw new Error(`LIMIT_EXCEEDED: Your current operator role (${operatorRole}) is restricted. This haircut of ${haircutPct.toFixed(1)}% (${authTier} tier) requires ${reqRole} approval power.`);
        }
        return res.json();
      })
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Settlement authorized successfully at the ${authTier} level. Final payoff received.`);
          setProposedAmount("");
          fetchCases();
        } else {
          setError(payload.message || "Settlement approval failed.");
        }
      })
      .catch((err) => setError(err.message));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading && cases.length === 0) {
    return <div className="h-44 bg-white border-2 border-gray-300 animate-pulse"></div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-[#FFF0F0] border-2 border-[#FF4444] p-3 text-xs text-[#FF4444] font-mono flex gap-2 items-start shadow-tech-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase block">PIPELINE_ERROR:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-[#EBF7FF] border-2 border-[#1E88E5] p-3 text-xs text-[#1E88E5] font-mono flex gap-2 items-start shadow-tech-sm">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase block">ACTION_COMMITTED:</span>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Selector Sidebar */}
        <div className="lg:col-span-1 bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-4">
          <h3 className="text-xs font-black uppercase border-b-2 border-[#141414] pb-2">
            Active Assigned Cases
          </h3>

          <div className="space-y-2">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-3 border-2 border-[#141414] cursor-pointer transition-all ${
                  selectedCase?.id === c.id ? "bg-[#F2F1ED] border-l-8 border-l-[#FF4444]" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between text-xs font-bold font-mono">
                  <span>{c.debtorName}</span>
                  <span className="text-[#FF4444]">{formatCurrency(c.outstandingAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-1.5">
                  <span>DPD: {c.delinquencyDays} days</span>
                  <span className="bg-gray-100 border border-gray-300 px-1 font-bold text-[9px] uppercase">
                    {c.stage.replace("STAGE_", "")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel workspace */}
        <div className="lg:col-span-2">
          {selectedCase ? (
            <div className="space-y-6">
              {/* Target Metadata details */}
              <div className="bg-[#FCFAF5] border-4 border-[#141414] p-4 shadow-tech-sm flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-500 font-mono">TARGET DEBTOR ACCOUNT</span>
                  <h4 className="text-sm font-black uppercase text-[#141414]">
                    {selectedCase.debtorName} ({selectedCase.accountNumber})
                  </h4>
                  <p className="text-[10px] font-mono text-gray-600 mt-0.5">
                    Stage: <span className="font-bold">{selectedCase.stage}</span> • Outstanding Debt: <span className="text-red-600 font-bold">{formatCurrency(selectedCase.outstandingAmount)}</span>
                  </p>
                </div>
                <span className="text-xs bg-[#141414] text-white px-2 py-1 font-mono font-bold">
                  {selectedCase.status}
                </span>
              </div>

              {/* Action tabs selectors */}
              <div className="flex border-b-2 border-[#141414] bg-white">
                <button
                  onClick={() => setActiveSubTab("CALL")}
                  className={`flex-1 py-2.5 font-bold text-xs uppercase tracking-wider font-mono flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
                    activeSubTab === "CALL" ? "bg-[#141414] text-white" : "hover:bg-gray-100 text-brand-dark-bg"
                  }`}
                >
                  <PhoneCall className="w-4 h-4" /> Log Telecall
                </button>
                <button
                  onClick={() => setActiveSubTab("VISIT")}
                  className={`flex-1 py-2.5 font-bold text-xs uppercase tracking-wider font-mono flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
                    activeSubTab === "VISIT" ? "bg-[#141414] text-white" : "hover:bg-gray-100 text-brand-dark-bg"
                  }`}
                >
                  <MapPin className="w-4 h-4" /> Geofenced Visit
                </button>
                <button
                  onClick={() => setActiveSubTab("SETTLE")}
                  className={`flex-1 py-2.5 font-bold text-xs uppercase tracking-wider font-mono flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
                    activeSubTab === "SETTLE" ? "bg-[#141414] text-white" : "hover:bg-gray-100 text-[#141414]"
                  }`}
                >
                  <BadgePercent className="w-4 h-4" /> Settlement Proposal
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm">
                {activeSubTab === "CALL" && (
                  <form onSubmit={handleRegisterCall} className="space-y-4 font-mono text-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Register Call Disposition & Promise-To-Pay (PTP) parameters
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold block text-gray-700 uppercase">Call Disposition</label>
                        <select
                          value={disposition}
                          onChange={(e) => setDisposition(e.target.value)}
                          className="w-full px-2 py-1.5 border-2 border-[#141414] bg-white focus:outline-none"
                        >
                          <option value="PROMISE_TO_PAY">PROMISE TO PAY (PTP)</option>
                          <option value="DEBTOR_BUSY">DEBTOR BUSY / TRY LATER</option>
                          <option value="WRONG_NUMBER">INVALID / WRONG NUMBER</option>
                          <option value="REFUSED_TO_PAY">DISPUTE / REFUSED TO PAY</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold block text-gray-700 uppercase">Voice Recording Stream</label>
                        <div className="p-1.5 bg-gray-100 border-2 border-dashed border-gray-400 text-center text-[10px] text-gray-500 font-mono">
                          Auto recording channel open... (rec_810284.wav)
                        </div>
                      </div>
                    </div>

                    {disposition === "PROMISE_TO_PAY" && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-[#FCFAF5] border border-gray-300">
                        <div className="space-y-1">
                          <label className="font-bold block text-gray-700 uppercase text-[10px]">PTP Promise Amount ($)</label>
                          <input
                            type="number"
                            value={ptpAmount}
                            onChange={(e) => setPtpAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full px-2 py-1 border border-gray-400 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold block text-gray-700 uppercase text-[10px]">PTP Promise Date</label>
                          <input
                            type="text"
                            value={ptpDate}
                            onChange={(e) => setPtpDate(e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className="w-full px-2 py-1 border border-gray-400 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-bold block text-gray-700 uppercase">Interactive Call Summary Log</label>
                      <textarea
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        placeholder="Detail the complete notes of call, payment issues, debtor attitude..."
                        className="w-full h-24 p-2 border-2 border-[#141414] bg-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#141414] hover:bg-[#FF4444] text-white font-bold border-2 border-[#141414] transition-all cursor-pointer shadow-tech-sm"
                    >
                      COMMIT CALL RECREATION LOGS
                    </button>
                  </form>
                )}

                {activeSubTab === "VISIT" && (
                  <form onSubmit={handleRegisterVisit} className="space-y-4 font-mono text-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Register field visit geocoded coordinates & verified asset photo stamps
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold block text-gray-700 uppercase">Agent GPS Latitude</label>
                        <input
                          type="text"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          className="w-full px-2 py-1 border-2 border-[#141414] bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold block text-gray-700 uppercase">Agent GPS Longitude</label>
                        <input
                          type="text"
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          className="w-full px-2 py-1 border-2 border-[#141414] bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold block text-gray-700 uppercase">Physical Verification Status</label>
                      <select
                        value={visitStatus}
                        onChange={(e) => setVisitStatus(e.target.value)}
                        className="w-full px-2 py-1.5 border-2 border-[#141414] bg-white"
                      >
                        <option value="CONTACTED_DEBTOR">CONTACTED DEBTOR AT RESIDENCE</option>
                        <option value="RESIDENCE_LOCKED">RESIDENCE SECURED / LOCKED</option>
                        <option value="ADDRESS_NOT_FOUND">ADDRESS COULD NOT BE LOCATED</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold block text-gray-700 uppercase">Field Audit Summary</label>
                      <textarea
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                        placeholder="Describe observations, asset tracking parameters, neighboring enquiries..."
                        className="w-full h-24 p-2 border-2 border-[#141414] bg-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#141414] hover:bg-[#FF4444] text-white font-bold border-2 border-[#141414] transition-all cursor-pointer shadow-tech-sm"
                    >
                      COMMIT FIELD VERIFICATION REPORT
                    </button>
                  </form>
                )}

                {activeSubTab === "SETTLE" && (
                  <form onSubmit={handleAuthorizeSettlement} className="space-y-4 font-mono text-xs">
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Calculate Haircut & Authorize Settlement Proposal (Interactive Sandbox)
                    </span>

                    <div className="p-3.5 bg-[#FCFAF5] border-2 border-[#141414] space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>Original Outstanding Balance:</span>
                        <span>{formatCurrency(selectedCase.outstandingAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <label className="font-bold text-[#141414] uppercase">Proposed Settlement Amount ($):</label>
                        <input
                          type="number"
                          value={proposedAmount}
                          onChange={(e) => setProposedAmount(e.target.value)}
                          placeholder="e.g. 150000"
                          className="px-2.5 py-1.5 border-2 border-[#141414] w-40 text-right font-bold bg-white"
                          required
                        />
                      </div>
                    </div>

                    {haircutPct > 0 && (
                      <div className="p-3 bg-gray-50 border border-gray-300 space-y-2">
                        <div className="flex justify-between">
                          <span>Calculated Haircut Discount:</span>
                          <span className="font-black text-[#FF4444]">{haircutPct.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Required Authorization Level:</span>
                          <span className="font-black bg-gray-200 px-1.5 uppercase text-[10px]">
                            {authTier} ({reqRole} power)
                          </span>
                        </div>

                        {/* Visual checklist if operator role is authorized */}
                        <div className="pt-2 border-t border-dashed border-gray-300 text-[10px]">
                          {operatorRole === "TENANT_ADMIN" || operatorRole === "SUPER_ADMIN" ? (
                            <p className="text-green-600 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4 text-green-600" /> OPERATOR possess L1/L2/L3 authorization power.
                            </p>
                          ) : (
                            <p className="text-amber-600 font-bold flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-amber-500" /> Current Operator Role is {operatorRole}. Verify limits.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#141414] hover:bg-green-600 text-white font-bold border-2 border-[#141414] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-tech-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      <span>AUTHORIZE SECURE SETTLEMENT PAYOFF</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-100 border-2 border-dashed border-[#141414] text-gray-500">
              Select an active recovery case to launch call registers or settlement calculators.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
