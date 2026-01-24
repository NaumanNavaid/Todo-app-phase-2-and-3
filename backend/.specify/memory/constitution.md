<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0 (MAJOR - Initial constitution ratification)
- Added principles:
  * I. Minimalism First
  * II. Speed & Performance
  * III. Local Data Persistence
  * IV. Color-Coded User Interface
  * V. Error Handling & User Feedback
- Added sections:
  * Development Standards
  * Testing Discipline
- Templates requiring updates:
  * ✅ plan-template.md - reviewed, Constitution Check section validated
  * ✅ spec-template.md - reviewed, requirements structure validated
  * ✅ tasks-template.md - reviewed, task organization validated
- Follow-up TODOs: None
-->

# Terminal To-Do App Constitution

## Core Principles

### I. Minimalism First

The app MUST prioritize simplicity in design, implementation, and user experience. Every feature MUST be justified by direct user value. Code SHOULD be concise but readable. Dependencies MUST be minimal - only libraries that directly enable core functionality (CLI framework, JSON handling, terminal styling).

**Rationale**: A hackathon project with tight time constraints requires focus on essentials. Bloat kills momentum.

### II. Speed & Performance

CLI commands MUST complete in under 100ms for data operations. Startup time MUST be under 50ms. No blocking I/O operations on the main thread. Async operations SHOULD be used for file reads/writes.

**Rationale**: Terminal users expect instant feedback. Perceived slowness destroys the CLI experience.

### III. Local Data Persistence (NON-NEGOTIABLE)

All task data MUST be stored locally in a JSON file. The data file location MUST be configurable via environment variable or flag, defaulting to `~/.todo-app/tasks.json`. File operations MUST be atomic (write to temp, then rename) to prevent data corruption on crash/interrupt. Schema changes MUST be backward compatible.

**Rationale**: Local-first aligns with hackathon constraints (no backend complexity) and user privacy. JSON is human-readable and version-controllable.

### IV. Color-Coded User Interface

All terminal output MUST use color coding via Chalk for clear visual hierarchy:
- Success messages: Green
- Errors/failures: Red
- Warnings: Yellow
- Info/neutral: Blue or gray
- Task status indicators: Consistent colors (e.g., green for done, yellow for pending)

**Rationale**: Color enhances scanability and reduces cognitive load for CLI users.

### V. Error Handling & User Feedback

All errors MUST be surfaced to users with clear, actionable messages. Technical errors SHOULD be translated to user-friendly language. Exit codes MUST follow POSIX conventions (0 for success, non-zero for errors). Validation errors MUST indicate the specific field and expected format. File system errors MUST include the path and suggested fix.

**Rationale**: Hackathon demos fail with cryptic errors. Clear feedback builds trust and reduces debugging time.

## Development Standards

### Code Quality

- TypeScript strict mode enabled
- Maximum cyclomatic complexity: 10 per function
- Maximum function length: 50 lines
- ESLint configured with Airbnb base + TypeScript rules
- Prettier for consistent formatting

### Project Structure

```
src/
├── models/          # Data structures (Task, TaskList)
├── services/        # Business logic (TaskService, StorageService)
├── cli/             # Command-line interface (commands, prompts)
├── lib/             # Utilities (logger, validators)
└── index.ts         # Main entry point

tests/
├── unit/            # Unit tests for individual functions
├── integration/     # End-to-end CLI workflow tests
└── fixtures/        # Sample data for tests

data/                # Default location for task.json (created at runtime)
```

### Dependency Management

- Use npm for package management
- All dependencies MUST be production-critical
- Dev dependencies limited to: TypeScript, ESLint, Prettier, Jest/Vitest
- Prefer built-in Node.js modules over external packages

## Testing Discipline

### Test-First (NON-NEGOTIABLE)

Red-Green-Refactor cycle MUST be followed:
1. **RED**: Write failing test for the behavior
2. **GREEN**: Write minimal code to make test pass
3. **REFACTOR**: Improve code while keeping tests green

Tests are OPTIONAL per feature specification. If tests are included:
- Unit tests for all service layer functions
- Integration tests for CLI workflows
- Fixtures must cover edge cases (empty file, malformed JSON, concurrent access)

### Coverage Goals

- Minimum 80% code coverage for critical paths (storage, CRUD operations)
- 100% coverage for data persistence layer (file I/O)
- Error paths MUST have tests

## Governance

### Amendment Process

1. Propose change with justification (rationale required)
2. Document impact on existing code/features
3. Update version following semantic versioning:
   - MAJOR: Removed or redefined core principle
   - MINOR: Added new principle or expanded guidance
   - PATCH: Clarification or wording improvement
4. All templates MUST be updated to reflect changes
5. Create PHR documenting the amendment

### Compliance

- All code reviews MUST verify constitution compliance
- Violations MUST be documented with justification in Complexity Tracking (plan.md)
- When in doubt, favor the simpler solution

### Runtime Guidance

For day-to-day development decisions not covered here, use the following heuristics:
- **YAGNI**: You Aren't Gonna Need It - build only what's needed now
- **KISS**: Keep It Simple, Stupid - prefer straightforward solutions
- **DRY**: Don't Repeat Yourself - but don't abstract prematurely
- **Worse Is Better**: A working simple solution beats a perfect complex one

**Version**: 1.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06
