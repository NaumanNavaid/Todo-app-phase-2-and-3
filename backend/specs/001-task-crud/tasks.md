# Tasks: Task CRUD Operations

**Input**: Design documents from `/specs/001-task-crud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature. Include only if explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below follow plan.md structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create package.json with TypeScript 5.x, Node.js 20.x engine
- [ ] T002 Create tsconfig.json with strict mode enabled per constitution
- [ ] T003 [P] Configure ESLint with Airbnb base + TypeScript rules in .eslintrc.js
- [ ] T004 [P] Configure Prettier for consistent formatting in .prettierrc
- [ ] T005 [P] Create .gitignore for node_modules/, dist/, *.log
- [ ] T006 Install production dependencies: cac@^6.7.14, picocolors@^1.0.0, tinydate@^1.3.0
- [ ] T007 [P] Install dev dependencies: @types/node, typescript, vitest, eslint, prettier
- [ ] T008 Create src/ directory structure: models/, services/, cli/, lib/
- [ ] T009 [P] Create tests/ directory structure: unit/, integration/, fixtures/
- [ ] T010 Add build script to package.json: "build": "tsc"
- [ ] T011 [P] Add dev script to package.json: "dev": "tsc --watch"
- [ ] T012 [P] Add start script to package.json: "start": "node dist/index.js"
- [ ] T013 Verify project builds successfully: npm run build completes without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T014 Create Task interfaces in src/models/Task.ts (Task, TaskStatus, TaskList, TaskInput, TaskUpdate)
- [ ] T015 [P] Implement ValidationError class in src/models/Task.ts with field and message properties
- [ ] T016 [P] Implement validateTaskInput function in src/models/Task.ts (check empty, check max length 1000)
- [ ] T017 [P] Implement validateTaskStatus function in src/models/Task.ts (check 'pending' | 'done')
- [ ] T018 [P] Implement generateNextId function in src/models/Task.ts (max + 1 or 1 if empty)
- [ ] T019 [P] Implement validateUniqueIds function in src/models/Task.ts (check for duplicates)
- [ ] T020 [P] Implement sortTasksByCreated function in src/models/Task.ts (descending by created_at)
- [ ] T021 [P] Create src/models/index.ts to export all Task types and functions
- [ ] T022 Implement StorageService class in src/services/StorageService.ts with constructor accepting dataPath
- [ ] T023 Implement StorageService.load method in src/services/StorageService.ts (read JSON, return empty TaskList if ENOENT)
- [ ] T024 [P] Implement StorageService.save method in src/services/StorageService.ts with atomic write (temp file + rename)
- [ ] T025 [P] Implement StorageService.createBackup private method in src/services/StorageService.ts
- [ ] T026 [P] Add error handling in StorageService.load for corrupted JSON (try restore from backup)
- [ ] T027 [P] Add directory creation in StorageService constructor (recursive mkdir if doesn't exist)
- [ ] T028 Implement logger.success function in src/lib/logger.ts using picocolors green
- [ ] T029 [P] Implement logger.error function in src/lib/logger.ts using picocolors red
- [ ] T030 [P] Implement logger.warning function in src/lib/logger.ts using picocolors yellow
- [ ] T031 [P] Implement logger.info function in src/lib/logger.ts using picocolors blue
- [ ] T032 [P] Implement logger.dim function in src/lib/logger.ts using picocolors gray
- [ ] T033 Implement formatRelative function in src/lib/time.ts for "5 minutes ago", "yesterday" format
- [ ] T034 [P] Implement isValidISODate function in src/lib/time.ts to validate ISO 8601 format
- [ ] T035 Create test fixtures in tests/fixtures/empty-tasks.json with {version:"1.0",tasks:[]}
- [ ] T036 [P] Create test fixtures in tests/fixtures/sample-tasks.json with 5 sample tasks
- [ ] T037 [P] Create test fixtures in tests/fixtures/corrupted.json with invalid JSON for edge case testing
- [ ] T038 Create src/lib/validators.ts with validateDescription function (trim, check empty, check max 1000)
- [ ] T039 [P] Add validateId function in src/lib/validators.ts (check positive integer)
- [ ] T040 Verify all foundational modules compile: npm run build succeeds

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to quickly capture tasks via CLI with unique IDs and validation

**Independent Test**: Run `todo add "Buy groceries"` and verify task appears in JSON file with unique ID, pending status, and timestamp

### Implementation for User Story 1

- [ ] T041 [US1] Implement TaskService.addTask method in src/services/TaskService.ts (accept TaskInput, return Task)
- [ ] T042 [US1] Add validation in TaskService.addTask (call validateTaskInput, throw ValidationError if invalid)
- [ ] T043 [US1] Generate unique ID in TaskService.addTask using generateNextId from models
- [ ] T044 [US1] Set created_at timestamp in TaskService.addTask to current ISO 8601 date
- [ ] T045 [US1] Set status to "pending" in TaskService.addTask as default
- [ ] T046 [US1] Set updated_at to null in TaskService.addTask (never updated)
- [ ] T047 [US1] Add task to TaskList in TaskService.addTask and save via StorageService
- [ ] T048 [US1] Implement TaskService.getTaskById method in src/services/TaskService.ts for retrieving single task
- [ ] T049 [P] [US1] Implement TaskService constructor in src/services/TaskService.ts accepting StorageService
- [ ] T050 [P] [US1] Create src/cli/index.ts to setup CAC CLI framework with base 'todo' command
- [ ] T051 [P] [US1] Add 'add' command to CAC in src/cli/index.ts with <description> argument
- [ ] T052 [P] [US1] Add 'a' as alias for 'add' command in src/cli/index.ts
- [ ] T053 [US1] Create src/cli/commands/add.ts with handleAdd function (description, dataPath params)
- [ ] T054 [US1] Instantiate StorageService in handleAdd with resolved data path
- [ ] T055 [US1] Instantiate TaskService in handleAdd with StorageService instance
- [ ] T056 [US1] Call TaskService.addTask in handleAdd with description wrapped in TaskInput
- [ ] T057 [US1] Display success message in handleAdd using logger.success with task ID
- [ ] T058 [US1] Handle ValidationError in handleAdd (display logger.error with field/message)
- [ ] T059 [US1] Handle file system errors in handleAdd (display logger.error with path, exit code 2)
- [ ] T060 [US1] Return exit code 0 on success, 1 on validation error, 2 on file system error from handleAdd
- [ ] T061 [US1] Wire up add command in src/cli/index.ts to call handleAdd
- [ ] T062 [US1] Add --help flag to add command in src/cli/index.ts
- [ ] T063 [P] [US1] Create src/cli/formatting.ts with formatTaskOutput function (ID, status icon, description, relative time)
- [ ] T064 [US1] Test edge case: Add task with empty description displays error "Description cannot be empty"
- [ ] T065 [US1] Test edge case: Add task with 1000+ character description succeeds (max length accepted)
- [ ] T066 [US1] Test edge case: Add duplicate task descriptions creates separate tasks with different IDs
- [ ] T067 [US1] Test edge case: Add task with special characters (emojis, unicode) persists correctly
- [ ] T068 [US1] Test edge case: Add task when storage directory doesn't exist creates directory automatically
- [ ] T069 [US1] Test edge case: Add task with whitespace-only description is trimmed and rejected if empty
- [ ] T070 [US1] Create main entry point in src/index.ts that calls CLI from src/cli/index.ts
- [ ] T071 [P] Add bin field to package.json pointing to dist/index.js for 'todo' command

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Running `todo add "task name"` should create a task in the JSON file.

---

## Phase 4: User Story 2 - View Task List (Priority: P1) 🎯 MVP

**Goal**: Display all tasks in a clean, color-coded list format with relative timestamps

**Independent Test**: Add multiple tasks in different states, run `todo list` and verify correct layout, color coding (yellow for pending, green for done), and relative timestamps

### Implementation for User Story 2

- [ ] T072 [US2] Implement TaskService.listTasks method in src/services/TaskService.ts (accept optional TaskStatus filter)
- [ ] T073 [US2] Add status filtering in TaskService.listTasks (if filter provided, match status, else return all)
- [ ] T074 [US2] Sort tasks in TaskService.listTasks by created_at descending (newest first) using sortTasksByCreated
- [ ] T075 [US2] Handle empty TaskList in TaskService.listTasks (return empty array, no error)
- [ ] T076 [P] [US2] Add 'list' command to CAC in src/cli/index.ts with no arguments
- [ ] T077 [P] [US2] Add 'ls' as alias for 'list' command in src/cli/index.ts
- [ ] T078 [US2] Add --status option to list command in src/cli/index.ts (accept 'pending', 'done', 'all')
- [ ] T079 [US2] Create src/cli/commands/list.ts with handleList function (options, dataPath params)
- [ ] T080 [US2] Instantiate StorageService and TaskService in handleList
- [ ] T081 [US2] Call TaskService.listTasks in handleList with status filter from options
- [ ] T082 [US2] Check if task list is empty in handleList, display logger.info "No tasks found" if true
- [ ] T083 [US2] Display task count header in handleList: "Task List (X tasks)"
- [ ] T084 [US2] Display table header row in handleList: "ID  Status  Description  Created"
- [ ] T085 [US2] Display separator line in handleList using dashes
- [ ] T086 [US2] Loop through tasks in handleList and format each using formatTaskOutput from formatting.ts
- [ ] T087 [US2] Map status to icon in formatTaskOutput: 'pending' → '◐' (yellow), 'done' → '✓' (green)
- [ ] T088 [US2] Apply color coding to task rows in formatTaskOutput (picocolors.yellow for pending, picocolors.green for done)
- [ ] T089 [US2] Format timestamps in formatTaskOutput using formatRelative from lib/time.ts
- [ ] T090 [US2] Handle corrupted JSON file in handleList (try backup, display logger.warning)
- [ ] T091 [US2] Handle file not found (first run) in handleList (display empty TaskList message)
- [ ] T092 [US2] Return exit code 0 on success, 1 on file not found, 2 on corruption from handleList
- [ ] T093 [US2] Wire up list command in src/cli/index.ts to call handleList
- [ ] T094 [US2] Test edge case: List with no tasks displays "No tasks found. Add a task to get started!"
- [ ] T095 [US2] Test edge case: List with 20+ tasks displays all tasks without truncation
- [ ] T096 [US2] Test edge case: List --status pending shows only pending tasks
- [ ] T097 [US2] Test edge case: List --status done shows only completed tasks
- [ ] T098 [US2] Test edge case: List with tasks created today shows "X minutes ago" for recent tasks
- [ ] T099 [US2] Test edge case: List with tasks created yesterday shows "yesterday" for those tasks
- [ ] T100 [US2] Test edge case: List verifies most recent tasks appear at top (descending order)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can add tasks and view them in a formatted list.

---

## Phase 5: User Story 3 - Update Task Details (Priority: P2)

**Goal**: Allow users to modify task descriptions and toggle status between pending and done

**Independent Test**: Create a task, run `todo update 1 --description "new text"` and `todo update 1 --status done`, verify changes persist in storage

### Implementation for User Story 3

- [ ] T101 [US3] Implement TaskService.updateTask method in src/services/TaskService.ts (id, TaskUpdate params)
- [ ] T102 [US3] Add task lookup by ID in TaskService.updateTask using getTaskById
- [ ] T103 [US3] Handle task not found in TaskService.updateTask (throw error with "Task with ID {id} not found")
- [ ] T104 [US3] Validate TaskUpdate has changes in TaskService.updateTask (check if description or status provided)
- [ ] T105 [US3] Update description if provided in TaskService.updateTask (replace existing, trim whitespace)
- [ ] T106 [US3] Update status if provided in TaskService.updateTask (validate status with validateTaskStatus)
- [ ] T107 [US3] Set updated_at timestamp in TaskService.updateTask to current ISO 8601 date when any change made
- [ ] T108 [US3] Validate description max length (1000) in TaskService.updateTask when updating description
- [ ] T109 [US3] Save updated TaskList in TaskService.updateTask via StorageService
- [ ] T110 [US3] Return updated task from TaskService.updateTask
- [ ] T111 [P] [US3] Add 'update' command to CAC in src/cli/index.ts with <id> argument
- [ ] T112 [P] [US3] Add 'u' as alias for 'update' command in src/cli/index.ts
- [ ] T113 [US3] Add --description option to update command in src/cli/index.ts (accept string)
- [ ] T114 [US3] Add --status option to update command in src/cli/index.ts (accept 'pending' or 'done')
- [ ] T115 [US3] Create src/cli/commands/update.ts with handleUpdate function (id, options, dataPath params)
- [ ] T116 [US3] Parse id as integer in handleUpdate (validate it's a positive number)
- [ ] T117 [US3] Check if no options provided in handleUpdate, display logger.info "No changes specified" if true
- [ ] T118 [US3] Call TaskService.updateTask in handleUpdate with id and TaskUpdate object
- [ ] T119 [US3] Display success message in handleUpdate using logger.success with task ID
- [ ] T120 [US3] Handle "task not found" error in handleUpdate (display logger.error, exit code 1)
- [ ] T121 [US3] Handle ValidationError in handleUpdate (display logger.error with field/message, exit code 2)
- [ ] T122 [US3] Handle file system errors in handleUpdate (display logger.error, exit code 3)
- [ ] T123 [US3] Return exit code 0 on success from handleUpdate
- [ ] T124 [US3] Wire up update command in src/cli/index.ts to call handleUpdate
- [ ] T125 [US3] Add --help flag to update command in src/cli/index.ts
- [ ] T126 [US3] Test edge case: Update with non-existent ID displays "Task with ID 99 not found"
- [ ] T127 [US3] Test edge case: Update without any options displays "No changes specified" help message
- [ ] T128 [US3] Test edge case: Update status from pending to done succeeds
- [ ] T129 [US3] Test edge case: Update status from done to pending succeeds (reopening task)
- [ ] T130 [US3] Test edge case: Update description with empty string after trimming is rejected
- [ ] T131 [US3] Test edge case: Update description longer than 1000 characters is rejected
- [ ] T132 [US3] Test edge case: Update both description and status in single command works
- [ ] T133 [US3] Test edge case: Update task verifies updated_at timestamp is set

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can add, view, and update tasks.

---

## Phase 6: User Story 4 - Delete Tasks (Priority: P2)

**Goal**: Enable users to remove tasks with confirmation prompt to prevent accidental deletion

**Independent Test**: Create a task, run `todo delete 1`, type 'y' to confirm, verify task is removed from storage

### Implementation for User Story 4

- [ ] T134 [US4] Implement TaskService.deleteTask method in src/services/TaskService.ts (id param)
- [ ] T135 [US4] Add task lookup by ID in TaskService.deleteTask using getTaskById
- [ ] T136 [US4] Handle task not found in TaskService.deleteTask (throw error with "Task with ID {id} not found")
- [ ] T137 [US4] Filter task out of TaskList.tasks array in TaskService.deleteTask (keep all tasks except matching ID)
- [ ] T138 [US4] Save updated TaskList in TaskService.deleteTask via StorageService
- [ ] T139 [P] [US4] Add 'delete' command to CAC in src/cli/index.ts with <id> argument
- [ ] T140 [P] [US4] Add 'rm' as alias for 'delete' command in src/cli/index.ts
- [ ] T141 [US4] Create src/cli/commands/delete.ts with handleDelete function (id, dataPath params)
- [ ] T142 [US4] Parse id as integer in handleDelete (validate it's a positive number)
- [ ] T143 [US4] Call TaskService.getTaskById in handleDelete to retrieve task before deletion
- [ ] T144 [US4] Display task details in handleDelete: ID, description, status
- [ ] T145 [US4] Implement confirmPrompt function in src/cli/commands/delete.ts using native readline
- [ ] T146 [US4] Display confirmation prompt in handleDelete: "Are you sure you want to delete this task? (y/n): "
- [ ] T147 [US4] Read user input from stdin in handleDelete using confirmPrompt
- [ ] T148 [US4] Check if user entered 'y' (case-insensitive) in handleDelete
- [ ] T149 [US4] If confirmed, call TaskService.deleteTask in handleDelete
- [ ] T150 [US4] Display success message in handleDelete using logger.success with task ID
- [ ] T151 [US4] If not confirmed, display logger.info "Task not deleted" and exit code 2
- [ ] T152 [US4] Handle "task not found" error in handleDelete (display logger.error, exit code 1, no prompt)
- [ ] T153 [US4] Handle file system errors in handleDelete (display logger.error, exit code 3)
- [ ] T154 [US4] Return exit code 0 on success from handleDelete
- [ ] T155 [US4] Wire up delete command in src/cli/index.ts to call handleDelete
- [ ] T156 [US4] Add --help flag to delete command in src/cli/index.ts
- [ ] T157 [US4] Test edge case: Delete with non-existent ID displays error without prompting
- [ ] T158 [US4] Test edge case: Delete with confirmation entering 'y' permanently removes task
- [ ] T159 [US4] Test edge case: Delete with confirmation entering 'n' or any other input cancels deletion
- [ ] T160 [US4] Test edge case: Delete verifies remaining tasks keep original IDs (no renumbering)
- [ ] T161 [US4] Test edge case: Delete confirmation prompt shows correct task details (ID, description, status)

**Checkpoint**: All user stories should now be independently functional. Users can add, view, update, and delete tasks.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final delivery preparation

- [ ] T162 [P] Add --data global flag to CAC in src/cli/index.ts for custom data file path
- [ ] T163 [P] Add --version global flag to CAC in src/cli/index.ts displaying version number
- [ ] T164 [P] Add --help global flag to CAC in src/cli/index.ts showing all commands
- [ ] T165 [P] Implement resolveDataPath function in src/lib/validators.ts (check --data flag, TODO_DATA_PATH env, default)
- [ ] T166 [P] Update all command handlers to use resolveDataPath for consistent path resolution
- [ ] T167 [P] Add visual hierarchy to list output: blank line before table, separator line
- [ ] T168 [P] Improve error messages in all commands to include actionable suggestions
- [ ] T169 [P] Add SIGINT (Ctrl+C) handler in src/index.ts for graceful shutdown during file operations
- [ ] T170 [P] Test concurrent access: Run two instances simultaneously, verify last write wins
- [ ] T171 [P] Test keyboard interrupt during write: Press Ctrl+C while adding task, verify atomic rename prevents corruption
- [ ] T172 [P] Test out of disk space: Mock ENOSPC error, verify user-friendly error displayed
- [ ] T173 [P] Test special characters: Add task with quotes, newlines, emojis, verify persisted correctly
- [ ] T174 [P] Performance test: Add 10,000 tasks, verify list command completes in <100ms
- [ ] T175 [P] Validate all error messages follow constitution format: {icon} {category}: {message}
- [ ] T176 [P] Verify all exit codes follow POSIX conventions (0 success, non-zero error)
- [ ] T177 [P] Run npm run build and verify compilation succeeds without warnings
- [ ] T178 [P] Create README.md with quick start guide and command examples
- [ ] T179 [P] Test fresh install: Delete node_modules/ and dist/, run npm install && npm run build
- [ ] T180 [P] Validate quickstart.md instructions are accurate by following them step-by-step
- [ ] T181 [P] Final performance validation: Time all operations, verify <100ms targets met
- [ ] T182 [P] Cross-platform test: Verify application works on Windows, macOS, Linux (or document limitations)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Requires tasks created by US1 for testing, but logic is independent
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Requires tasks created by US1 for testing, but logic is independent

### Within Each User Story

- Models before services
- Services before commands
- Core implementation before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All utility functions marked [P] within a story can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all model creation tasks together:
Task: T015 Implement ValidationError class
Task: T016 Implement validateTaskInput function
Task: T017 Implement validateTaskStatus function
Task: T018 Implement generateNextId function
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Add Tasks)
4. Complete Phase 4: User Story 2 (View Tasks)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP part 1!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP part 2!)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Add) - Phase 3
   - Developer B: User Story 2 (View) - Phase 4
   - Developer C: User Story 3 (Update) - Phase 5
   - Developer D: User Story 4 (Delete) - Phase 6
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Edge case tasks are included within each user story phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tasks are designed to take 10-15 minutes each
- Total tasks: 182
- Breakdown by phase:
  - Phase 1 (Setup): 13 tasks
  - Phase 2 (Foundational): 27 tasks
  - Phase 3 (User Story 1 - Add): 31 tasks
  - Phase 4 (User Story 2 - View): 29 tasks
  - Phase 5 (User Story 3 - Update): 33 tasks
  - Phase 6 (User Story 4 - Delete): 28 tasks
  - Phase 7 (Polish): 21 tasks
