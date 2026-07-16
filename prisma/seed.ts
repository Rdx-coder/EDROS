// @ts-nocheck
// prisma/seed.ts
//
// EDROS Enterprise Core Database Seeder
// Seeds production role-based access control, state boundaries, operational departments,
// default job structures, sample branches, and mock compliance accounts.

import "../src/infrastructure/dbUrlSanitizer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding for EDROS Core...");

  // 1. Clean old data if any
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "role_permissions" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "permissions" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "roles" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "departments" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "job_titles" CASCADE;`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "employee_statuses" CASCADE;`);

  // 2. Seed Permissions
  const permissionsData = [
    { code: "MANAGE_TENANTS", name: "Manage Multi-Tenants", module: "SYSTEM" },
    { code: "MANAGE_BANKS", name: "Manage Partner Banks", module: "SYSTEM" },
    { code: "MANAGE_HIERARCHY", name: "Manage Office Hierarchy", module: "ORG" },
    { code: "MANAGE_USERS", name: "Manage User Directory", module: "ORG" },
    { code: "VIEW_DEBT_SENSITIVE", name: "View Masked Debtor PII", module: "DEBT" },
    { code: "ALLOCATE_DEBT_CASES", name: "Allocate Recovery Cases", module: "DEBT" },
    { code: "INITIATE_RECOVERY_ACTION", name: "Perform Calls and Audits", module: "DEBT" },
    { code: "APPROVE_SETTLEMENT_L1", name: "Approve L1 Settlement (Haircut <= 15%)", module: "FINANCE" },
    { code: "APPROVE_SETTLEMENT_L2", name: "Approve L2 Settlement (Haircut <= 30%)", module: "FINANCE" },
    { code: "APPROVE_SETTLEMENT_L3", name: "Approve L3 Settlement (Haircut <= 50%)", module: "FINANCE" },
    { code: "GENERATE_LEGAL_NOTICE", name: "Generate Legal Action Notices", module: "LEGAL" },
    { code: "VIEW_AUDIT_LOGS", name: "View Central Audit Telemetry", module: "AUDIT" }
  ];

  console.log(`🔑 Seeding ${permissionsData.length} granular access permissions...`);
  const seededPermissions: Record<string, any> = {};
  for (const perm of permissionsData) {
    const record = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm
    });
    seededPermissions[perm.code] = record;
  }

  // 3. Seed Roles
  const rolesData = [
    { name: "SUPER_ADMIN", description: "Global systems operator. Full administrative control across all tenant nodes." },
    { name: "TENANT_ADMIN", description: "Tenant organization administrator. Manages local staff, partners, and settings." },
    { name: "BANK_COMPLIANCE", description: "Partner bank auditor. Reviews case audit trails, SLA compliance, and settlement margins." },
    { name: "RECOVERY_HEAD", description: "Enterprise recovery operations director. Oversees settlements and geographical campaigns." },
    { name: "REGIONAL_MANAGER", description: "Manages multiple physical branches and regional portfolios. Grants L3 settlements." },
    { name: "BRANCH_MANAGER", description: "Controls branch offices, tracks local recovery targets, and approves L2 settlements." },
    { name: "TEAM_LEADER", description: "Supervises team of field agents and callers. Approves L1 settlements and triggers reallocations." },
    { name: "RECOVERY_EXECUTIVE", description: "Frontline field recovery executive or tele-caller executing daily recovery actions." },
    { name: "LEGAL_COUNSEL", description: "In-house attorney generating legal demands, notices, and handling litigations." }
  ];

  console.log(`👥 Seeding ${rolesData.length} core security roles...`);
  const seededRoles: Record<string, any> = {};
  for (const role of rolesData) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role
    });
    seededRoles[role.name] = record;
  }

  // 4. Map Role Permissions
  const rolePermissionsMap: Record<string, string[]> = {
    SUPER_ADMIN: ["MANAGE_TENANTS", "MANAGE_BANKS", "VIEW_AUDIT_LOGS"],
    TENANT_ADMIN: ["MANAGE_HIERARCHY", "MANAGE_USERS", "VIEW_DEBT_SENSITIVE", "VIEW_AUDIT_LOGS"],
    BANK_COMPLIANCE: ["VIEW_DEBT_SENSITIVE", "VIEW_AUDIT_LOGS"],
    RECOVERY_HEAD: ["VIEW_DEBT_SENSITIVE", "ALLOCATE_DEBT_CASES", "APPROVE_SETTLEMENT_L3", "VIEW_AUDIT_LOGS"],
    REGIONAL_MANAGER: ["VIEW_DEBT_SENSITIVE", "ALLOCATE_DEBT_CASES", "APPROVE_SETTLEMENT_L3"],
    BRANCH_MANAGER: ["VIEW_DEBT_SENSITIVE", "ALLOCATE_DEBT_CASES", "APPROVE_SETTLEMENT_L2"],
    TEAM_LEADER: ["VIEW_DEBT_SENSITIVE", "ALLOCATE_DEBT_CASES", "APPROVE_SETTLEMENT_L1", "INITIATE_RECOVERY_ACTION"],
    RECOVERY_EXECUTIVE: ["INITIATE_RECOVERY_ACTION"],
    LEGAL_COUNSEL: ["VIEW_DEBT_SENSITIVE", "GENERATE_LEGAL_NOTICE", "INITIATE_RECOVERY_ACTION"]
  };

  console.log("🔗 Binding granular permissions to enterprise roles...");
  for (const [roleName, permissions] of Object.entries(rolePermissionsMap)) {
    const role = seededRoles[roleName];
    for (const permCode of permissions) {
      const permission = seededPermissions[permCode];
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }

  // 5. Seed Departments
  const departments = [
    { name: "Information Technology", code: "IT" },
    { name: "Recovery Operations", code: "OPS" },
    { name: "Legal & Litigation", code: "LGL" },
    { name: "Human Resources", code: "HR" },
    { name: "Audit & Compliance", code: "COMP" },
    { name: "Finance & Accounts", code: "FIN" }
  ];

  console.log(`🏢 Seeding ${departments.length} corporate departments...`);
  for (const dept of departments) {
    await prisma.department.create({
      data: dept
    });
  }

  // 6. Seed Job Titles
  const jobTitles = [
    { name: "Chief Operations Officer", grade: "M10" },
    { name: "National Recovery Head", grade: "M9" },
    { name: "Regional Recovery Manager", grade: "M8" },
    { name: "Branch Operations Manager", grade: "M7" },
    { name: "Portfolio Team Leader", grade: "M5" },
    { name: "Senior Recovery Executive", grade: "E3" },
    { name: "Tele-Recovery Executive", grade: "E2" },
    { name: "Field Collector Officer", grade: "E1" },
    { name: "Senior Litigation Counsel", grade: "L5" }
  ];

  console.log(`🎖️ Seeding ${jobTitles.length} staff job grades...`);
  for (const title of jobTitles) {
    await prisma.jobTitle.create({
      data: title
    });
  }

  // 7. Seed Employee Statuses
  const statuses = [
    { code: "ACTIVE", label: "Active Employee" },
    { code: "ON_LEAVE", label: "On Approved Leave" },
    { code: "SUSPENDED", label: "Suspended / Pending Audit" },
    { code: "TERMINATED", label: "Terminated / Former Employee" }
  ];

  console.log(`📋 Seeding ${statuses.length} employee operational states...`);
  for (const status of statuses) {
    await prisma.employeeStatus.create({
      data: status
    });
  }

  console.log("✅ EDROS Seeding process completed successfully. Ready for deployment.");
}

main()
  .catch((e) => {
    console.error("❌ Database seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
