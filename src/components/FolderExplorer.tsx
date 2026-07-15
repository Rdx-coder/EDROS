/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Folder, FolderOpen, FileCode, ShieldCheck, Database, FileText, Cpu } from "lucide-react";

interface NodeInfo {
  name: string;
  type: "folder" | "file";
  path: string;
  layer: "Presentation" | "Application" | "Domain" | "Infrastructure" | "Configuration" | "Documentation";
  purpose: string;
  solidPrinciple?: string;
  children?: NodeInfo[];
}

export default function FolderExplorer() {
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>({
    name: "server.ts",
    type: "file",
    path: "/server.ts",
    layer: "Presentation",
    purpose: "Main full-stack server entrypoint. Initialized the Express framework, configures port 3000, wires the DI Container, and mounts Vite for production asset bundling.",
    solidPrinciple: "Dependency Inversion: Wire infrastructure concrete adapters directly to domain contracts during runtime boostrap."
  });

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "src": true,
    "src/domain": true,
    "src/application": true,
    "src/infrastructure": true,
    "src/presentation": true,
    "migrations": true
  });

  const treeData: NodeInfo[] = [
    {
      name: "src",
      type: "folder",
      path: "/src",
      layer: "Domain",
      purpose: "Main source workspace housing Clean Architecture layers and visual presentations.",
      children: [
        {
          name: "domain",
          type: "folder",
          path: "/src/domain",
          layer: "Domain",
          purpose: "Enterprise domain layer containing pure models, enums, and repository abstraction interfaces. No framework or database references allowed.",
          solidPrinciple: "Interface Segregation: Client-specific narrow repository interfaces prevent use-cases from depending on unused DB methods.",
          children: [
            {
              name: "repositories.ts",
              type: "file",
              path: "/src/domain/repositories.ts",
              layer: "Domain",
              purpose: "Abstract contracts defining query and write operations for Debt Cases, Identity Users, Tenants, and Audit Loggers.",
              solidPrinciple: "Dependency Inversion: Higher-level application use-cases rely on these interfaces, inverted from the SQL/Redis adapters."
            }
          ]
        },
        {
          name: "application",
          type: "folder",
          path: "/src/application",
          layer: "Application",
          purpose: "Contains enterprise use-cases, business orchestration workflows, transaction boundary controls, and the central DI container.",
          children: [
            {
              name: "services.ts",
              type: "file",
              path: "/src/application/services.ts",
              layer: "Application",
              purpose: "Includes the primary DebtRecoveryUseCase class executing cases allocation and debt haircut settlements alongside a lightweight DI Container class.",
              solidPrinciple: "Single Responsibility Principle (SRP): Each UseCase performs one focused operational procedure (e.g. Settlement Approvals or Allocation)."
            }
          ]
        },
        {
          name: "infrastructure",
          type: "folder",
          path: "/src/infrastructure",
          layer: "Infrastructure",
          purpose: "Adapter layer housing concrete persistence engines, logging services, external notification bridges, and custom exceptions.",
          children: [
            {
              name: "logging.ts",
              type: "file",
              path: "/src/infrastructure/logging.ts",
              layer: "Infrastructure",
              purpose: "Features structured logging with automatic PII sanitization and correlation-ID injection, coupled with in-memory repository seeds simulating actual DB rows.",
              solidPrinciple: "Liskov Substitution Principle: InMemory Repos can substitute any external PostgreSQL DB seamlessly because both satisfy domain contracts."
            }
          ]
        },
        {
          name: "presentation",
          type: "folder",
          path: "/src/presentation",
          layer: "Presentation",
          purpose: "Coordinates express controllers, versioned REST endpoints, security policies, and custom middleware handlers.",
          children: [
            {
              name: "middlewares.ts",
              type: "file",
              path: "/src/presentation/middlewares.ts",
              layer: "Presentation",
              purpose: "Houses correlation trackers, OWASP-recommended security headers, rate limiters, RBAC filters, global exception traps, and browser caching rules.",
              solidPrinciple: "Open/Closed Principle: Introduce additional security gates into the HTTP pipeline without editing controller internals."
            },
            {
              name: "routes/v2",
              type: "folder",
              path: "/src/presentation/routes/v2",
              layer: "Presentation",
              purpose: "Advanced version 2 enterprise modular REST API endpoints.",
              children: [
                {
                  name: "index.ts",
                  type: "file",
                  path: "/src/presentation/routes/v2/index.ts",
                  layer: "Presentation",
                  purpose: "API Hub mounting modular routers, exposing OpenAPI specs, handling transactional bulk operations, and task scheduling.",
                  solidPrinciple: "Single Responsibility Principle: Isolates bulk ingestion, queueing, and index configurations safely."
                },
                {
                  name: "recovery.ts",
                  type: "file",
                  path: "/src/presentation/routes/v2/recovery.ts",
                  layer: "Presentation",
                  purpose: "Core debt recovery workflows: case search, allocated field records, tele-call registers, and multi-tier settlement proposals.",
                  solidPrinciple: "Liskov Substitution Principle: Plugs perfectly into the system's core authorization limits."
                },
                {
                  name: "employees.ts",
                  type: "file",
                  path: "/src/presentation/routes/v2/employees.ts",
                  layer: "Presentation",
                  purpose: "Granular employee structures, daily geofenced attendance clocks, and monthly payslip generation.",
                  solidPrinciple: "Interface Segregation: Separates personnel structures from transactional debt recovery calculations."
                },
                {
                  name: "finance.ts",
                  type: "file",
                  path: "/src/presentation/routes/v2/finance.ts",
                  layer: "Presentation",
                  purpose: "Double-entry accounting ledgers, receipt creations, billing invoices, and partner bank commission settings.",
                  solidPrinciple: "Open/Closed: Introduce new commission rate limits without editing existing financial systems."
                },
                {
                  name: "legal.ts",
                  type: "file",
                  path: "/src/presentation/routes/v2/legal.ts",
                  layer: "Presentation",
                  purpose: "Court litigation suit dockets, court hearing calendars, judge records, and case adjournment lists.",
                  solidPrinciple: "Dependency Inversion: Decouples local physical court listings from core abstract compliance files."
                }
              ]
            }
          ]
        },
        {
          name: "types.ts",
          type: "file",
          path: "/src/types.ts",
          layer: "Domain",
          purpose: "Declares core TypeScript interfaces, role definitions, permission vectors, and hierarchy structures utilized across the entire EDROS workspace.",
          solidPrinciple: "Highly typed interfaces ensuring complete compilation checks across boundaries."
        }
      ]
    },
    {
      name: "prisma",
      type: "folder",
      path: "/prisma",
      layer: "Configuration",
      purpose: "Enterprise high-density relational database structure configurations, seed lists, and deployment parameters.",
      children: [
        {
          name: "schema.prisma",
          type: "file",
          path: "/prisma/schema.prisma",
          layer: "Configuration",
          purpose: "Primary Prisma schema defining 100+ normalized tables, composite indices, UUID constraints, and soft-delete flags."
        },
        {
          name: "seed.ts",
          type: "file",
          path: "/prisma/seed.ts",
          layer: "Configuration",
          purpose: "Enterprise database seeder populating security roles, corporate departments, staff job grades, and default permissions."
        },
        {
          name: "migration_plan.md",
          type: "file",
          path: "/prisma/migration_plan.md",
          layer: "Documentation",
          purpose: "Production rollout plan covering zero-downtime Blue-Green schema migrations, composite index structures, and rollback safety hooks."
        }
      ]
    },
    {
      name: "migrations",
      type: "folder",
      path: "/migrations",
      layer: "Configuration",
      purpose: "Version-controlled database schema scripts executing DDL adjustments with zero downtime in production.",
      children: [
        {
          name: "README.md",
          type: "file",
          path: "/migrations/README.md",
          layer: "Documentation",
          purpose: "Explains locking models, zero-downtime double-write indices, rolling updates, and rollback constraints for high-reliability banking nodes."
        },
        {
          name: "0001_create_edros_schema.sql",
          type: "file",
          path: "/migrations/0001_create_edros_schema.sql",
          layer: "Configuration",
          purpose: "Initial SQL migration building tables for Tenants, partner banks, States, Regions, Branches, Teams, and the index optimization plans."
        }
      ]
    },
    {
      name: "server.ts",
      type: "file",
      path: "/server.ts",
      layer: "Presentation",
      purpose: "Root full-stack Express server starting port 3000, establishing global endpoints under the /api/v1 router, and binding asset delivery pipelines.",
      solidPrinciple: "Dependency Inversion: Bootstrap environment and wire real-world database / cache dependencies to Domain Interfaces here."
    },
    {
      name: "Dockerfile",
      type: "file",
      path: "/Dockerfile",
      layer: "Configuration",
      purpose: "Defines secure multi-stage Docker builds. Minimizes image footprint using lightweight Alpine nodes and runs under isolated unprivileged service users.",
      solidPrinciple: "Separation of concerns: Isolate dependencies required purely for building the system from dependencies needed in execution."
    },
    {
      name: "docker-compose.yml",
      type: "file",
      path: "/docker-compose.yml",
      layer: "Configuration",
      purpose: "Orchestration plan setting up EDROS core Node application, PostgreSQL relational database, and Redis distributed caching/rate-limiting stack.",
      solidPrinciple: "Infrastructure configuration reflecting isolated microservice environments."
    }
  ];

  const toggleExpand = (path: string) => {
    setExpandedNodes((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (nodes: NodeInfo[], depth = 0) => {
    return (
      <ul className="space-y-1 select-none">
        {nodes.map((node) => {
          const isExpanded = expandedNodes[node.path];
          const hasChildren = node.children && node.children.length > 0;

          return (
            <li key={node.path} className="text-sm">
              <div
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border transition-all ${
                  selectedNode?.path === node.path
                    ? "bg-brand-dark-bg text-white border-brand-dark-bg font-bold"
                    : "hover:bg-brand-gray-light text-brand-dark-bg border-transparent hover:border-brand-dark-bg/20"
                }`}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={() => {
                  if (node.type === "folder") {
                    toggleExpand(node.path);
                  }
                  setSelectedNode(node);
                }}
              >
                {node.type === "folder" ? (
                  isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-brand-dark-bg shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-brand-dark-bg shrink-0" />
                  )
                ) : node.path.endsWith(".sql") ? (
                  <Database className="w-4 h-4 text-brand-accent shrink-0" />
                ) : node.path.endsWith(".md") ? (
                  <FileText className="w-4 h-4 text-brand-dark-bg/60 shrink-0" />
                ) : (
                  <FileCode className="w-4 h-4 text-brand-dark-bg shrink-0" />
                )}
                <span className="font-mono">{node.name}</span>
                {node.type === "folder" && (
                  <span className="text-[9px] uppercase font-mono font-black bg-brand-muted-bg text-brand-dark-bg border border-brand-dark-bg px-1.5 py-0.5 ml-auto">
                    DIR
                  </span>
                )}
              </div>

              {node.type === "folder" && isExpanded && node.children && (
                <div className="mt-0.5">{renderTree(node.children, depth + 1)}</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case "Domain":
        return "bg-brand-dark-bg text-white border-brand-dark-bg";
      case "Application":
        return "bg-brand-muted-bg text-brand-dark-bg border-brand-dark-bg";
      case "Infrastructure":
        return "bg-brand-gray-light text-brand-dark-bg border-brand-dark-bg";
      case "Presentation":
        return "bg-brand-accent text-white border-brand-dark-bg";
      case "Configuration":
        return "bg-brand-dark-bg text-white border-brand-dark-bg";
      default:
        return "bg-brand-gray-mid text-brand-dark-bg border-brand-dark-bg";
    }
  };

  return (
    <div id="folder-explorer-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px] text-brand-dark-bg">
      {/* Visual Directory Tree */}
      <div id="tree-column" className="lg:grid-cols-5 lg:col-span-5 bg-white border-2 border-brand-dark-bg p-4 overflow-y-auto flex flex-col shadow-tech-sm rounded-none">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-brand-dark-bg mb-3">
          <div className="w-3 h-3 bg-brand-dark-bg"></div>
          <div className="w-3 h-3 bg-brand-accent"></div>
          <div className="w-3 h-3 bg-brand-gray-mid"></div>
          <span className="text-xs font-mono text-brand-dark-bg ml-2 font-bold uppercase tracking-wider">EDROS Project Files</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {renderTree(treeData)}
        </div>
      </div>

      {/* Selected Node Architecture Inspector */}
      <div id="inspector-column" className="lg:grid-cols-7 lg:col-span-7 bg-white border-2 border-brand-dark-bg p-5 overflow-y-auto flex flex-col justify-between shadow-tech-sm rounded-none">
        {selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b-2 border-brand-gray-light pb-4">
              <div>
                <h3 className="text-lg font-black font-mono text-brand-dark-bg flex items-center gap-2">
                  {selectedNode.type === "file" ? (
                    <FileCode className="w-5 h-5 text-brand-accent" />
                  ) : (
                    <FolderOpen className="w-5 h-5 text-brand-dark-bg" />
                  )}
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-brand-dark-bg/60 font-mono mt-0.5">{selectedNode.path}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 border-2 font-black uppercase font-mono shadow-tech-sm ${getLayerColor(selectedNode.layer)}`}>
                {selectedNode.layer} Layer
              </span>
            </div>

            <div className="p-4 bg-brand-gray-light border-2 border-brand-dark-bg space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-brand-dark-bg/80 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-brand-accent" /> Layer Responsibility & Purpose
              </h4>
              <p className="text-sm text-brand-dark-bg leading-relaxed font-sans">{selectedNode.purpose}</p>
            </div>

            {selectedNode.solidPrinciple && (
              <div className="p-4 bg-brand-accent/5 border-2 border-brand-accent space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-brand-accent flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> SOLID Design Principle
                </h4>
                <p className="text-sm text-brand-dark-bg leading-relaxed font-sans">{selectedNode.solidPrinciple}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-brand-dark-bg/50 space-y-2">
            <Folder className="w-12 h-12 text-brand-dark-bg/30" />
            <p className="text-sm font-bold font-mono uppercase">Select a file or folder from the tree to inspect specifications.</p>
          </div>
        )}

        <div className="text-[11px] font-mono text-brand-dark-bg/60 border-t-2 border-brand-gray-light pt-4 mt-6">
          Architect Tip: Notice how code flows from the outermost Presentation Layer into Use Cases, relying strictly on abstraction boundaries.
        </div>
      </div>
    </div>
  );
}
