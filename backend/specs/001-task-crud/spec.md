# Feature Specification: Task CRUD Operations

**Feature Branch**: `001-task-crud`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "Let's specify the technical requirements for the Task CRUD Operations. For each operation, define the exact behavior: Add: How do we handle duplicate task names? Should we auto-generate a unique ID? View: What layout should we use? (e.g., a simple list vs. a formatted table). Should it show timestamps? Update: Do we support partial updates (changing only the name) and status toggling (Mark as Done)? Delete: Should we ask for a confirmation prompt before permanent deletion? Also, specify the Schema of the JSON object (e.g., id, description, status, created_at)."

## User Scenarios & Testing

### User Story 1 - Add New Tasks (Priority: P1)

A user needs to quickly capture tasks as they think of them. They type a task description and the system saves it immediately with a unique identifier, ensuring no data is lost even if duplicate names are entered.

**Why this priority**: P1 - This is the core value proposition. Without the ability to add tasks, the application serves no purpose. Users must be able to capture thoughts instantly without friction.

**Independent Test**: Can be tested by running the add command with various task descriptions and verifying tasks appear in the JSON file with unique IDs.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** the user enters `add "Buy groceries"`, **Then** a task is created with description "Buy groceries", a unique ID, status "pending", and a timestamp
2. **Given** a task with description "Buy groceries" exists, **When** the user adds another task with the same description, **Then** both tasks are stored with different unique IDs
3. **Given** the user enters an empty description, **When** they attempt to add a task, **Then** the system displays an error message and does not create a task
4. **Given** the user enters a very long description (500+ characters), **When** they add a task, **Then** the task is stored with the full description

---

### User Story 2 - View Task List (Priority: P1)

A user wants to see all their tasks at a glance in a clean, organized format that makes it easy to understand what needs to be done. The display should use color coding to differentiate completed from pending tasks.

**Why this priority**: P1 - Viewing tasks is essential for the application to provide value. Without the ability to see what's been captured, users cannot manage their workflow.

**Independent Test**: Can be tested by adding multiple tasks in different states and running the view command to verify the correct layout and color coding are displayed.

**Acceptance Scenarios**:

1. **Given** 5 tasks exist (3 pending, 2 completed), **When** the user runs the view command, **Then** all tasks are displayed in a list format with color coding (yellow for pending, green for completed)
2. **Given** no tasks exist, **When** the user runs the view command, **Then** a friendly message indicates "No tasks found. Add a task to get started!"
3. **Given** tasks exist with various creation dates, **When** the user views the list, **Then** each task shows its creation timestamp in a human-readable format (e.g., "2 hours ago", "Yesterday")
4. **Given** 20+ tasks exist, **When** the user views the list, **Then** the most recent tasks appear at the top and all tasks are visible without truncation

---

### User Story 3 - Update Task Details (Priority: P2)

A user needs to modify task information after creation. They might want to correct a typo, add more detail to the description, or mark a task as complete when finished.

**Why this priority**: P2 - Users can work around this by deleting and recreating tasks, but it creates friction. Updating is important for usability but not absolutely critical for an MVP.

**Independent Test**: Can be tested by creating a task, then running update commands to change the description and toggle status, verifying the changes persist in storage.

**Acceptance Scenarios**:

1. **Given** a task with ID 1 has description "Buy milk", **When** the user runs `update 1 --description "Buy almond milk"`, **Then** the task description is updated to "Buy almond milk"
2. **Given** a task with status "pending", **When** the user runs `update 1 --status done`, **Then** the task status changes to "done"
3. **Given** a task with status "done", **When** the user runs `update 1 --status pending`, **Then** the task status changes back to "pending"
4. **Given** a task with ID 1 exists, **When** the user runs `update 99 --description "New text"`, **Then** an error message displays "Task with ID 99 not found"
5. **Given** a task exists, **When** the user runs `update 1` without any arguments, **Then** a help message displays showing available update options

---

### User Story 4 - Delete Tasks (Priority: P2)

A user wants to remove tasks that are no longer relevant or were created by mistake. The system should prevent accidental deletion by requiring confirmation.

**Why this priority**: P2 - Deletion is important for data hygiene, but users can work around it by keeping completed tasks. The confirmation safeguard makes this lower priority than core add/view functionality.

**Independent Test**: Can be tested by creating tasks, then running the delete command with and without confirmation to verify the correct behavior.

**Acceptance Scenarios**:

1. **Given** a task with ID 1 exists, **When** the user runs `delete 1`, **Then** the system prompts "Are you sure you want to delete this task? (y/n)"
2. **Given** the system prompts for confirmation, **When** the user enters "y", **Then** the task is permanently removed from storage
3. **Given** the system prompts for confirmation, **When** the user enters "n" or any other input, **Then** the task is NOT deleted and a message displays "Task not deleted"
4. **Given** the user runs `delete 99`, **When** task ID 99 does not exist, **Then** an error message displays "Task with ID 99 not found" without prompting for confirmation
5. **Given** 5 tasks exist with IDs 1, 2, 3, 4, 5, **When** task 3 is deleted, **Then** the remaining tasks keep their original IDs (1, 2, 4, 5) and are not renumbered

---

### Edge Cases

- What happens when the JSON file is corrupted or contains invalid syntax?
- What happens when multiple users/processes try to modify the JSON file simultaneously?
- What happens when the user interrupts the application (Ctrl+C) during a file write operation?
- What happens when the task description contains special characters (quotes, emojis, unicode)?
- What happens when the storage directory doesn't exist or the user lacks write permissions?
- What happens when the system runs out of disk space while writing a task?
- What happens when a task ID is manually edited in the JSON file to create duplicates?

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow users to add tasks with a text description
- **FR-002**: System MUST auto-generate a unique numeric ID for each task
- **FR-003**: System MUST allow duplicate task descriptions (same text can appear multiple times)
- **FR-004**: System MUST store task creation timestamps in ISO 8601 format
- **FR-005**: System MUST display all tasks in a list format with color coding
- **FR-006**: System MUST show creation timestamps in human-readable relative format (e.g., "5 minutes ago")
- **FR-007**: System MUST support updating task descriptions via task ID
- **FR-008**: System MUST support toggling task status between "pending" and "done"
- **FR-009**: System MUST prompt for confirmation before permanently deleting a task
- **FR-010**: System MUST validate that task IDs exist before update/delete operations
- **FR-011**: System MUST store all tasks in a local JSON file
- **FR-012**: System MUST create the storage directory if it doesn't exist
- **FR-013**: System MUST use atomic file operations (write to temp, then rename) to prevent data corruption
- **FR-014**: System MUST display clear error messages for invalid operations
- **FR-015**: System MUST return appropriate exit codes (0 for success, non-zero for errors)

### Key Entities

- **Task**: A single todo item with the following attributes:
  - `id`: Unique numeric identifier (auto-generated, sequential starting from 1)
  - `description`: Text content of the task (1-1000 characters, required)
  - `status`: Current state, either "pending" or "done" (default: "pending")
  - `created_at`: ISO 8601 timestamp of task creation (required, immutable)
  - `updated_at`: ISO 8601 timestamp of last modification (optional, null if never updated)

- **TaskList**: The collection of all tasks stored in the JSON file
  - `tasks`: Array of Task objects
  - `version`: Schema version identifier for backward compatibility (default: "1.0")

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can add a new task in under 5 seconds from command execution to confirmation
- **SC-002**: Users can view their task list and find a specific task in under 2 seconds
- **SC-003**: 95% of users successfully complete their first task addition without referencing documentation
- **SC-004**: Zero data corruption events occur during normal usage (including keyboard interrupts)
- **SC-005**: Users can perform 100 add/view/update/delete cycles without performance degradation
- **SC-006**: All error messages are understood by users without technical background (validated via user testing)
- **SC-007**: The application handles task lists with up to 10,000 tasks without crashing
- **SC-008**: Users report the color-coded interface makes it easy to distinguish pending from completed tasks

## Assumptions

1. **User Context**: Users are familiar with command-line interfaces and understand basic concepts like arguments and flags
2. **Environment**: The application runs on a single-user machine with standard file system permissions
3. **Concurrency**: Only one instance of the application will be running at a time (no multi-user scenarios)
4. **Data Volume**: Users will have fewer than 10,000 tasks (performance expectations are based on this)
5. **Persistence**: The local JSON file is the single source of truth; no cloud sync or backup is required
6. **Accessibility**: Users have standard terminal capabilities (color support is assumed but not required)
7. **Task Lifecycle**: Tasks are typically created, viewed, optionally updated, and eventually deleted or marked done
8. **ID Behavior**: Task IDs are never reused; once a task is deleted, its ID is gone forever
9. **Timestamp Display**: Relative timestamps ("5 minutes ago") are preferred over absolute timestamps for readability
10. **Input Method**: All interaction happens via command-line arguments; no interactive prompts during normal flow (except delete confirmation)

## Out of Scope

The following features are explicitly excluded from this specification:

- Task categories or tags
- Task priorities (high/medium/low)
- Due dates or reminders
- Task search or filtering
- Task sorting (other than default by creation date)
- Bulk operations (add/delete multiple tasks at once)
- Task notes or extended descriptions
- Subtasks or task dependencies
- Data export/import (other than direct JSON file access)
- Undo/redo functionality
- Task archiving
- Multi-list support (only one master list)
- Cloud synchronization
- Collaborative features (sharing, assigning)
- Recurring tasks
- Task history or audit logs
- Interactive mode or menu system

These features may be considered for future enhancements but are not part of the initial MVP.
