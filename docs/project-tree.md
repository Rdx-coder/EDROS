# EDROS Complete Production Directory Layout

This tree represents the physical structure of the **Enterprise Debt Recovery Operating System (EDROS)** workspace, aligning strictly with Clean Architecture, SOLID principles, and Domain-Driven Design (DDD).

```
EDROS_ROOT/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Enterprise Github Actions CI/CD pipeline
├── docs/
│   ├── project-tree.md        # File Layout Documentation (this file)
│   └── dependency-graph.md    # Module Dependency Boundaries Diagram
├── migrations/
│   ├── README.md              # DB Migration Strategy
│   └── 0001_create_edros_schema.sql # Baseline DDL schema script
├── src/
│   ├── domain/                # Layer 1: Core Enterprise Domains
│   │   └── repositories.ts    # Decoupled Repository interfaces (Interface Segregation)
│   │
│   ├── application/           # Layer 2: Core Use Cases & Application Services
│   │   └── services.ts        # Business logic controllers & Dependency Injection container
│   │
│   ├── infrastructure/        # Layer 3: Adapters & Concrete Framework Implementations
│   │   └── logging.ts         # Structured Logger, custom Exceptions, and Mock Repositories
│   │
│   ├── presentation/          # Layer 4: Express Interfaces, Security, & Middlewares
│   │   └── middlewares.ts     # Correlation IDs, Security Headers, Rate Limiting, RBAC & Caching
│   │
│   ├── components/            # React UI Shared/Atom Components (Tailwind)
│   │   ├── Sidebar.tsx        # Command rail & Navigation
│   │   ├── Header.tsx         # User profile & Sandbox Tenant Hydration headers
│   │   ├── FolderExplorer.tsx # Interactive visual file tree explorer
│   │   ├── HierarchyChart.tsx # State -> Region -> Branch -> Team -> Exec interactive tree
│   │   ├── SandboxDI.tsx      # Sandbox to test DI Container resolution
│   │   ├── PipelineTrace.tsx  # Simulated middleware pipeline trace visualizer
│   │   └── RbacMatrix.tsx     # Role Permission cross-matrix editor
│   │
│   ├── App.tsx                # Interactive EDROS Architect Portal Interface
│   ├── index.css              # Main tailwind CSS bundle loader
│   ├── main.tsx               # Frontend client bundle entrypoint
│   └── types.ts               # Core enterprise models, enums, & structural interfaces
│
├── .env.example               # Template environment settings and secrets
├── .gitignore                 # Storage paths ignored by git versioning
├── Dockerfile                 # Production Multi-Stage containerization blueprint
├── docker-compose.yml         # Dev/Prod multi-service orchestration bundle
├── index.html                 # HTML body entrypoint
├── metadata.json              # Applet deployment properties
├── package.json               # Package declarations and bundler scripts
├── tsconfig.json              # Compiler options mapping
└── server.ts                  # Root Express app serving the API & SPA assets
```
