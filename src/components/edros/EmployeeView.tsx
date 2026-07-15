/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Users, UserPlus, FileSpreadsheet, RefreshCw, Trash2, ShieldCheck, CheckCircle, Clock, MapPin, AlertCircle, Award } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  departmentCode: string;
  jobGrade: string;
  status: string;
  joinedDate: string;
  salaryBase: number;
  branchId: string;
  teamId: string;
}

interface EmployeeViewProps {
  token: string;
  operatorEmail: string;
}

export default function EmployeeView({ token, operatorEmail }: EmployeeViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Page
  const [q, setQ] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Employee for Attendance or Payslips
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Forms states
  const [showAddForm, setShowAddForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [deptCode, setDeptCode] = useState("OPS");
  const [jobGrade, setJobGrade] = useState("E2");
  const [salaryBase, setSalaryBase] = useState("45000");

  // Attendance states
  const [attendanceAction, setAttendanceAction] = useState<"IN" | "OUT">("IN");
  const [clockInfo, setClockInfo] = useState<any>(null);

  // Payslip states
  const [showPayslipForm, setShowPayslipForm] = useState(false);
  const [monthYear, setMonthYear] = useState("2026-07");
  const [bonusEarned, setBonusEarned] = useState("3500");
  const [deductions, setDeductions] = useState("1200");
  const [payslipInfo, setPayslipInfo] = useState<any>(null);

  const fetchEmployees = () => {
    setLoading(true);
    setError(null);

    let url = `/api/v2/employees?page=${page}&limit=5`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (deptFilter) url += `&department=${encodeURIComponent(deptFilter)}`;

    fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 403) {
          throw new Error("PERMISSION_DENIED: Your current operator role does not possess the permissions to view the payroll, salary base records, and staff roster.");
        }
        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}`);
        }
        return res.json();
      })
      .then((payload) => {
        if (payload.success) {
          setEmployees(payload.data);
          setTotalPages(payload.totalPages || 1);
          if (payload.data.length > 0 && !selectedEmp) {
            setSelectedEmp(payload.data[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load corporate staff profiles.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, q, deptFilter]);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    fetch("/api/v2/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName,
        lastName,
        phone,
        departmentCode: deptCode,
        jobGrade,
        salaryBase: Number(salaryBase)
      })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setShowAddForm(false);
          // reset form
          setFirstName("");
          setLastName("");
          setPhone("");
          fetchEmployees();
        } else {
          setError(payload.message || "Failed to draft profile.");
        }
      })
      .catch((err) => setError(err.message || "An exception occurred."));
  };

  const handleSoftDelete = (id: string) => {
    if (!confirm("Are you absolutely sure you want to flag this operator profile as TERMINATED (soft deleted)?")) return;
    setError(null);

    fetch(`/api/v2/employees/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          if (selectedEmp?.id === id) {
            setSelectedEmp(null);
          }
          fetchEmployees();
        } else {
          setError(payload.message || "Termination commit failed.");
        }
      })
      .catch((err) => setError(err.message || "Server write exception."));
  };

  const handleAttendanceClock = () => {
    if (!selectedEmp) return;
    setError(null);
    setClockInfo(null);

    fetch(`/api/v2/employees/${selectedEmp.id}/attendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        action: attendanceAction,
        deviceFingerprint: `chrome-browser-session-agent-${operatorEmail}`
      })
    })
      .then((res) => {
        if (res.status === 409) {
          throw new Error(`Double check-in prevented. Employee ${selectedEmp.firstName} has already clocked in today.`);
        }
        if (!res.ok) {
          throw new Error("Required active session missing or validation failure.");
        }
        return res.json();
      })
      .then((payload) => {
        if (payload.success) {
          setClockInfo(payload.data);
          // Auto flip action to OUT for ease
          setAttendanceAction(attendanceAction === "IN" ? "OUT" : "IN");
        }
      })
      .catch((err) => setError(err.message));
  };

  const handleGeneratePayslip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setError(null);
    setPayslipInfo(null);

    fetch(`/api/v2/employees/${selectedEmp.id}/payslip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        monthYear,
        bonusEarned: Number(bonusEarned),
        deductions: Number(deductions)
      })
    })
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setPayslipInfo(payload.data);
          setShowPayslipForm(false);
        } else {
          setError(payload.message || "Salary authorization rejected.");
        }
      })
      .catch((err) => setError(err.message));
  };

  if (loading && employees.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-300 w-1/3 animate-pulse rounded"></div>
        <div className="h-64 bg-white border-2 border-gray-300 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-[#FFF0F0] border-2 border-[#FF4444] p-3 text-xs text-[#FF4444] font-mono flex gap-2 items-start shadow-tech-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase block">COMPLIANCE_RESTRICTION_EXCEPTION:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Employee List */}
        <div className="lg:col-span-2 bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-[#141414] pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-[#141414] flex items-center gap-2">
                <Users className="w-5 h-5" /> Staff Registry & Access Matrix
              </h3>
              <p className="text-[10px] font-mono text-gray-500">
                Manage HR allocations, geofenced attendance parameters, and payslips.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-[#141414] hover:bg-[#FF4444] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border-2 border-[#141414]"
            >
              <UserPlus className="w-4 h-4" /> ADD OPERATOR
            </button>
          </div>

          {/* Add Employee Form */}
          {showAddForm && (
            <form onSubmit={handleCreateEmployee} className="p-4 bg-[#FCFAF5] border-2 border-[#141414] space-y-4">
              <span className="text-xs font-black uppercase tracking-wider block border-b border-gray-300 pb-1">
                Draft New Operator Profile
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Anand"
                    className="w-full px-2.5 py-1.5 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Verma"
                    className="w-full px-2.5 py-1.5 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91-XXXXX-XXXXX"
                    className="w-full px-2.5 py-1.5 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Department</label>
                  <select
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                  >
                    <option value="OPS">OPERATIONS (OPS)</option>
                    <option value="LGL">LEGAL (LGL)</option>
                    <option value="FIN">FINANCE (FIN)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-700 block">Job Grade / Scale</label>
                  <select
                    value={jobGrade}
                    onChange={(e) => setJobGrade(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                  >
                    <option value="E2">EXECUTIVE scale E2</option>
                    <option value="TL3">SUPERVISOR scale T3</option>
                    <option value="M5">MANAGER scale M5</option>
                    <option value="L5">COUNSEL scale L5</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 max-w-xs">
                <label className="text-[10px] font-bold uppercase text-gray-700 block">Base Salary ($)</label>
                <input
                  type="number"
                  value={salaryBase}
                  onChange={(e) => setSalaryBase(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border-2 border-[#141414] bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#141414] text-white hover:bg-green-600 font-bold text-xs border-2 border-[#141414] transition-all cursor-pointer shadow-tech-sm"
                >
                  SAVE PROFILE & SET PERMISSIONS
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-[#141414] font-bold text-xs border-2 border-[#141414] transition-all cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {/* Search filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, contact phone..."
              className="flex-1 px-3 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:bg-white focus:outline-none focus:shadow-tech-sm"
            />
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-mono border-2 border-[#141414] bg-[#FCFAF5] focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="OPS">Operations (OPS)</option>
              <option value="LGL">Legal (LGL)</option>
              <option value="FIN">Finance (FIN)</option>
            </select>
          </div>

          {/* Advanced table */}
          <div className="overflow-x-auto border-2 border-[#141414]">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#FCFAF5] border-b-2 border-[#141414]">
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Staff Name</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase text-center">Grade</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Dept</th>
                  <th className="p-3 border-r-2 border-[#141414] font-bold uppercase">Phone</th>
                  <th className="p-3 font-bold uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => setSelectedEmp(emp)}
                    className={`cursor-pointer hover:bg-gray-50 transition-all ${
                      selectedEmp?.id === emp.id ? "bg-[#F2F1ED] font-bold" : ""
                    }`}
                  >
                    <td className="p-3 border-r-2 border-[#141414]">
                      {emp.firstName} {emp.lastName}
                      <span className="text-[10px] block text-gray-500">ID: {emp.id}</span>
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-center bg-gray-50">
                      {emp.jobGrade}
                    </td>
                    <td className="p-3 border-r-2 border-[#141414] text-center">
                      <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-300">
                        {emp.departmentCode}
                      </span>
                    </td>
                    <td className="p-3 border-r-2 border-[#141414]">
                      {emp.phone}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSoftDelete(emp.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-500 transition-all cursor-pointer"
                        title="Deactivate Operator Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-2 font-mono text-xs">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 border-2 border-[#141414] disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
            >
              ← PREVIOUS
            </button>
            <span>PAGE {page} OF {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 border-2 border-[#141414] disabled:opacity-50 hover:bg-gray-100 cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        </div>

        {/* Right Side: Selected Operator Action Panels (Payslip & Attendance Setup) */}
        <div className="lg:col-span-1 space-y-6">
          {selectedEmp ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white border-4 border-[#141414] p-4 shadow-tech-sm space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-[#141414] px-2 py-0.5">
                  OPERATOR METADATA CARD
                </span>
                <div>
                  <h4 className="text-sm font-black uppercase text-[#141414]">
                    {selectedEmp.firstName} {selectedEmp.lastName}
                  </h4>
                  <p className="text-[10px] font-mono text-gray-500">
                    Department: <span className="font-bold text-[#141414]">{selectedEmp.departmentCode}</span> • Base: ${selectedEmp.salaryBase}/mo
                  </p>
                </div>

                {/* Geofenced checkin punch */}
                <div className="border-2 border-[#141414] p-3 bg-[#FCFAF5] space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-300 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Attendance Clock
                    </span>
                    <select
                      value={attendanceAction}
                      onChange={(e) => setAttendanceAction(e.target.value as any)}
                      className="text-[10px] font-mono border border-gray-400 bg-white"
                    >
                      <option value="IN">CLOCK-IN</option>
                      <option value="OUT">CLOCK-OUT</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAttendanceClock}
                    className="w-full py-1.5 bg-[#141414] text-white hover:bg-[#FF4444] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all border border-[#141414]"
                  >
                    <MapPin className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                    <span>PUNCH GPS-GEOFENCE CLOCK</span>
                  </button>

                  {clockInfo && (
                    <div className="bg-white border border-gray-300 p-2 text-[10px] font-mono space-y-1">
                      <p className="text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> PUNCH_SUCCESSFUL
                      </p>
                      <p>Time: {new Date(clockInfo.clockIn || clockInfo.clockOut).toLocaleTimeString()}</p>
                      <p className="text-[9px] text-gray-500">Fingerprint: {clockInfo.deviceFingerprint}</p>
                    </div>
                  )}
                </div>

                {/* Payroll Payslip Panel */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setShowPayslipForm(!showPayslipForm)}
                    className="w-full py-2 bg-gray-200 hover:bg-[#141414] hover:text-white text-[#141414] font-bold text-xs border-2 border-[#141414] flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>MONTHLY PAYSLIP GATE</span>
                  </button>

                  {showPayslipForm && (
                    <form onSubmit={handleGeneratePayslip} className="p-3 bg-gray-50 border-2 border-dashed border-[#141414] space-y-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                        Calculate & Authorize Salary Net Payout
                      </span>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-gray-700 block">Month (YYYY-MM)</label>
                        <input
                          type="text"
                          value={monthYear}
                          onChange={(e) => setMonthYear(e.target.value)}
                          placeholder="e.g. 2026-07"
                          className="w-full px-2 py-1 text-[10px] font-mono border border-gray-400 bg-white focus:outline-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-gray-700 block">Performance Bonus ($)</label>
                          <input
                            type="number"
                            value={bonusEarned}
                            onChange={(e) => setBonusEarned(e.target.value)}
                            className="w-full px-2 py-1 text-[10px] font-mono border border-gray-400 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-gray-700 block">Deductions ($)</label>
                          <input
                            type="number"
                            value={deductions}
                            onChange={(e) => setDeductions(e.target.value)}
                            className="w-full px-2 py-1 text-[10px] font-mono border border-gray-400 bg-white"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-1 bg-[#141414] hover:bg-green-600 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        DISPATCH BANK TRANSFER
                      </button>
                    </form>
                  )}

                  {payslipInfo && (
                    <div className="bg-[#EBF7FF] border border-[#1E88E5] p-3 text-[10px] font-mono space-y-1.5 shadow-tech-sm">
                      <p className="font-bold uppercase text-[#1E88E5] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Payout Document Dispatched
                      </p>
                      <p>Payslip ID: <span className="font-bold">{payslipInfo.id}</span></p>
                      <p>Base: ${payslipInfo.baseSalary} • Incentives: +${payslipInfo.incentivePaid}</p>
                      <p>Deductions: -${payslipInfo.deductions}</p>
                      <p className="text-sm font-bold border-t border-dashed border-gray-300 pt-1 text-[#141414]">
                        Net Paid: ${payslipInfo.netPaid}
                      </p>
                      <p className="text-[8px] text-gray-500 mt-1">Ref Ref No: {payslipInfo.transactionRef}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-[#141414] p-8 text-center text-gray-500 font-mono text-sm shadow-tech-sm">
              Select an operator profile from the staff grid to execute geofence attendances and payslip dispatches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
