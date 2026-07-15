/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Users, Building2, ChevronRight, ChevronDown, CheckCircle2, ShieldCheck } from "lucide-react";

interface HierarchyNode {
  id: string;
  name: string;
  type: "STATE" | "REGION" | "BRANCH" | "TEAM" | "EXECUTIVE";
  manager?: string;
  kpis: {
    outstanding: string;
    activeCases: number;
    headcount?: number;
    authorityLimit?: string;
  };
  children?: HierarchyNode[];
}

export default function HierarchyChart() {
  const [activeNodeId, setActiveNodeId] = useState<string>("state-mh");

  const hierarchyData: HierarchyNode = {
    id: "state-mh",
    name: "Maharashtra Corporate Division",
    type: "STATE",
    manager: "Anand Deshmukh (Recovery Head - State)",
    kpis: { outstanding: "₹42.5 Crores", activeCases: 1420, headcount: 85 },
    children: [
      {
        id: "region-west",
        name: "Western Mumbai Region",
        type: "REGION",
        manager: "Karan Verma (Regional Recovery Manager)",
        kpis: { outstanding: "₹18.2 Crores", activeCases: 540, headcount: 28 },
        children: [
          {
            id: "branch-mumbai",
            name: "Mumbai Corporate Hub",
            type: "BRANCH",
            manager: "Satish Sharma (Branch Manager)",
            kpis: { outstanding: "₹8.4 Crores", activeCases: 210, headcount: 12 },
            children: [
              {
                id: "team-squad-alpha",
                name: "NPA Recovery Squad Alpha",
                type: "TEAM",
                manager: "Priya Nair (Team Leader)",
                kpis: { outstanding: "₹3.8 Crores", activeCases: 85, headcount: 5, authorityLimit: "Up to 15% Haircut" },
                children: [
                  {
                    id: "exec-01",
                    name: "Rohan Sawant",
                    type: "EXECUTIVE",
                    kpis: { outstanding: "₹1.4 Crores", activeCases: 32, authorityLimit: "No Independent Haircut Approval" }
                  },
                  {
                    id: "exec-02",
                    name: "David D'Souza",
                    type: "EXECUTIVE",
                    kpis: { outstanding: "₹2.4 Crores", activeCases: 53, authorityLimit: "No Independent Haircut Approval" }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const findNode = (node: HierarchyNode, id: string): HierarchyNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeNode = findNode(hierarchyData, activeNodeId) || hierarchyData;

  const renderNodeTree = (node: HierarchyNode, depth = 0) => {
    const isActive = activeNodeId === node.id;
    return (
      <div key={node.id} className="space-y-1">
        <div
          onClick={() => setActiveNodeId(node.id)}
          className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all ${
            isActive
              ? "bg-brand-dark-bg border-brand-dark-bg text-white shadow-none"
              : "bg-white border-brand-dark-bg hover:bg-brand-gray-light text-brand-dark-bg hover:shadow-tech-sm"
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {node.type === "STATE" && <Building2 className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-brand-dark-bg"}`} />}
          {node.type === "REGION" && <Building2 className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-brand-dark-bg"}`} />}
          {node.type === "BRANCH" && <Building2 className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-brand-dark-bg"}`} />}
          {node.type === "TEAM" && <Users className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-brand-dark-bg"}`} />}
          {node.type === "EXECUTIVE" && <Users className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-brand-dark-bg/60"}`} />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`font-bold text-sm truncate ${isActive ? "text-white" : "text-brand-dark-bg"}`}>{node.name}</span>
              <span className={`text-[9px] uppercase font-mono font-black px-1.5 py-0.5 border ${isActive ? "bg-white text-brand-dark-bg border-white" : "bg-brand-muted-bg text-brand-dark-bg border-brand-dark-bg"}`}>
                {node.type}
              </span>
            </div>
            {node.manager && (
              <p className={`text-xs truncate mt-0.5 ${isActive ? "text-white/80" : "text-brand-dark-bg/60 font-semibold"}`}>{node.manager}</p>
            )}
          </div>
          {node.children && node.children.length > 0 ? (
            <ChevronDown className={`w-4 h-4 ${isActive ? "text-white" : "text-brand-dark-bg/60"}`} />
          ) : (
            <ChevronRight className={`w-4 h-4 ${isActive ? "text-white/40" : "text-brand-dark-bg/35"}`} />
          )}
        </div>

        {node.children && node.children.map((child) => renderNodeTree(child, depth + 1))}
      </div>
    );
  };

  return (
    <div id="hierarchy-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px] text-brand-dark-bg">
      {/* Interactive Hierarchy Chart */}
      <div id="tree-viewer" className="lg:grid-cols-6 lg:col-span-6 bg-white border-2 border-brand-dark-bg p-4 overflow-y-auto flex flex-col space-y-4 shadow-tech-sm">
        <div className="flex items-center justify-between border-b-2 border-brand-dark-bg pb-3">
          <h3 className="text-sm font-black uppercase text-brand-dark-bg">State-To-Agent Operational Hierarchy</h3>
          <span className="text-xs font-mono font-bold text-brand-accent">Multi-Bank Enabled</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {renderNodeTree(hierarchyData)}
        </div>
      </div>

      {/* Selected Entity KPIs and Authority Specs */}
      <div id="kpi-viewer" className="lg:grid-cols-6 lg:col-span-6 bg-white border-2 border-brand-dark-bg p-5 flex flex-col justify-between shadow-tech-sm">
        <div className="space-y-5">
          <div className="border-b-2 border-brand-gray-light pb-4">
            <span className="text-[9px] font-mono uppercase bg-brand-dark-bg text-white px-2 py-0.5 font-bold">
              Level Details
            </span>
            <h3 className="text-lg font-black uppercase text-brand-dark-bg mt-2">{activeNode.name}</h3>
            {activeNode.manager && (
              <p className="text-sm text-brand-accent mt-0.5 font-black uppercase tracking-wider text-xs font-mono">{activeNode.manager}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-gray-light border-2 border-brand-dark-bg p-3 shadow-tech-sm">
              <span className="text-xs font-semibold text-brand-dark-bg/70 uppercase font-mono">Active Cases Managed</span>
              <p className="text-xl font-black font-mono text-brand-dark-bg mt-1">
                {activeNode.kpis.activeCases}
              </p>
            </div>
            <div className="bg-brand-gray-light border-2 border-brand-dark-bg p-3 shadow-tech-sm">
              <span className="text-xs font-semibold text-brand-dark-bg/70 uppercase font-mono">Outstanding Portfolio</span>
              <p className="text-xl font-black font-mono text-brand-accent mt-1">
                {activeNode.kpis.outstanding}
              </p>
            </div>
          </div>

          {activeNode.kpis.headcount && (
            <div className="p-3 bg-brand-muted-bg border-2 border-brand-dark-bg flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-brand-dark-bg/80 uppercase">Active Staff Headcount</span>
              <span className="text-sm font-black text-brand-dark-bg">{activeNode.kpis.headcount} Agents</span>
            </div>
          )}

          <div className="p-4 bg-brand-accent/5 border-2 border-brand-accent space-y-2">
            <h4 className="text-xs font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4" /> Settlement Authority Haircut Tier
            </h4>
            <p className="text-xs text-brand-dark-bg font-medium leading-relaxed font-sans">
              {activeNode.type === "STATE" && "Ultimate State Approval: Authorized to approve haircuts exceeding 40% in collaboration with Bank Compliance committees."}
              {activeNode.type === "REGION" && "Regional Approval L3 Cap: Authorized to approve haircut proposals between 30% and 40% outstanding debt write-off."}
              {activeNode.type === "BRANCH" && "Branch Manager L2 Cap: Authorized to approve haircut proposals between 15% and 30% principal discount."}
              {activeNode.type === "TEAM" && "Team Leader L1 Cap: Authorized to approve localized settle compromises up to 15% total outstanding."}
              {activeNode.type === "EXECUTIVE" && "Field/Tele-Agent Cap: No independent settlement negotiation authority. Operates strictly under L1/L2 escalation guidelines."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-dark-bg/60 font-mono pt-4 border-t-2 border-brand-gray-light mt-4">
          <CheckCircle2 className="w-4 h-4 text-brand-dark-bg shrink-0" />
          Multi-Tenant isolation guarantees data protection between agencies.
        </div>
      </div>
    </div>
  );
}
