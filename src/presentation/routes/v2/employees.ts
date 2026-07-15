/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Response } from "express";
import { UserRole } from "../../../types";
import { authorizePermission } from "../../middlewares";
import { StructuredLogger } from "../../../infrastructure/logging";

const router = express.Router();

// Mock database store representing the normalized tables
export let employeesDb: any[] = [
  {
    id: "emp-901",
    userId: "usr-901",
    firstName: "Rohan",
    lastName: "Sharma",
    phone: "+91-98765-43210",
    departmentCode: "OPS",
    jobGrade: "E2",
    status: "ACTIVE",
    joinedDate: "2024-01-15T00:00:00.000Z",
    salaryBase: 45000,
    branchId: "branch-mumbai",
    teamId: "team-alpha",
    isDeleted: false
  },
  {
    id: "emp-902",
    userId: "usr-902",
    firstName: "Siddharth",
    lastName: "Mehta",
    phone: "+91-99887-76655",
    departmentCode: "OPS",
    jobGrade: "M5",
    status: "ACTIVE",
    joinedDate: "2023-06-10T00:00:00.000Z",
    salaryBase: 85000,
    branchId: "branch-mumbai",
    teamId: "team-alpha",
    isDeleted: false
  },
  {
    id: "emp-903",
    userId: "usr-903",
    firstName: "Priya",
    lastName: "Nair",
    phone: "+91-91234-56789",
    departmentCode: "LGL",
    jobGrade: "L5",
    status: "ACTIVE",
    joinedDate: "2022-11-01T00:00:00.000Z",
    salaryBase: 120000,
    branchId: "branch-delhi",
    teamId: "team-legal-north",
    isDeleted: false
  }
];

export let attendancesDb: any[] = [
  {
    id: "att-101",
    employeeId: "emp-901",
    workDate: "2026-07-13",
    clockIn: "2026-07-13T09:12:45.000Z",
    clockOut: "2026-07-13T18:05:12.000Z",
    status: "PRESENT",
    deviceFingerprint: "browser-safari-mac"
  },
  {
    id: "att-102",
    employeeId: "emp-902",
    workDate: "2026-07-13",
    clockIn: "2026-07-13T08:55:00.000Z",
    clockOut: "2026-07-13T18:15:30.000Z",
    status: "PRESENT",
    deviceFingerprint: "browser-chrome-windows"
  }
];

export let payslipsDb: any[] = [
  {
    id: "ps-201",
    employeeId: "emp-901",
    monthYear: "2026-06",
    baseSalary: 45000,
    incentivePaid: 3500,
    deductions: 1200,
    netPaid: 47300,
    paymentStatus: "PAID",
    paidDate: "2026-07-01T10:00:00.000Z",
    transactionRef: "TXN-902810481"
  }
];

/**
 * 1. GET: List all employees (Pagination, Search, Sorting, Filtering)
 * RBAC: Accessible by Tenant Admin, Branch Managers, Regional Managers, Recovery Heads, HR
 */
router.get(
  "/",
  authorizePermission([
    UserRole.TENANT_ADMIN,
    UserRole.RECOVERY_HEAD,
    UserRole.REGIONAL_MANAGER,
    UserRole.BRANCH_MANAGER
  ]),
  async (req: any, res: Response) => {
    const { department, status, q, sortBy, order, page = "1", limit = "10" } = req.query;

    let results = employeesDb.filter((emp) => !emp.isDeleted);

    // Filtering
    if (department) {
      results = results.filter((emp) => emp.departmentCode === department);
    }
    if (status) {
      results = results.filter((emp) => emp.status === status);
    }

    // Search
    if (q) {
      const searchStr = q.toLowerCase();
      results = results.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(searchStr) ||
          emp.lastName.toLowerCase().includes(searchStr) ||
          emp.phone.includes(searchStr)
      );
    }

    // Sorting
    if (sortBy) {
      const isAsc = order === "asc";
      results.sort((a, b) => {
        const valA = a[sortBy] || "";
        const valB = b[sortBy] || "";
        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedResults = results.slice(startIndex, endIndex);

    StructuredLogger.info(`Listed employees (Count: ${results.length})`, req.correlationId);

    res.json({
      success: true,
      count: results.length,
      page: pageNum,
      totalPages: Math.ceil(results.length / limitNum),
      data: paginatedResults
    });
  }
);

/**
 * 2. GET: Retrieve Employee by ID
 */
router.get(
  "/:id",
  authorizePermission([
    UserRole.TENANT_ADMIN,
    UserRole.RECOVERY_HEAD,
    UserRole.REGIONAL_MANAGER,
    UserRole.BRANCH_MANAGER
  ]),
  async (req: any, res: Response) => {
    const emp = employeesDb.find((e) => e.id === req.params.id && !e.isDeleted);
    if (!emp) {
      return res.status(404).json({ error: "NOT_FOUND", message: `Employee with ID ${req.params.id} does not exist.` });
    }
    res.json({ success: true, data: emp });
  }
);

/**
 * 3. POST: Create Employee (Validation, Audit logs)
 */
router.post(
  "/",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    const { firstName, lastName, phone, departmentCode, jobGrade, salaryBase, branchId, teamId } = req.body;

    // Strict validation
    if (!firstName || !lastName || !phone || !departmentCode || !jobGrade || !salaryBase) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "Missing parameters. firstName, lastName, phone, departmentCode, jobGrade, and salaryBase are required."
      });
    }

    const newEmp = {
      id: `emp-${Math.floor(100 + Math.random() * 900)}`,
      userId: `usr-${Math.floor(100 + Math.random() * 900)}`,
      firstName,
      lastName,
      phone,
      departmentCode,
      jobGrade,
      status: "ACTIVE",
      joinedDate: new Date().toISOString(),
      salaryBase: Number(salaryBase),
      branchId: branchId || "branch-mumbai",
      teamId: teamId || "team-alpha",
      isDeleted: false
    };

    employeesDb.push(newEmp);

    StructuredLogger.info(`[AUDIT] Created Employee Profile ID: ${newEmp.id} for user ${req.operator.email}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Employee profile created successfully.",
      data: newEmp
    });
  }
);

/**
 * 4. PUT: Update Employee (Validation, Audit logs)
 */
router.put(
  "/:id",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    const empIdx = employeesDb.findIndex((e) => e.id === req.params.id && !e.isDeleted);
    if (empIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: `Employee with ID ${req.params.id} does not exist.` });
    }

    const { firstName, lastName, phone, status, salaryBase } = req.body;

    if (salaryBase && isNaN(Number(salaryBase))) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "salaryBase must be a numeric value." });
    }

    const updated = {
      ...employeesDb[empIdx],
      firstName: firstName || employeesDb[empIdx].firstName,
      lastName: lastName || employeesDb[empIdx].lastName,
      phone: phone || employeesDb[empIdx].phone,
      status: status || employeesDb[empIdx].status,
      salaryBase: salaryBase ? Number(salaryBase) : employeesDb[empIdx].salaryBase,
      updatedAt: new Date().toISOString()
    };

    employeesDb[empIdx] = updated;

    StructuredLogger.info(`[AUDIT] Updated Employee Profile ID: ${req.params.id}`, req.correlationId);

    res.json({
      success: true,
      message: "Employee updated successfully.",
      data: updated
    });
  }
);

/**
 * 5. DELETE: Soft Delete Employee
 */
router.delete(
  "/:id",
  authorizePermission([UserRole.TENANT_ADMIN]),
  async (req: any, res: Response) => {
    const empIdx = employeesDb.findIndex((e) => e.id === req.params.id && !e.isDeleted);
    if (empIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: `Employee with ID ${req.params.id} does not exist.` });
    }

    employeesDb[empIdx].isDeleted = true;
    employeesDb[empIdx].status = "TERMINATED";
    employeesDb[empIdx].leftDate = new Date().toISOString();

    StructuredLogger.info(`[AUDIT] Soft deleted Employee Profile ID: ${req.params.id}`, req.correlationId);

    res.json({
      success: true,
      message: "Employee profile marked as soft-deleted successfully.",
      id: req.params.id
    });
  }
);

/**
 * 6. POST: Attendance Check-In (Double punching verification)
 */
router.post(
  "/:id/attendance",
  authorizePermission([UserRole.RECOVERY_EXECUTIVE, UserRole.TEAM_LEADER, UserRole.BRANCH_MANAGER]),
  async (req: any, res: Response) => {
    const employeeId = req.params.id;
    const { action, deviceFingerprint } = req.body; // action: IN or OUT

    const workDate = new Date().toISOString().split("T")[0];

    const existingIndex = attendancesDb.findIndex((a) => a.employeeId === employeeId && a.workDate === workDate);

    if (action === "IN") {
      if (existingIndex !== -1) {
        return res.status(409).json({
          error: "ALREADY_CHECKED_IN",
          message: `Employee ${employeeId} has already clocked in today (${workDate}).`
        });
      }

      const record = {
        id: `att-${Math.floor(1000 + Math.random() * 9000)}`,
        employeeId,
        workDate,
        clockIn: new Date().toISOString(),
        clockOut: null,
        status: "PRESENT",
        deviceFingerprint: deviceFingerprint || "web-platform-agent"
      };

      attendancesDb.push(record);
      return res.status(201).json({ success: true, message: "Attendance clocked in.", data: record });
    } else if (action === "OUT") {
      if (existingIndex === -1) {
        return res.status(400).json({
          error: "CLOCK_IN_REQUIRED",
          message: "Cannot clock out. No clock-in record found for today."
        });
      }

      attendancesDb[existingIndex].clockOut = new Date().toISOString();
      return res.json({ success: true, message: "Attendance clocked out.", data: attendancesDb[existingIndex] });
    } else {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "action must be either IN or OUT." });
    }
  }
);

/**
 * 7. POST: Generate Payroll Payslip
 */
router.post(
  "/:id/payslip",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    const employeeId = req.params.id;
    const { monthYear, bonusEarned, deductions } = req.body;

    if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "monthYear is required in YYYY-MM format." });
    }

    const emp = employeesDb.find((e) => e.id === employeeId && !e.isDeleted);
    if (!emp) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Employee profile not found." });
    }

    const baseSalary = emp.salaryBase;
    const bonus = bonusEarned ? Number(bonusEarned) : 0;
    const deduct = deductions ? Number(deductions) : 0;
    const netPaid = baseSalary + bonus - deduct;

    const payslip = {
      id: `ps-${Math.floor(100 + Math.random() * 900)}`,
      employeeId,
      monthYear,
      baseSalary,
      incentivePaid: bonus,
      deductions: deduct,
      netPaid,
      paymentStatus: "PAID",
      paidDate: new Date().toISOString(),
      transactionRef: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    payslipsDb.push(payslip);

    StructuredLogger.info(`[AUDIT] Generated monthly payslip ${payslip.id} for employee ${employeeId}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Monthly salary payslip generated and paid successfully.",
      data: payslip
    });
  }
);

export default router;
