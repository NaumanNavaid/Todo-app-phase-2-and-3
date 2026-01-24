# CLI Command Contracts

**Feature**: 001-task-crud
**Date**: 2026-01-06

## Overview

This document defines the exact command-line interface contracts for the Terminal To-Do App. All commands must conform to these specifications.

## Command Structure

### Base Command

```bash
todo <command> [arguments] [options]
```

### Global Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--help` | `-h` | flag | false | Show help message |
| `--version` | `-v` | flag | false | Show version number |
| `--data <path>` | `-d` | string | `~/.todo-app/tasks.json` | Path to data file |

## Command Specifications

### 1. Add Task

**Command**: `add` or `a`

**Synopsis**:
```bash
todo add <description>
todo a <description>
```

**Arguments**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `description` | string | Yes | Task description (1-1000 characters) |

**Options**: None

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Task added successfully |
| 1 | Invalid input (empty description) |
| 2 | File system error (permissions, disk space) |

**Examples**:
```bash
# Add a simple task
todo add "Buy groceries"

# Add a task with special characters
todo add "Review PR #123: Fix login bug"

# Add a long task (up to 1000 chars)
todo add "Write comprehensive documentation for the API including authentication, endpoints, error codes, and examples"
```

**Output**:
```
✓ Task added successfully (ID: 42)
```

**Error Output**:
```
✗ Error: Description cannot be empty
```

---

### 2. View Task List

**Command**: `list` or `ls`

**Synopsis**:
```bash
todo list
todo ls
```

**Arguments**: None

**Options**:
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `--status <s>` | string | all | Filter by status (pending/done/all) |

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Tasks displayed successfully |
| 1 | File not found (first run) |
| 2 | Corrupted data file |

**Examples**:
```bash
# View all tasks
todo list

# View only pending tasks
todo list --status pending

# View only completed tasks
todo list --status done
```

**Output** (with tasks):
```
Task List (10 tasks)

ID  Status  Description              Created
─────────────────────────────────────────────
42  ◐       Buy groceries             5 minutes ago
41  ✓       Review PR #123            2 hours ago
40  ◐       Write documentation       yesterday
```

**Output** (no tasks):
```
ℹ No tasks found. Add a task to get started!
```

**Legend**:
- `◐` (yellow circle) = pending
- `✓` (green checkmark) = done

---

### 3. Update Task

**Command**: `update` or `u`

**Synopsis**:
```bash
todo update <id> [options]
todo u <id> [options]
```

**Arguments**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | number | Yes | Task ID to update |

**Options**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `--description <text>` | string | No | New task description |
| `--status <s>` | string | No | New status (pending/done) |

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Task updated successfully |
| 1 | Task ID not found |
| 2 | Invalid input |
| 3 | File system error |

**Examples**:
```bash
# Update task description
todo update 42 --description "Buy groceries and milk"

# Mark task as done
todo update 42 --status done

# Reopen a completed task
todo update 42 --status pending

# Update both description and status
todo update 42 --description "New text" --status done
```

**Output**:
```
✓ Task updated successfully (ID: 42)
```

**No Changes Output**:
```
ℹ No changes specified. Use --description or --status
```

**Error Output**:
```
✗ Error: Task with ID 999 not found
```

---

### 4. Delete Task

**Command**: `delete` or `rm`

**Synopsis**:
```bash
todo delete <id>
todo rm <id>
```

**Arguments**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | number | Yes | Task ID to delete |

**Options**: None

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | Task deleted successfully |
| 1 | Task ID not found |
| 2 | User cancelled deletion |
| 3 | File system error |

**Interactive Prompt**:
```
Are you sure you want to delete this task? (y/n): _
```

**Examples**:
```bash
# Delete task with confirmation
todo delete 42

# Shortcut alias
todo rm 42
```

**Confirmation Prompt Details**:
```
Task to delete:
  ID: 42
  Description: Buy groceries
  Status: pending

Are you sure you want to delete this task? (y/n): y
✓ Task deleted successfully (ID: 42)
```

**Cancellation**:
```
Are you sure you want to delete this task? (y/n): n
ℹ Task not deleted
```

**Error Output**:
```
✗ Error: Task with ID 999 not found
```

---

## Color Scheme

Per Constitution Principle IV:

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Success | Green | `#32CD32` | ✓ Task added/updated/deleted |
| Error | Red | `#FF4444` | ✗ Validation/runtime errors |
| Warning | Yellow | `#FFD700` | ⚠ Corrupted file, using backup |
| Info | Blue | `#4A90E2` | ℹ Informational messages |
| Dim | Gray | `#999999` | Secondary text, timestamps |
| Pending | Yellow | `#FFD700` | ◐ Pending task indicator |
| Done | Green | `#32CD32` | ✓ Completed task indicator |

## Performance Requirements

Per Constitution Principle II:

| Operation | Target | Measurement |
|-----------|--------|-------------|
| CLI startup | <50ms | Time to `process.argv` parse |
| Add task | <100ms | Command to confirmation message |
| List tasks | <100ms | Command to full display |
| Update task | <100ms | Command to confirmation |
| Delete task | <100ms | Command to confirmation (excluding prompt wait time) |

## Error Message Standards

Per Constitution Principle V:

### Format

```
{icon} {category}: {message}
```

### Categories

| Category | Usage | Icon |
|----------|-------|------|
| Error | Runtime errors, validation failures | ✗ |
| Warning | Non-fatal issues, degraded mode | ⚠ |
| Info | Informational messages | ℹ |

### Message Guidelines

1. **Be specific**: Include the field or operation that failed
2. **Be actionable**: Suggest what the user should do
3. **Be user-friendly**: Avoid technical jargon where possible

**Examples**:

✅ Good:
```
✗ Error: Task with ID 999 not found
✗ Error: Description cannot be empty
✗ Error: Cannot write to file: ~/.todo-app/tasks.json (permission denied)
```

❌ Bad:
```
✗ Error: Invalid input
✗ Error: EPERM: operation not permitted
✗ Validation failed
```

## File System Contracts

### Default Data Location

**Path**: `~/.todo-app/tasks.json`

**Environment Variable**: `TODO_DATA_PATH`

**Resolution Order**:
1. `--data` flag (highest priority)
2. `TODO_DATA_PATH` environment variable
3. Default `~/.todo-app/tasks.json` (lowest priority)

### File Operations

**Write Contract** (atomic):
```typescript
1. Write to {path}.tmp.{pid}
2. fs.rename({path}.tmp.{pid}, {path})
3. If rename fails, cleanup temp file
```

**Read Contract**:
```typescript
1. Try read {path}
2. If ENOENT, return empty TaskList
3. If parse error, try {path}.backup
4. If backup fails, return empty TaskList with warning
```

### Directory Creation

**Contract**: Create `~/.todo-app/` if it doesn't exist

```typescript
fs.mkdir(dataDir, { recursive: true })
```

## TypeScript Function Signatures

### Command Handlers

```typescript
// src/cli/commands/add.ts
export async function handleAdd(
  description: string,
  dataPath: string
): Promise<number>

// src/cli/commands/list.ts
export async function handleList(
  options: { status?: 'pending' | 'done' | 'all' },
  dataPath: string
): Promise<number>

// src/cli/commands/update.ts
export async function handleUpdate(
  id: number,
  options: { description?: string; status?: TaskStatus },
  dataPath: string
): Promise<number>

// src/cli/commands/delete.ts
export async function handleDelete(
  id: number,
  dataPath: string
): Promise<number>
```

## Integration Test Scenarios

### Test Matrix

| Scenario | Command | Expected Exit | Expected Output |
|----------|---------|---------------|-----------------|
| Add valid task | `add "test"` | 0 | "✓ Task added successfully" |
| Add empty task | `add ""` | 1 | "✗ Error: Description cannot be empty" |
| List with tasks | `list` | 0 | Task list displayed |
| List no tasks | `list` | 0 | "ℹ No tasks found" |
| Update existing | `update 1 --status done` | 0 | "✓ Task updated" |
| Update missing ID | `update 999 --status done` | 1 | "✗ Error: Task not found" |
| Delete with confirm | `delete 1` (input: y) | 0 | "✓ Task deleted" |
| Delete cancel | `delete 1` (input: n) | 2 | "ℹ Task not deleted" |
| Delete missing ID | `delete 999` | 1 | "✗ Error: Task not found" |
| Corrupted file | `list` (bad JSON) | 2 | "⚠ Corrupted file, using backup" |
