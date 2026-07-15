/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Landmark, Building2, ShieldAlert, BadgePercent, Plus, CheckCircle2, XCircle, FileText, ChevronRight } from "lucide-react";

interface BankConfig {
  id: string;
  name: string;
  logoCode: string;
  commissionRate: number; // base agency commission pct
  status: "ACTIVE" | "SUSPENDED";
  delinquentBrackets: {
    minDpd: number;
    maxDpd: number;
    ratePct: number;
  }[];
}

export default function OrganizationView() {
  const [banks, setBanks] = useState<BankConfig[]>([
    {
      id: "bank-sbi",
      name: "State Bank of India (SBI)",
      logoCode: "SBI",
      commissionRate: 8.5,
      status: "ACTIVE",
      delinquentBrackets: [
        { minDpd: 1, maxDpd: 90, ratePct: 5 },
        { minDpd: 91, maxDpd: 180, ratePct: 8.5 },
        { minDpd: 181, maxDpd: 365, ratePct: 12 },
      ]
    },
    {
      id: "bank-hdfc",
      name: "HDFC Bank Ltd",
      logoCode: "HDFC",
      commissionRate: 10.0,
      status: "ACTIVE",
      delinquentBrackets: [
        { minDpd: 1, maxDpd: 90, ratePct: 6 },
        { minDpd: 91, maxDpd: 180, ratePct: 10 },
        { minDpd: 181, maxDpd: 365, ratePct: 15 },
      ]
    },
    {
      id: "bank-icici",
      name: "ICICI Bank Corporate",
      logoCode: "ICICI",
      commissionRate: 9.0,
      status: "ACTIVE",
      delinquentBrackets: [
        { minDpd: 1, maxDpd: 90, ratePct: 5.5 },
        { minDpd: 91, maxDpd: 180, ratePct: 9 },
        { minDpd: 181, maxDpd: 365, ratePct: 14 },
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState<"BANKS" | "STRUCTURE">("BANKS");
  const [selectedBank, setSelectedBank] = useState<BankConfig | null>(banks[0]);

  // Form states for adding a new commission bracket
  const [minDpd, setMinDpd] = useState("");
  const [maxDpd, setMaxDpd] = useState("");
  const [ratePct, setRatePct] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Form states for adding a new bank
  const [newBankName, setNewBankName] = useState("");
  const [newBankLogo, setNewBankLogo] = useState("SBI");
  const [newBankRate, setNewBankRate] = useState("");
  const [showAddBank, setShowAddBank] = useState(false);

  const handleAddBracket = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const min = parseInt(minDpd, 10);
    const max = parseInt(maxDpd, 10);
    const rate = parseFloat(ratePct);

    if (isNaN(min) || isNaN(max) || isNaN(rate)) {
      setFormError("All fields must contain numeric values.");
      return;
    }

    if (min < 0 || max < min || rate <= 0 || rate > 100) {
      setFormError("Invalid range values. Max DPD must be greater than Min DPD.");
      return;
    }

    if (!selectedBank) return;

    const updatedBanks = banks.map((b) => {
      if (b.id === selectedBank.id) {
        return {
          ...b,
          delinquentBrackets: [...b.delinquentBrackets, { minDpd: min, maxDpd: max, ratePct: rate }]
        };
      }
      return b;
    });

    setBanks(updatedBanks);
    setSelectedBank(updatedBanks.find((b) => b.id === selectedBank.id) || null);

    // Reset inputs
    setMinDpd("");
    setMaxDpd("");
    setRatePct("");
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const rate = parseFloat(newBankRate);
    if (!newBankName) {
      setFormError("Bank name cannot be empty.");
      return;
    }
    if (isNaN(rate) || rate <= 0 || rate > 100) {
      setFormError("Base commission rate must be between 1 and 100.");
      return;
    }

    const newBank: BankConfig = {
      id: `bank-${Date.now()}`,
      name: newBankName,
      logoCode: newBankLogo,
      commissionRate: rate,
      status: "ACTIVE",
      delinquentBrackets: [
        { minDpd: 1, maxDpd: 90, ratePct: rate * 0.7 },
        { minDpd: 91, maxDpd: 180, ratePct: rate },
        { minDpd: 181, maxDpd: 365, ratePct: rate * 1.5 },
      ]
    };

    const list = [...banks, newBank];
    setBanks(list);
    setSelectedBank(newBank);
    setNewBankName("");
    setNewBankRate("");
    setShowAddBank(false);
  };

  const toggleBankStatus = (id: string) => {
    const list = banks.map((b) => {
      if (b.id === id) {
        const nextStatus = b.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        return { ...b, status: nextStatus as any };
      }
      return b;
    });
    setBanks(list);
    if (selectedBank && selectedBank.id === id) {
      setSelectedBank(list.find((b) => b.id === id) || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab select command bar */}
      <div className="flex border-b-4 border-[#141414] bg-white">
        <button
          onClick={() => setActiveTab("BANKS")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2 border-r-2 border-[#141414] cursor-pointer transition-all ${
            activeTab === "BANKS" ? "bg-[#141414] text-white" : "bg-white text-brand-dark-bg hover:bg-gray-100"
          }`}
        >
          <Landmark className="w-4.5 h-4.5" /> Corporate Bank Setup & Commission Rates
        </button>
        <button
          onClick={() => setActiveTab("STRUCTURE")}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === "STRUCTURE" ? "bg-[#141414] text-white" : "bg-white text-brand-dark-bg hover:bg-gray-100"
          }`}
        >
          <Building2 className="w-4.5 h-4.5" /> Agency Operational Hierarchy
        </button>
      </div>

      {activeTab === "BANKS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of banks */}
          <div className="lg:col-span-1 bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-4">
            <div className="flex justify-between items-center border-b-2 border-[#141414] pb-2">
              <h3 className="text-xs font-black uppercase tracking-tight">Partner Bank Registry</h3>
              <button
                onClick={() => setShowAddBank(!showAddBank)}
                className="p-1.5 bg-[#141414] text-white border border-[#141414] hover:bg-[#FF4444] transition-all cursor-pointer"
                title="Add Partner Bank"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>

            {showAddBank && (
              <form onSubmit={handleAddBank} className="p-3 bg-gray-50 border-2 border-dashed border-[#141414] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-mono block">
                  Register Partner Bank
                </span>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase block text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="e.g. Axis Bank Ltd"
                    className="w-full px-2 py-1 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase block text-gray-700">Base Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBankRate}
                    onChange={(e) => setNewBankRate(e.target.value)}
                    placeholder="e.g. 9.5"
                    className="w-full px-2 py-1 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1 text-xs font-bold bg-[#141414] text-white hover:bg-green-600 transition-all cursor-pointer"
                  >
                    Save Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBank(false)}
                    className="px-2 py-1 text-xs font-bold bg-gray-300 hover:bg-gray-400 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  className={`p-3 border-2 border-[#141414] flex items-center justify-between cursor-pointer transition-all ${
                    selectedBank?.id === bank.id ? "bg-[#F2F1ED] border-l-8 border-l-[#FF4444]" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center font-mono font-black text-xs border border-[#141414]">
                      {bank.logoCode}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{bank.name}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">
                        Base Comm: <span className="font-bold text-[#141414]">{bank.commissionRate}%</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {bank.status === "ACTIVE" ? (
                      <span className="text-green-600" title="Active">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-red-500" title="Suspended">
                        <XCircle className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Bank details & brackets configurations */}
          <div className="lg:col-span-2 space-y-6">
            {selectedBank ? (
              <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-5">
                <div className="flex justify-between items-start border-b-2 border-[#141414] pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase text-[#141414] flex items-center gap-2">
                      <Landmark className="w-4.5 h-4.5" /> {selectedBank.name} Configurations
                    </h3>
                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                      Bank ID: <span className="font-bold">{selectedBank.id}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => toggleBankStatus(selectedBank.id)}
                    className={`px-3 py-1 text-[10px] font-bold border-2 border-[#141414] transition-all cursor-pointer ${
                      selectedBank.status === "ACTIVE"
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-800"
                        : "bg-green-100 hover:bg-green-200 text-green-800"
                    }`}
                  >
                    {selectedBank.status === "ACTIVE" ? "SUSPEND PARTNERSHIP" : "REACTIVATE PARTNERSHIP"}
                  </button>
                </div>

                {/* Brackets configuration */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <BadgePercent className="w-4 h-4 text-[#FF4444]" /> Recovery DPD-based Commission Brackets
                  </h4>

                  <div className="overflow-x-auto border-2 border-[#141414]">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-[#FCFAF5] border-b-2 border-[#141414]">
                          <th className="p-2 border-r-2 border-[#141414] font-bold uppercase">Bracket Bounds</th>
                          <th className="p-2 border-r-2 border-[#141414] font-bold uppercase text-center">Min DPD</th>
                          <th className="p-2 border-r-2 border-[#141414] font-bold uppercase text-center">Max DPD</th>
                          <th className="p-2 font-bold uppercase text-right">Commission Rate (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {selectedBank.delinquentBrackets.map((bracket, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-2 border-r-2 border-[#141414] font-bold">
                              Bracket #{index + 1}
                            </td>
                            <td className="p-2 border-r-2 border-[#141414] text-center">{bracket.minDpd} days</td>
                            <td className="p-2 border-r-2 border-[#141414] text-center">
                              {bracket.maxDpd === 99999 ? "∞ days" : `${bracket.maxDpd} days`}
                            </td>
                            <td className="p-2 font-black text-right text-green-600">{bracket.ratePct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Bracket Form */}
                  <form onSubmit={handleAddBracket} className="p-4 bg-[#FCFAF5] border-2 border-[#141414] space-y-4">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 block border-b border-gray-300 pb-1">
                      Configure Additional Delinquency Bracket
                    </span>

                    {formError && (
                      <p className="text-[10px] font-bold font-mono text-[#FF4444] bg-red-50 p-2 border border-[#FF4444]">
                        {formError}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-600 block">Min DPD</label>
                        <input
                          type="number"
                          value={minDpd}
                          onChange={(e) => setMinDpd(e.target.value)}
                          placeholder="e.g. 181"
                          className="w-full px-2 py-1 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-600 block">Max DPD</label>
                        <input
                          type="number"
                          value={maxDpd}
                          onChange={(e) => setMaxDpd(e.target.value)}
                          placeholder="e.g. 365"
                          className="w-full px-2 py-1 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-600 block">Payout (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={ratePct}
                          onChange={(e) => setRatePct(e.target.value)}
                          placeholder="e.g. 12.0"
                          className="w-full px-2 py-1 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#141414] hover:bg-green-600 text-white font-bold text-xs border-2 border-[#141414] transition-all cursor-pointer shadow-tech-sm"
                    >
                      COMMIT RATE BOUNDARY
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white border-4 border-[#141414] p-8 text-center text-gray-500 font-mono text-sm">
                Select a partnering bank configuration from the registry sidebar.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "STRUCTURE" && (
        <div className="bg-white border-4 border-[#141414] p-5 shadow-tech-sm space-y-4">
          <div>
            <h3 className="text-sm font-black uppercase text-[#141414]">
              Normalized Multi-Tier Corporate Structures Mapping
            </h3>
            <p className="text-[11px] font-mono text-gray-500 mt-0.5">
              Strict spatial boundaries defining geo-restricted case visibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-xs">
            {/* Level 1 */}
            <div className="border-2 border-[#141414] p-3 space-y-2 bg-[#FCFAF5]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#141414] px-1.5 py-0.5">
                TIER 1 (State)
              </span>
              <div className="border border-dashed border-gray-400 p-1.5 font-bold flex justify-between items-center bg-white">
                <span>Maharashtra</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="border border-dashed border-gray-400 p-1.5 font-bold flex justify-between items-center bg-white">
                <span>Delhi NCR</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Level 2 */}
            <div className="border-2 border-[#141414] p-3 space-y-2 bg-[#FCFAF5]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#141414] px-1.5 py-0.5">
                TIER 2 (Region)
              </span>
              <div className="border border-dashed border-gray-400 p-1.5 flex justify-between items-center bg-white">
                <span>West-Zone I</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="border border-dashed border-gray-400 p-1.5 flex justify-between items-center bg-white">
                <span>North-Zone II</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Level 3 */}
            <div className="border-2 border-[#141414] p-3 space-y-2 bg-[#FCFAF5]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#141414] px-1.5 py-0.5">
                TIER 3 (Branch)
              </span>
              <div className="border border-dashed border-gray-400 p-1.5 flex justify-between items-center bg-white">
                <span>Mumbai Head</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="border border-dashed border-gray-400 p-1.5 flex justify-between items-center bg-white">
                <span>New Delhi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Level 4 */}
            <div className="border-2 border-[#141414] p-3 space-y-2 bg-[#FCFAF5]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#141414] px-1.5 py-0.5">
                TIER 4 (Teams)
              </span>
              <div className="border border-dashed border-gray-400 p-1.5 flex justify-between items-center bg-white text-[11px]">
                <span>NPA Squad Alpha</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="border border-dashed border-gray-400 p-1.5 flex justify-between items-center bg-white text-[11px]">
                <span>Notice Desk 1</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Level 5 */}
            <div className="border-2 border-[#141414] p-3 space-y-2 bg-[#FCFAF5]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#141414] px-1.5 py-0.5">
                TIER 5 (Executives)
              </span>
              <div className="border border-dashed border-gray-400 p-1.5 bg-white text-[10px]">
                <span>Rohan Sharma (E2)</span>
              </div>
              <div className="border border-dashed border-gray-400 p-1.5 bg-white text-[10px]">
                <span>Priya Nair (L5)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#EBF7FF] border border-[#1E88E5] text-xs leading-relaxed text-[#1E88E5]">
            <span className="font-bold uppercase block">Spanning Isolation Boundary Matrix:</span>
            By isolating visibility parameters along Tier 1 through Tier 4 nodes, a recovery executive allocated to Branch "Mumbai Head" cannot query or export files associated with Branch "New Delhi" unless explicitly authorized by a tenant administrator.
          </div>
        </div>
      )}
    </div>
  );
}
