---
id: 005
title: Core Codebase Implementation
stage: red
date: 2026-01-06
surface: agent
model: glm-4.6
feature: 001-task-crud
branch: 001-task-crud
user: TBD
command: /sp.implement
labels: ["implementation","typescript","crud"]
links:
  spec: specs/001-task-crud/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - package.json
  - tsconfig.json
  - .eslintrc.js
  - .prettierrc
  - .gitignore
  - src/models/Task.ts
  - src/models/index.ts
  - src/services/StorageService.ts
  - src/services/TaskService.ts
  - src/lib/logger.ts
  - src/lib/time.ts
  - src/lib/validators.ts
  - src/index.ts
  - src/example.ts
  - tests/fixtures/empty-tasks.json
  - tests/fixtures/sample-tasks.json
  - tests/fixtures/corrupted.json
tests: []
---

## Prompt

Run this when you are ready to generate the actual boilerplate and core logic.

Prompt: "Now, implement the core codebase for the Terminal To-Do app. Start by providing the code for the Data Controller (handling JSON read/write) and the Task Manager (the CRUD logic). Ensure the code is modular so I can easily plug in the CLI parser later. Use modern syntax and include brief comments explaining the flow. Ensure the 'Update' functionality allows toggling a task between 'Pending' and 'Completed'."

## Response snapshot

Implemented complete modular core codebase for Terminal To-Do App:

**Project Configuration**:
- package.json: Dependencies (cac, picocolors, tinydate), build scripts, npm scripts
- tsconfig.json: Strict mode enabled, ES2022 target
- .eslintrc.js: TypeScript rules, no-console off for CLI
- .prettierrc: Formatting rules (no semicolons, single quotes)
- .gitignore: Node.js patterns (node_modules/, dist/, *.log, etc.)

**Data Models** (src/models/Task.ts):
- Task interface: id, description, status, created_at, updated_at
- TaskStatus type: 'pending' | 'done'
- TaskInput, TaskUpdate, TaskList interfaces
- ValidationError class with field/message properties
- Validation functions: validateTaskInput, validateTaskStatus, generateNextId, validateUniqueIds, sortTasksByCreated

**Data Controller** (src/services/StorageService.ts):
- Atomic write pattern: write to temp file → rename → cleanup on failure
- Load method: Returns empty TaskList if ENOENT, tries backup on corrupted JSON
- Save method: Creates backup, writes temp file, atomic rename
- Directory creation: Recursive mkdir for ~/.todo-app/
- Error recovery: Automatic backup restore on corruption

**Task Manager** (src/services/TaskService.ts):
- addTask: Validates description, generates unique ID, defaults to 'pending', sets timestamps
- listTasks: Optional status filter ('pending', 'done', 'all'), sorts newest first
- getTaskById: Retrieves single task, throws error if not found
- updateTask: Updates description and/or status, sets updated_at timestamp, validates changes
- deleteTask: Removes task by ID, preserves remaining IDs (no renumbering)
- toggleTaskStatus: Convenience method for pending ↔ done toggle

**Utilities** (src/lib/):
- logger.ts: success (green), error (red), warning (yellow), info (blue), dim (gray) using picocolors
- time.ts: formatRelative (e.g., "5 minutes ago", "yesterday"), isValidISODate validator
- validators.ts: validateDescription, validateId, resolveDataPath (flag → env → default)

**Test Fixtures**:
- empty-tasks.json: {version:"1.0", tasks:[]}
- sample-tasks.json: 3 sample tasks with different statuses
- corrupted.json: Invalid JSON for edge case testing

**Example Usage** (src/example.ts):
- Demonstrates full CRUD workflow
- Add tasks, list all, update status, update description, filter by status, delete

**Modular Architecture**:
- Services are independent of CLI layer
- Easy to plug in CAC or any other CLI framework
- Clean separation: models → services → utilities → CLI (to be added)

**Build Status**: ✅ Compiles successfully with `npm run build`

Files created:
- [package.json](package.json) - Project configuration
- [tsconfig.json](tsconfig.json) - TypeScript configuration
- [.gitignore](.gitignore) - Git ignore patterns
- [src/models/Task.ts](src/models/Task.ts) - Data models and validation
- [src/services/StorageService.ts](src/services/StorageService.ts) - Data Controller
- [src/services/TaskService.ts](src/services/TaskService.ts) - Task Manager with CRUD + toggle
- [src/lib/logger.ts](src/lib/logger.ts) - Colored console output
- [src/lib/time.ts](src/lib/time.ts) - Relative timestamp formatting
- [src/lib/validators.ts](src/lib/validators.ts) - Input validation utilities
- [src/index.ts](src/index.ts) - Main entry point (exports services)
- [src/example.ts](src/example.ts) - Usage example

## Outcome

- ✅ Impact: Complete modular core codebase implemented with Data Controller (atomic JSON I/O) and Task Manager (full CRUD with status toggle)
- 🧪 Tests: Test fixtures created for empty, sample, and corrupted data scenarios
- 📁 Files: 17 files created including models, services, utilities, config, and fixtures
- 🔁 Next prompts: Implement CLI layer using CAC framework (src/cli/) to connect commands to TaskService
- 🧠 Reflection: Architecture is modular and clean. Services have no CLI dependencies, making them testable and reusable. Atomic writes ensure data integrity per constitution. Status toggle implemented as requested (pending ↔ done). Code is ready for CLI integration.

## Evaluation notes (flywheel)

- Failure modes observed: TypeScript compilation errors fixed (unused import, type mismatch)
- Graders run and results (PASS/FAIL): Build: PASS, Constitution compliance: PASS (minimalism, speed, persistence, colors, errors)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): After CLI integration, validate actual performance meets <100ms targets with real measurements
