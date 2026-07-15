/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Scale, FileText, Calendar, PlusCircle, RefreshCw, AlertCircle, CheckCircle, ChevronRight, Gavel, FileCheck } from "lucide-react";

interface LitigationCase {
  id: string;
  noticeId: string | null;
  suitNumber: string;
  courtName: string;
  filingDate: string;
  nextHearingDate: string | null;
  suitStatus: string;
  natureOfSuit: string;
}

interface LegalNotice {
  id: string;
  caseId: string;
  templateId: string;
  noticeRefNo: string;
  dispatchedDate: string;
  receivedDate: string | null;
  noticeStatus: string;
  courierTrackingNo: string;
}

interface LegalCourtViewProps {
  token: string;
}

export default function LegalCourtView({ token }: LegalCourtViewProps) {
  const [cases, setCases] = useState<LitigationCase[]>([]);
  const [notices, setNotices] = useState<LegalNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active view: CASES vs NOTICES dispatch
  const [activeTab, setActiveTab] = useState<"CASES" | "NOTICES">("CASES");
  const [selectedCase, setSelectedCase] = useState<LitigationCase | null>(null);

  // New Case form states
  const [showAddCaseForm, setShowAddCaseForm] = useState(false);
  const [suitNumber, setSuitNumber] = useState("");
  const [courtName, setCourtName] = useState("");
  const [filingDate, setFilingDate] = useState("2026-07-14");
  const [natureOfSuit, setNatureOfSuit] = useState("CIVIL_RECOVERY_DEBT");

  // Dispatch notice form states
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeCaseId, setNoticeCaseId] = useState("case-001");
  const [templateId, setTemplateId] = useState("tmpl-01");
  const [noticeRefNo, setNoticeRefNo] = useState("");
  const [courierNo, setCourierNo] = useState("");

  // Hearing schedule state
  const [hearingDate, setHearingDate] = useState("");
  const [showHearingForm, setShowHearingForm] = useState(false);

  // Adjourn form state
  const [showAdjournForm, setShowAdjournForm] = useState(false);
  const [adjournReason, setAdjournReason] = useState("JUDGE_ON_LEAVE");
  const [extendedDate, setExtendedDate] = useState("");
  const [adjournNotes, setAdjournNotes] = useState("");

  const fetchLegalData = () => {
    setLoading(true);
    setError(null);

    // Fetch litigation cases
    const fetchCasesPromise = fetch("/api/v2/legal/cases", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then((res) => res.json());

    // Fetch dispatched notices
    const fetchNoticesPromise = fetch("/api/v2/legal/notices", {
      headers: { "Authorization": `Bearer ${token}` }
    }).then((res) => res.json());

    Promise.all([fetchCasesPromise, fetchNoticesPromise])
      .then(([casesRes, noticesRes]) => {
        if (casesRes.success) {
          setCases(casesRes.data);
          if (casesRes.data.length > 0 && !selectedCase) {
            setSelectedCase(casesRes.data[0]);
          }
        }
        if (noticesRes.success) {
          setNotices(noticesRes.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load litigation registries.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLegalData();
  }, [token]);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    fetch("/api/v2/legal/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ suitNumber, courtName, filingDate, natureOfSuit })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Suit ${suitNumber} created and filed successfully.`);
          setShowAddCaseForm(false);
          // reset
          setSuitNumber("");
          setCourtName("");
          fetchLegalData();
        } else {
          setError(payload.message || "Filing docket rejected.");
        }
      })
      .catch((err) => setError(err.message));
  };

  const handleDispatchNotice = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    fetch("/api/v2/legal/notices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        caseId: noticeCaseId,
        templateId,
        noticeRefNo,
        courierTrackingNo: courierNo
      })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Notice Ref ${noticeRefNo} dispatched successfully.`);
          setShowNoticeForm(false);
          setNoticeRefNo("");
          setCourierNo("");
          fetchLegalData();
        } else {
          setError(payload.message || "Failed to dispatch notice.");
        }
      })
      .catch((err) => setError(err.message));
  };

  const handleRegisterHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/v2/legal/cases/${selectedCase.id}/hearings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ hearingDate })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Court hearing date registered.`);
          setShowHearingForm(false);
          setHearingDate("");
          fetchLegalData();
        } else {
          setError(payload.message || "Failed to schedule hearing.");
        }
      })
      .catch((err) => setError(err.message));
  };

  const handleAdjournHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setError(null);
    setSuccessMsg(null);

    // Mock adjourning first available hearing for simplicity (id matches standard seeder)
    fetch("/api/v2/legal/hearings/hrg-601/adjourn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        reasonCode: adjournReason,
        extendedDate,
        notes: adjournNotes
      })
    })
      .then((res) => {
        if (res.status === 404) {
          throw new Error("No scheduled hearings found to adjourn. Please register a hearing first.");
        }
        return res.json();
      })
      .then((payload) => {
        if (payload.success) {
          setSuccessMsg(`Hearing adjourned to ${extendedDate} successfully.`);
          setShowAdjournForm(false);
          setExtendedDate("");
          setAdjournNotes("");
          fetchLegalData();
        }
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-[#FFF0F0] border-2 border-[#FF4444] p-3 text-xs text-[#FF4444] font-mono flex gap-2 items-start shadow-tech-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase block">LEGAL_OUTAGE_EXCEPTION:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-[#EBF7FF] border-2 border-[#1E88E5] p-3 text-xs text-[#1E88E5] font-mono flex gap-2 items-start shadow-tech-sm">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase block">COURT_DOCK_SYNCED:</span>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      {/* Select tab commands */}
      <div className="flex border-b-4 border-[#141414] bg-white">
        <button
          onClick={() => setActiveTab("CASES")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2 border-r-2 border-[#141414] cursor-pointer transition-all ${
            activeTab === "CASES" ? "bg-[#141414] text-white" : "bg-white text-brand-dark-bg hover:bg-gray-100"
          }`}
        >
          <Scale className="w-4.5 h-4.5" /> Court Litigation Suits dockets
        </button>
        <button
          onClick={() => setActiveTab("NOTICES")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "NOTICES" ? "bg-[#141414] text-white" : "bg-white text-brand-dark-bg hover:bg-gray-100"
          }`}
        >
          <FileText className="w-4.5 h-4.5" /> Legal notices Dispatch ledger
        </button>
      </div>

      {activeTab === "CASES" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Litigation cases list */}
          <div className="lg:col-span-1 bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-4">
            <div className="flex justify-between items-center border-b-2 border-[#141414] pb-2">
              <h3 className="text-xs font-black uppercase text-[#141414]">Filed Court Suits</h3>
              <button
                onClick={() => setShowAddCaseForm(!showAddCaseForm)}
                className="p-1.5 bg-[#141414] text-white hover:bg-[#FF4444] transition-all cursor-pointer border border-[#141414]"
                title="File Suit"
              >
                <PlusCircle className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Add litigation case form */}
            {showAddCaseForm && (
              <form onSubmit={handleCreateCase} className="p-3.5 bg-[#FCFAF5] border-2 border-[#141414] space-y-3 font-mono text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Docket New Litigation Suit
                </span>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-gray-700 block">Suit Number</label>
                  <input
                    type="text"
                    value={suitNumber}
                    onChange={(e) => setSuitNumber(e.target.value)}
                    placeholder="e.g. O.S. 90281/2026"
                    className="w-full px-2 py-1 border border-gray-400 bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-gray-700 block">Court Name</label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="e.g. Debt Recovery Tribunal"
                    className="w-full px-2 py-1 border border-gray-400 bg-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-gray-700 block">Filing Date</label>
                    <input
                      type="text"
                      value={filingDate}
                      onChange={(e) => setFilingDate(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-400 bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-gray-700 block">Nature</label>
                    <select
                      value={natureOfSuit}
                      onChange={(e) => setNatureOfSuit(e.target.value)}
                      className="w-full px-1 py-1 border border-gray-400 bg-white"
                    >
                      <option value="CIVIL_RECOVERY_DEBT">CIVIL RECOVERY</option>
                      <option value="SEC_138_CHEQUE">SEC 138 CHEQUE</option>
                      <option value="SARFAESI_SEC_13">SARFAESI SEC 13</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#141414] text-white font-bold transition-all hover:bg-green-600 cursor-pointer"
                >
                  SAVE COURT FILING DOCKET
                </button>
              </form>
            )}

            <div className="space-y-2">
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3 border-2 border-[#141414] cursor-pointer transition-all ${
                    selectedCase?.id === c.id ? "bg-[#F2F1ED] border-l-8 border-l-[#FF4444]" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold font-mono">
                    <span>{c.suitNumber}</span>
                    <span className="bg-[#141414] text-white px-1.5 py-0.5 text-[9px] uppercase">
                      {c.suitStatus}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono mt-1.5">{c.courtName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Court Actions for active suit */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCase ? (
              <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-5">
                <div className="flex justify-between items-start border-b border-gray-300 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 font-mono">CASE SUIT OVERVIEW</span>
                    <h3 className="text-sm font-black uppercase text-[#141414]">
                      {selectedCase.suitNumber} • {selectedCase.courtName}
                    </h3>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                      Filing Date: {new Date(selectedCase.filingDate).toLocaleDateString()} • Nature: <span className="font-bold text-[#141414]">{selectedCase.natureOfSuit}</span>
                    </p>
                  </div>
                </div>

                {/* Hearing schedules */}
                <div className="space-y-4">
                  <div className="p-4 bg-[#FCFAF5] border-2 border-[#141414] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF4444]/10 rounded-bl-full flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-[#FF4444] translate-x-2 -translate-y-2" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-mono">
                      Next Court Hearing Date
                    </span>
                    <p className="text-xl font-black text-amber-600 mt-2 font-mono">
                      {selectedCase.nextHearingDate ? new Date(selectedCase.nextHearingDate).toLocaleDateString() : "PENDING SCHEDULING"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowHearingForm(!showHearingForm);
                        setShowAdjournForm(false);
                      }}
                      className="px-3 py-1.5 border-2 border-[#141414] text-xs font-bold hover:bg-gray-100 transition-all font-mono flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Calendar className="w-4 h-4 text-[#FF4444]" /> Register Hearing Date
                    </button>

                    <button
                      onClick={() => {
                        setShowAdjournForm(!showAdjournForm);
                        setShowHearingForm(false);
                      }}
                      className="px-3 py-1.5 border-2 border-[#141414] text-xs font-bold hover:bg-gray-100 transition-all font-mono flex items-center gap-1 cursor-pointer bg-white"
                    >
                      <Scale className="w-4 h-4 text-[#FF4444]" /> Adjourn Hearing
                    </button>
                  </div>

                  {/* Hearing Schedule form */}
                  {showHearingForm && (
                    <form onSubmit={handleRegisterHearing} className="p-4 bg-gray-50 border-2 border-dashed border-[#141414] space-y-3 font-mono text-xs">
                      <span className="text-[10px] font-bold uppercase block text-gray-500">Register Next Hearing Date</span>
                      <div className="space-y-1 max-w-xs">
                        <label className="text-[9px] font-bold uppercase block text-gray-700">Hearing Date (ISO Format)</label>
                        <input
                          type="text"
                          value={hearingDate}
                          onChange={(e) => setHearingDate(e.target.value)}
                          placeholder="e.g. 2026-08-15T10:30:00.000Z"
                          className="w-full px-2 py-1.5 border border-gray-400 bg-white"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#141414] text-white font-bold transition-all hover:bg-green-600 cursor-pointer"
                      >
                        SAVE HEARING DATE
                      </button>
                    </form>
                  )}

                  {/* Adjourn Form */}
                  {showAdjournForm && (
                    <form onSubmit={handleAdjournHearing} className="p-4 bg-gray-50 border-2 border-dashed border-[#141414] space-y-3 font-mono text-xs">
                      <span className="text-[10px] font-bold uppercase block text-gray-500">Adjourn Scheduled Hearing</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase block text-gray-700">Reason Code</label>
                          <select
                            value={adjournReason}
                            onChange={(e) => setAdjournReason(e.target.value)}
                            className="w-full px-1.5 py-1 border border-gray-400 bg-white"
                          >
                            <option value="COUNSEL_ABSENT">COUNSEL ABSENT</option>
                            <option value="JUDGE_ON_LEAVE">JUDGE ON LEAVE</option>
                            <option value="MEDIATION_ONGOING">OUT-OF-COURT MEDIATION</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase block text-gray-700">Next Extended Date</label>
                          <input
                            type="text"
                            value={extendedDate}
                            onChange={(e) => setExtendedDate(e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className="w-full px-1.5 py-1 border border-gray-400 bg-white"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase block text-gray-700">Adjournment Notes</label>
                        <input
                          type="text"
                          value={adjournNotes}
                          onChange={(e) => setAdjournNotes(e.target.value)}
                          placeholder="Specific legal logs..."
                          className="w-full px-2 py-1 border border-gray-400 bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#141414] text-white font-bold transition-all hover:bg-green-600 cursor-pointer"
                      >
                        COMMIT ADJOURNMENT TRANS
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border-4 border-[#141414] p-8 text-center text-gray-500 font-mono text-sm shadow-tech-sm">
                Select a litigation suit from the sidebar to manage hearings and adjournments dockets.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "NOTICES" && (
        <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-4">
          <div className="flex justify-between items-center border-b-2 border-[#141414] pb-2">
            <div>
              <h3 className="text-sm font-black uppercase text-[#141414] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-600 animate-pulse" /> Dispatched Legal Notices Ledger
              </h3>
              <p className="text-[10px] font-mono text-gray-500">
                Track template-based Section 138 & SARFAESI notices dispatch tracking.
              </p>
            </div>
            <button
              onClick={() => setShowNoticeForm(!showNoticeForm)}
              className="px-3 py-1.5 bg-[#141414] text-white hover:bg-[#FF4444] transition-all font-mono font-bold text-xs flex items-center gap-1 border border-[#141414] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> DRAFT NOTICE
            </button>
          </div>

          {/* Draft dispatch notice Form */}
          {showNoticeForm && (
            <form onSubmit={handleDispatchNotice} className="p-4 bg-[#FCFAF5] border-2 border-[#141414] space-y-4 font-mono text-xs">
              <span className="text-xs font-black uppercase block border-b border-gray-300 pb-1">
                Draft and Dispatch Legal Notice
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Notice Template</label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border-2 border-[#141414] bg-white focus:outline-none"
                  >
                    <option value="tmpl-01">Section 138 Dishonor of Cheque</option>
                    <option value="tmpl-02">SARFAESI Section 13(2) Demand</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Notice Ref Number</label>
                  <input
                    type="text"
                    value={noticeRefNo}
                    onChange={(e) => setNoticeRefNo(e.target.value)}
                    placeholder="e.g. N-2026-90281-01"
                    className="w-full px-2.5 py-1.5 border-2 border-[#141414] bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Case ID File Link</label>
                  <select
                    value={noticeCaseId}
                    onChange={(e) => setNoticeCaseId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border-2 border-[#141414] bg-white"
                  >
                    <option value="case-001">Aditya Deshmukh (case-001)</option>
                    <option value="case-002">Vikram Singhania (case-002)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Courier Tracking No</label>
                  <input
                    type="text"
                    value={courierNo}
                    onChange={(e) => setCourierNo(e.target.value)}
                    placeholder="e.g. SPEEDPOST-IN-90281"
                    className="w-full px-2.5 py-1.5 border-2 border-[#141414] bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-[#141414] hover:bg-green-600 text-white font-bold border-2 border-[#141414] transition-all cursor-pointer shadow-tech-sm"
              >
                DISPATCH NOTICE & STAMP LEDGER
              </button>
            </form>
          )}

          {/* Notices ledger list table */}
          <div className="overflow-x-auto border-2 border-[#141414]">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#FCFAF5] border-b-2 border-[#141414]">
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Notice Ref Number</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center">Status</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center">Dispatched Date</th>
                  <th className="p-3 font-bold uppercase">Courier Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50 transition-all">
                    <td className="p-3 border-r-2 border-[#141414] font-bold">
                      {notice.noticeRefNo}
                      <span className="text-[9px] block text-gray-500 font-normal">Case Ref: {notice.caseId} • Template ID: {notice.templateId}</span>
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-center bg-gray-50">
                      <span className="px-1.5 py-0.5 bg-green-100 border border-green-500 text-green-700 font-bold uppercase text-[9px]">
                        {notice.noticeStatus}
                      </span>
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-center">
                      {new Date(notice.dispatchedDate).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-gray-700">
                      {notice.courierTrackingNo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
