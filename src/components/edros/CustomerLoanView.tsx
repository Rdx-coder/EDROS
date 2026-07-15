/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Landmark, Search, Filter, RefreshCw, Upload, AlertTriangle, CheckCircle, FileText, Download } from "lucide-react";

interface Case {
  id: string;
  accountNumber: string;
  debtorName: string;
  principalAmount: number;
  outstandingAmount: number;
  delinquencyDays: number;
  stage: string;
  status: string;
  allocatedExecutiveId: string | null;
  bankId: string;
}

interface CustomerLoanViewProps {
  token: string;
}

export default function CustomerLoanView({ token }: CustomerLoanViewProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [dpdFilter, setDpdFilter] = useState(""); // empty, lt90, 91to180, gt180
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk Import
  const [showImport, setShowImport] = useState(false);
  const [importContent, setImportContent] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const fetchCases = () => {
    setLoading(true);
    setError(null);

    let url = `/api/v2/cases?page=${page}&limit=5`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (stageFilter) url += `&stage=${encodeURIComponent(stageFilter)}`;

    if (dpdFilter === "lt90") {
      url += "&maxDpd=90";
    } else if (dpdFilter === "91to180") {
      url += "&minDpd=91&maxDpd=180";
    } else if (dpdFilter === "gt180") {
      url += "&minDpd=181";
    }

    fetch(url, {
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
          setTotalPages(payload.totalPages || 1);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to query recovery case registries.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCases();
  }, [page, q, stageFilter, dpdFilter]);

  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    setImportStatus(null);
    setImporting(true);

    let parsedData: any;
    try {
      parsedData = JSON.parse(importContent || "[]");
    } catch (err) {
      setImportError("Format error: Data must be a valid JSON list of recovery cases.");
      setImporting(false);
      return;
    }

    if (!Array.isArray(parsedData)) {
      setImportError("Validation error: root parameter must be an array list.");
      setImporting(false);
      return;
    }

    fetch("/api/v2/bulk-import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        fileName: importFile?.name || "manual_raw_entry.json",
        fileSizeKb: Math.round(importContent.length / 1024),
        cases: parsedData
      })
    })
      .then((res) => res.json())
      .then((payload) => {
        setImporting(false);
        if (payload.success) {
          setImportStatus(payload.session);
          setImportContent("");
          fetchCases();
        } else {
          setImportError(payload.message || "File ingestion failed.");
        }
      })
      .catch((err) => {
        setImportError(err.message);
        setImporting(false);
      });
  };

  const loadSampleJson = () => {
    const sample = [
      {
        accountNumber: "9900281048",
        debtorName: "Rajesh Singhal",
        principalAmount: 400000,
        outstandingAmount: 420000,
        delinquencyDays: 165,
        bankId: "bank-sbi"
      },
      {
        accountNumber: "8899281023",
        debtorName: "Nisha Kulkarni",
        principalAmount: 150000,
        outstandingAmount: 155000,
        delinquencyDays: 85,
        bankId: "bank-hdfc"
      }
    ];
    setImportContent(JSON.stringify(sample, null, 2));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-4 border-[#141414] p-4 shadow-tech-sm">
        <div>
          <h3 className="text-sm font-black uppercase text-[#141414] flex items-center gap-2">
            <Landmark className="w-5 h-5" /> Secured Debtor & Loan Registries
          </h3>
          <p className="text-[10px] font-mono text-gray-500 mt-0.5">
            Audit principal ledgers, delinquency Days Past Due (DPD) parameters, and allocate cases.
          </p>
        </div>

        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-[#141414] text-white hover:bg-[#FF4444] font-bold text-xs flex items-center gap-1.5 cursor-pointer border-2 border-[#141414] transition-all shadow-tech-sm"
        >
          <Upload className="w-4 h-4" /> BULK IMPORT FILES
        </button>
      </div>

      {/* Bulk Import Modal Block */}
      {showImport && (
        <div className="p-5 bg-white border-4 border-[#141414] shadow-tech space-y-4">
          <div className="flex justify-between items-center border-b border-[#141414] pb-2">
            <span className="text-xs font-black uppercase text-[#141414] flex items-center gap-2">
              <Upload className="w-4.5 h-4.5" /> High-Density Allocation File Ingestor (JSON/XML)
            </span>
            <button
              onClick={() => {
                setShowImport(false);
                setImportStatus(null);
                setImportError(null);
              }}
              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
            >
              CLOSE
            </button>
          </div>

          {importError && (
            <div className="p-3 bg-red-50 border border-red-500 text-[10px] font-mono text-red-500">
              {importError}
            </div>
          )}

          {importStatus && (
            <div className="p-3 bg-green-50 border border-green-500 text-[10px] font-mono text-green-700 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle className="w-4.5 h-4.5" /> INGESTION_SESSION_COMPLETED
              </p>
              <p>Session ID: {importStatus.id}</p>
              <p>Success Rows Committed: {importStatus.successCount} • Failures: {importStatus.errorCount}</p>
              <p>Status: {importStatus.status}</p>
            </div>
          )}

          <form onSubmit={handleBulkImportSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-700">
                <span>Raw Case Array Data</span>
                <button
                  type="button"
                  onClick={loadSampleJson}
                  className="text-blue-600 hover:underline"
                >
                  LOAD SAMPLE RECORD JSON
                </button>
              </div>
              <textarea
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                placeholder="[ { 'accountNumber': '99201', 'debtorName': '...', 'outstandingAmount': 12000, 'delinquencyDays': 110, 'bankId': 'bank-sbi' } ]"
                className="w-full h-36 p-3 text-xs font-mono border-2 border-[#141414] focus:outline-none bg-[#FCFAF5]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={importing}
              className="px-4 py-2 bg-[#141414] text-white font-bold text-xs border-2 border-[#141414] hover:bg-green-600 cursor-pointer transition-all disabled:opacity-50"
            >
              {importing ? "COMPILING SCHEMAS..." : "INGEST & DISPATCH ALLOCATIONS"}
            </button>
          </form>
        </div>
      )}

      {/* Grid search-and-filter panels */}
      <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Debtor Name, Masked Account Number..."
              className="w-full pl-10 pr-4 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:bg-white focus:outline-none"
            />
          </div>

          {/* DPD delinquent Filter */}
          <div>
            <select
              value={dpdFilter}
              onChange={(e) => {
                setDpdFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none"
            >
              <option value="">All Delinquency Days (DPD)</option>
              <option value="lt90">Low DPD (&lt; 90 days)</option>
              <option value="91to180">NPA Bound (91 - 180 days)</option>
              <option value="gt180">Critical Loss (&gt; 180 days)</option>
            </select>
          </div>

          {/* Recovery Stage Filter */}
          <div>
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none"
            >
              <option value="">All Recovery Stages</option>
              <option value="STAGE_1_PRE_NOTICE">Stage 1 - Pre Notice</option>
              <option value="STAGE_2_TELE_CALLING">Stage 2 - Tele Calling</option>
              <option value="STAGE_3_FIELD_VISIT">Stage 3 - Field Visit</option>
              <option value="STAGE_4_LEGAL_NOTICE">Stage 4 - Legal Notice</option>
              <option value="STAGE_5_LITIGATION">Stage 5 - Litigation</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-500 text-xs font-mono text-red-500 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Core Cases table */}
        <div className="overflow-x-auto border-2 border-[#141414]">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#FCFAF5] border-b-2 border-[#141414]">
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Debtor / Account</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-right">Principal</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-right">Outstanding</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center">DPD</th>
                <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Active Stage</th>
                <th className="p-3 font-bold uppercase text-center">Executive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500 animate-pulse">
                    Querying records...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No matching debtor records found.
                  </td>
                </tr>
              ) : (
                cases.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-all">
                    <td className="p-3 border-r-2 border-[#141414]">
                      <span className="font-bold block text-[#141414]">{item.debtorName}</span>
                      <span className="text-[10px] text-gray-500">Acc: {item.accountNumber.slice(0,4)}****** (Bank: {item.bankId})</span>
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-right bg-gray-50">
                      {formatCurrency(item.principalAmount)}
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-right text-[#FF4444] font-bold">
                      {formatCurrency(item.outstandingAmount)}
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-center">
                      <span className={`px-2 py-0.5 border ${
                        item.delinquencyDays > 180 ? "bg-red-100 border-red-500 text-red-700 font-bold" : "bg-gray-100 border-gray-300"
                      }`}>
                        {item.delinquencyDays}
                      </span>
                    </td>
                    <td className="p-3 border-r-2 border-[#141414]">
                      <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-400 font-bold text-[10px]">
                        {item.stage}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-600 text-[10px]">
                      {item.allocatedExecutiveId ? `Allocated: ${item.allocatedExecutiveId}` : "Unallocated"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center pt-2 font-mono text-xs">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border-2 border-[#141414] disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
          >
            ← PREVIOUS PAGE
          </button>
          <span>PAGE {page} OF {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border-2 border-[#141414] disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
          >
            NEXT PAGE →
          </button>
        </div>
      </div>
    </div>
  );
}
