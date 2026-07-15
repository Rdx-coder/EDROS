/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { FileText, Download, CheckCircle2, ShieldCheck, Terminal, Copy } from "lucide-react";

interface ConfigTemplate {
  title: string;
  filename: string;
  description: string;
  language: string;
  content: string;
}

export default function ConfigExporter() {
  const [activeConfig, setActiveConfig] = useState<string>("nginx");
  const [copied, setCopied] = useState<boolean>(false);

  const configs: Record<string, ConfigTemplate> = {
    nginx: {
      title: "Hardened Nginx Security Proxy",
      filename: "nginx.conf",
      description: "Secures downstream Express server container ingress. Filters bad user-agents, forces HSTS, configures SSL protocols, and enforces micro-caching rules.",
      language: "nginx",
      content: `server {
    listen 80;
    server_name edros.securebank.net;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name edros.securebank.net;

    ssl_certificate /etc/ssl/certs/edros_chain.crt;
    ssl_certificate_key /etc/ssl/private/edros.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;

    # HSTS Security Header Enforcement
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://edros-core-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`
    },
    postgres: {
      title: "PostgreSQL Enterprise Performance Presets",
      filename: "postgresql.conf",
      description: "Optimized configurations for high-concurrency multi-tenant recovery transactions. Configures shared memory, connection pools, and autovacuum aggressive limits.",
      language: "ini",
      content: `# ==============================================================================
# EDROS PostgreSQL Tuning Parameters (Optimized for 16GB Dedicated RAM)
# ==============================================================================
max_connections = 1000
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
huge_pages = try
min_wal_size = 1GB
max_wal_size = 4GB

# Autovacuum aggressive triggers to mitigate table bloat during daily syncs
autovacuum = on
autovacuum_max_workers = 5
autovacuum_vacuum_threshold = 50
autovacuum_vacuum_scale_factor = 0.05`
    },
    drizzle: {
      title: "Drizzle Schema Sync Definition",
      filename: "drizzle.config.ts",
      description: "Bridges TypeScript structural models to the physical PostgreSQL engine. Directs migrations output directories, schema schemas, and database login paths.",
      language: "typescript",
      content: `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  // Strict mode: requires explicit approvals for destructive drops
  strict: true,
  verbose: true,
});`
    },
    kubernetes: {
      title: "K8s Hardened Deployment Pod",
      filename: "deployment.yaml",
      description: "Secures physical container runtimes inside Kubernetes clusters (GKE/EKS). Defines strict securityContext read-only boundaries and resource hard-limits.",
      language: "yaml",
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: edros-core-deployment
  namespace: edros-prod
  labels:
    app: edros-core
spec:
  replicas: 3
  selector:
    matchLabels:
      app: edros-core
  template:
    metadata:
      labels:
        app: edros-core
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: edros-core-node
        image: asia-east1-docker.pkg.dev/edros-prod/images/edros-core:latest
        imagePullPolicy: IfNotPresent
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          limits:
            cpu: "1000m"
            memory: "1024Mi"
          requests:
            cpu: "250m"
            memory: "512Mi"
        ports:
        - containerPort: 3000
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10`
    }
  };

  const currentConfig = configs[activeConfig];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentConfig.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="exporter-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[550px] text-brand-dark-bg">
      {/* File Selectors */}
      <div id="exporter-list" className="lg:grid-cols-4 lg:col-span-4 bg-white border-2 border-brand-dark-bg p-4 flex flex-col justify-between shadow-tech-sm rounded-none">
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-brand-dark-bg border-b-2 border-brand-dark-bg pb-2 font-mono">
            Security Blueprints
          </h3>

          <div className="space-y-2">
            {Object.entries(configs).map(([key, config]) => {
              const isSelected = activeConfig === key;
              return (
                <div
                  key={key}
                  onClick={() => setActiveConfig(key)}
                  className={`p-3 border-2 text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-brand-dark-bg border-brand-dark-bg text-white font-bold shadow-none"
                      : "bg-white border-brand-dark-bg text-brand-dark-bg hover:bg-brand-gray-light hover:shadow-tech-sm"
                  }`}
                >
                  <p className="text-xs font-black font-mono flex items-center gap-2">
                    <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-brand-accent" : "text-brand-dark-bg"}`} />
                    {config.filename}
                  </p>
                  <p className={`text-[10px] mt-1 truncate ${isSelected ? "text-white/80" : "text-brand-dark-bg/60 font-semibold"}`}>{config.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white border-2 border-brand-dark-bg p-2.5 font-black uppercase text-xs font-mono shadow-tech cursor-pointer transition-all mt-4"
        >
          {copied ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> COPIED BLUEPRINT!
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" /> COPY BLUEPRINT
            </span>
          )}
        </button>
      </div>

      {/* Code Viewer Panel */}
      <div id="exporter-viewer" className="lg:grid-cols-8 lg:col-span-8 bg-brand-dark-bg border-2 border-brand-dark-bg p-4 flex flex-col justify-between shadow-tech-sm rounded-none">
        <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-brand-gray-mid pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-accent" />
              <span className="text-xs font-mono font-black text-white">{currentConfig.filename}</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 font-bold bg-[#D1D0CC] text-[#141414]">
              {currentConfig.language}
            </span>
          </div>

          <p className="text-xs text-brand-gray-mid bg-brand-dark-bg border border-brand-gray-mid p-2.5 font-sans leading-relaxed">
            {currentConfig.description}
          </p>

          <div className="flex-1 bg-[#1A1A1A] border-2 border-brand-dark-bg overflow-auto p-3.5 shadow-inner">
            <pre className="font-mono text-[11px] text-[#D1D0CC] whitespace-pre leading-relaxed select-all">
              {currentConfig.content}
            </pre>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#D1D0CC]/60 border-t-2 border-brand-gray-mid pt-3 mt-4 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
          Enforces standard secure practices across Kubernetes and Nginx routing engines.
        </div>
      </div>
    </div>
  );
}
