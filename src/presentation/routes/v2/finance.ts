/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Response } from "express";
import { UserRole } from "../../../types";
import { authorizePermission } from "../../middlewares";
import { StructuredLogger } from "../../../infrastructure/logging";

const router = express.Router();

// Mock store representing double entry financial ledger, invoices, receipts, and bank commission models
export let ledgerAccountsDb: any[] = [
  { id: "led-001", name: "Partner Banks Fees Receivable", code: "1200_FEES_REC", accountType: "ASSET", balance: 540000 },
  { id: "led-002", name: "Corporate Operations Income", code: "3000_REV_CORP", accountType: "INCOME", balance: 890000 },
  { id: "led-003", name: "Employee Payroll Expense", code: "4000_PAYROLL", accountType: "EXPENSE", balance: 350000 }
];

export let doubleEntryJournalsDb: any[] = [];
export let invoicesDb: any[] = [
  {
    id: "inv-801",
    invoiceNumber: "INV-2026-0001",
    bankId: "bank-sbi",
    invoiceDate: "2026-07-01",
    totalAmount: 150000,
    taxAmount: 27000,
    paymentStatus: "UNPAID",
    paidDate: null
  }
];

export let receiptsDb: any[] = [];
export let bankCommissionsDb: any[] = [
  { id: "bc-01", bankId: "bank-sbi", incentivePct: 8.5, baseFee: 25000, rangeStart: 0, rangeEnd: 500000 },
  { id: "bc-02", bankId: "bank-sbi", incentivePct: 12.0, baseFee: 30000, rangeStart: 500001, rangeEnd: 2000000 }
];

/**
 * 1. GET: List ledger accounts (Balance sheets audits)
 */
router.get(
  "/ledgers",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD, UserRole.BANK_COMPLIANCE_OFFICER]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: ledgerAccountsDb.length, data: ledgerAccountsDb });
  }
);

/**
 * 2. POST: Post double-entry journal entry voucher (Transactional logic validation)
 */
router.post(
  "/ledgers/journal",
  authorizePermission([UserRole.TENANT_ADMIN]),
  async (req: any, res: Response) => {
    const { debitAccountId, creditAccountId, amount, narration } = req.body;

    if (!debitAccountId || !creditAccountId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "debitAccountId, creditAccountId, and a positive numeric amount are required."
      });
    }

    const debitAccIdx = ledgerAccountsDb.findIndex((l) => l.id === debitAccountId);
    const creditAccIdx = ledgerAccountsDb.findIndex((l) => l.id === creditAccountId);

    if (debitAccIdx === -1 || creditAccIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "One or both ledger accounts do not exist." });
    }

    const voucherNumber = `VCH-${Date.now().toString().slice(-8)}`;

    // Create journal entries
    const debitEntry = {
      id: `je-${Date.now()}-d`,
      accountId: debitAccountId,
      voucherNumber,
      debitAmount: Number(amount),
      creditAmount: 0,
      narration,
      transactionDate: new Date().toISOString()
    };

    const creditEntry = {
      id: `je-${Date.now()}-c`,
      accountId: creditAccountId,
      voucherNumber,
      debitAmount: 0,
      creditAmount: Number(amount),
      narration,
      transactionDate: new Date().toISOString()
    };

    doubleEntryJournalsDb.push(debitEntry, creditEntry);

    // Update balances
    ledgerAccountsDb[debitAccIdx].balance += Number(amount);
    ledgerAccountsDb[creditAccIdx].balance -= Number(amount);

    StructuredLogger.info(`[FIN] Double-entry committed Voucher: ${voucherNumber}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Double-entry transaction posted successfully.",
      voucherNumber,
      ledgerLogs: [debitEntry, creditEntry]
    });
  }
);

/**
 * 3. GET: List all billing invoices issued to partner banks
 */
router.get(
  "/invoices",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD, UserRole.BANK_COMPLIANCE_OFFICER]),
  async (req: any, res: Response) => {
    res.json({ success: true, count: invoicesDb.length, data: invoicesDb });
  }
);

/**
 * 4. POST: Record Invoice payment and issue receipt
 */
router.post(
  "/invoices/:id/receipt",
  authorizePermission([UserRole.TENANT_ADMIN]),
  async (req: any, res: Response) => {
    const invoiceId = req.params.id;
    const { amountPaid, paymentMode, transactionRef } = req.body;

    if (!amountPaid || !paymentMode) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "amountPaid and paymentMode are required." });
    }

    const invIdx = invoicesDb.findIndex((i) => i.id === invoiceId);
    if (invIdx === -1) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Invoice not found." });
    }

    const receiptNo = `REC-${Date.now().toString().slice(-8).toUpperCase()}`;

    const receipt = {
      id: `rec-${Date.now()}`,
      invoiceId,
      receiptNo,
      amountPaid: Number(amountPaid),
      paymentMode,
      transactionRef: transactionRef || "N/A",
      receiptDate: new Date().toISOString()
    };

    receiptsDb.push(receipt);

    // Update invoice status
    invoicesDb[invIdx].paymentStatus = "PAID";
    invoicesDb[invIdx].paidDate = new Date().toISOString();

    StructuredLogger.info(`[FIN] Issued Invoice Receipt ${receiptNo} for Invoice ${invoiceId}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Payment receipt recorded, invoice marked as PAID.",
      data: receipt
    });
  }
);

/**
 * 5. GET: List and query partner bank commission plans
 */
router.get(
  "/commissions",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD, UserRole.BANK_COMPLIANCE_OFFICER]),
  async (req: any, res: Response) => {
    const { bankId } = req.query;
    let results = bankCommissionsDb;
    if (bankId) {
      results = results.filter((bc) => bc.bankId === bankId);
    }
    res.json({ success: true, count: results.length, data: results });
  }
);

/**
 * 6. POST: Set or update Bank commission structures
 */
router.post(
  "/commissions",
  authorizePermission([UserRole.TENANT_ADMIN, UserRole.RECOVERY_HEAD]),
  async (req: any, res: Response) => {
    const { bankId, incentivePct, baseFee, rangeStart, rangeEnd } = req.body;

    if (!bankId || incentivePct === undefined || baseFee === undefined) {
      return res.status(400).json({ error: "VALIDATION_FAILED", message: "bankId, incentivePct, and baseFee are required." });
    }

    const newComm = {
      id: `bc-${Date.now()}`,
      bankId,
      incentivePct: Number(incentivePct),
      baseFee: Number(baseFee),
      rangeStart: rangeStart ? Number(rangeStart) : 0,
      rangeEnd: rangeEnd ? Number(rangeEnd) : 99999999
    };

    bankCommissionsDb.push(newComm);

    StructuredLogger.info(`[FIN] Configured commission matrix rule for Bank ${bankId}`, req.correlationId);

    res.status(201).json({
      success: true,
      message: "Partner Bank commission tier rule saved successfully.",
      data: newComm
    });
  }
);

export default router;
