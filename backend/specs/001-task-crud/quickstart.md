# Quickstart Guide: Terminal To-Do App

**Feature**: 001-task-crud
**Last Updated**: 2026-01-06

## Overview

This guide helps you quickly set up and run the Terminal To-Do App for development and testing.

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **TypeScript**: v5.x (installed via npm)
- **OS**: Windows, macOS, or Linux

## Installation

### 1. Clone and Setup

```bash
# Navigate to project directory
cd to-do-app

# Install dependencies
npm install

# Or if using pnpm
pnpm install

# Or if using yarn
yarn install
```

### 2. Build the Project

```bash
# Compile TypeScript
npm run build

# Or for development with watch mode
npm run dev
```

### 3. Link for Global CLI (Optional)

```bash
# Link globally to use 'todo' command anywhere
npm link

# Verify installation
todo --version
```

## Basic Usage

### Adding Tasks

```bash
# Add a simple task
todo add "Buy groceries"

# Add a task with details
todo add "Review pull request #123: Fix authentication bug"

# Output:
# ✓ Task added successfully (ID: 1)
```

### Viewing Tasks

```bash
# View all tasks
todo list

# View only pending tasks
todo list --status pending

# View only completed tasks
todo list --status done

# Output:
# Task List (2 tasks)
#
# ID  Status  Description              Created
# ─────────────────────────────────────────────
# 2   ◐       Buy groceries             5 minutes ago
# 1   ✓       Review PR #123            2 hours ago
```

### Updating Tasks

```bash
# Update task description
todo update 1 --description "Buy groceries and milk"

# Mark task as done
todo update 1 --status done

# Reopen a completed task
todo update 1 --status pending

# Update both at once
todo update 1 --description "New text" --status done

# Output:
# ✓ Task updated successfully (ID: 1)
```

### Deleting Tasks

```bash
# Delete task with confirmation
todo delete 1

# You'll be prompted:
# Task to delete:
#   ID: 1
#   Description: Buy groceries
#   Status: pending
#
# Are you sure you want to delete this task? (y/n): y
#
# ✓ Task deleted successfully (ID: 1)

# Cancel deletion by typing 'n'
# ℹ Task not deleted
```

## Data Location

### Default Path

Tasks are stored in: `~/.todo-app/tasks.json`

### Custom Path

```bash
# Use custom data file location
todo --data ~/my-tasks.json list

# Set environment variable
export TODO_DATA_PATH=~/my-tasks.json
todo list
```

### View Raw Data

```bash
# See the JSON file directly
cat ~/.todo-app/tasks.json

# Output:
# {
#   "version": "1.0",
#   "tasks": [
#     {
#       "id": 1,
#       "description": "Buy groceries",
#       "status": "pending",
#       "created_at": "2026-01-06T12:00:00Z",
#       "updated_at": null
#     }
#   ]
# }
```

## Development Workflow

### Project Structure

```
to-do-app/
├── src/
│   ├── models/           # Data structures (Task, TaskList)
│   ├── services/         # Business logic (TaskService, StorageService)
│   ├── cli/              # Command handlers
│   ├── lib/              # Utilities (logger, validators)
│   └── index.ts          # Main entry point
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # CLI workflow tests
│   └── fixtures/         # Sample data
├── data/                 # Default task.json location (runtime)
└── specs/                # Feature specifications
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run only unit tests
npm test -- unit

# Run only integration tests
npm test -- integration
```

### Linting and Formatting

```bash
# Check code style
npm run lint

# Auto-fix lint issues
npm run lint -- --fix

# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format -- --check
```

### Building for Production

```bash
# Compile TypeScript to JavaScript
npm run build

# Output in dist/ directory
# dist/index.js is the main entry point

# Run compiled version
node dist/index.js list
```

## Common Scenarios

### First-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Add your first task
npm start add "Welcome to Terminal To-Do!"

# 4. View your tasks
npm start list
```

### Quick Demo

```bash
# Add a few tasks
todo add "Learn TypeScript"
todo add "Build a CLI app"
todo add "Ship to production"

# View all tasks
todo list

# Mark one as done
todo update 1 --status done

# View again (should show completed task in green)
todo list

# Delete a task
todo delete 3
# Type 'y' when prompted
```

### Data Backup and Restore

```bash
# Backup your tasks
cp ~/.todo-app/tasks.json ~/.todo-app/tasks.backup.json

# Restore from backup
cp ~/.todo-app/tasks.backup.json ~/.todo-app/tasks.json

# Or use custom file directly
todo --data ~/.todo-app/tasks.backup.json list
```

## Troubleshooting

### Permission Errors

```bash
# Error: Cannot write to ~/.todo-app/tasks.json

# Solution: Check directory permissions
ls -la ~/.todo-app/

# Fix permissions (Unix/macOS)
chmod 755 ~/.todo-app/

# Fix permissions (Windows)
# Run terminal as Administrator
```

### Corrupted Data File

```bash
# Error: Corrupted JSON file

# The app automatically creates backups:
# ~/.todo-app/tasks.json.backup

# Restore from backup
cp ~/.todo-app/tasks.json.backup ~/.todo-app/tasks.json

# Or start fresh (delete both files)
rm ~/.todo-app/tasks.json ~/.todo-app/tasks.json.backup
```

### Port Already in Use

Not applicable - this is a CLI tool, not a server.

### TypeScript Compilation Errors

```bash
# Clean build artifacts
rm -rf dist/

# Reinstall dependencies
rm -rf node_modules/
npm install

# Rebuild
npm run build
```

## Keyboard Shortcuts

### During CLI Operation

| Key | Action |
|-----|--------|
| `Ctrl+C` | Cancel current operation/interrupt prompt |
| `Ctrl+D` | Exit confirmation prompt (same as 'n') |
| `Ctrl+L` | Clear screen (some terminals) |

## Tips and Tricks

### Batch Operations (Manual)

```bash
# Add multiple tasks using shell loop
for task in "Task 1" "Task 2" "Task 3"; do
  todo add "$task"
done
```

### Alias Commands

```bash
# Add aliases to ~/.bashrc or ~/.zshrc
alias t='todo'
alias ta='todo add'
alias tl='todo list'
alias tu='todo update'
alias td='todo delete'

# Usage:
ta "Buy milk"
tl
tu 1 --status done
```

### Integration with Other Tools

```bash
# Pipe task list to grep
todo list | grep "urgent"

# Count completed tasks
todo list --status done | wc -l

# Export to CSV (manual parsing)
todo list | tail -n +4 > tasks.txt
```

## Performance Expectations

Per the Constitution, you should experience:

- **Startup**: <50ms (instant command response)
- **Add task**: <100ms (under 0.1 seconds)
- **List tasks**: <100ms even with 10,000 tasks
- **Update/Delete**: <100ms (excluding confirmation wait time)

If operations feel sluggish, something is wrong. Check:
1. Available disk space
2. File system performance (networked drives can be slow)
3. Antivirus interference

## Getting Help

### Built-in Help

```bash
# Show general help
todo --help

# Show command-specific help
todo add --help
todo update --help
```

### Version Information

```bash
todo --version

# Output: Terminal To-Do App v1.0.0
```

## Next Steps

1. **Explore the codebase**: Read [src/models/Task.ts](../src/models/Task.ts) to understand data structures
2. **Run tests**: `npm test` to see test coverage
3. **Review specs**: Check [specs/001-task-crud/](.) for detailed requirements
4. **Contribute**: See [CONTRIBUTING.md](../../CONTRIBUTING.md) (if it exists)

## FAQ

**Q: Can I sync tasks across multiple machines?**
A: Not in the current version (see spec "Out of Scope"). You can manually copy the JSON file.

**Q: How do I undo a delete?**
A: Undo is not supported, but backups are created automatically. Check `~/.todo-app/tasks.json.backup`.

**Q: What's the maximum number of tasks?**
A: No hard limit, but performance is tested up to 10,000 tasks per SC-007.

**Q: Can I use emojis in task descriptions?**
A: Yes! UTF-8 encoding is fully supported.

**Q: Does this work on Windows?**
A: Yes, fully cross-platform compatible.
