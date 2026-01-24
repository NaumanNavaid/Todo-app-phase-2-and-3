# Research: Task CRUD Operations

**Feature**: 001-task-crud
**Date**: 2026-01-06
**Status**: Complete

## Overview

This document captures research findings for technical decisions required to implement the Terminal To-Do App while adhering to the Constitution's principles of minimalism, speed, and local persistence.

## Decision Summary

| Area | Decision | Rationale |
|------|----------|-----------|
| CLI Framework | **CAC** (Command And Control) | Smallest bundle size, zero dependencies, modern TypeScript support |
| Color Library | **Picocolors** | 14x smaller/2x faster than Chalk, no dependencies, widely adopted |
| File I/O | **Native fs/promises** | Atomic writes with temp+rename, no lockfile needed for single-process |
| Timestamps | **Custom + tinydate** | Minimal dependency (0.1KB), full control over format |
| Prompts | **Native readline** | Built into Node.js, zero dependencies, cross-platform |

## Detailed Research

### 1. CLI Framework

**Options Considered**:
- **CAC** (chosen): Ultra-minimalist, 2.4KB, zero deps
- **Commander.js**: More features but larger bundle
- **Yargs**: Too complex for minimalist needs
- **Oclif**: Over-engineered for single-command tool

**Decision**: CAC

**Rationale**:
- Fastest startup time (<10ms overhead)
- Simple TypeScript-first API
- Minimal learning curve
- Perfect for hackathon timeline

**Sample Usage**:
```typescript
import { cac } from 'cac'
const cli = cac('todo')

cli.command('add <description>')
  .action((description) => addTask(description))

cli.command('list')
  .action(() => listTasks())

cli.command('update <id>')
  .option('--description <text>', 'Update task description')
  .option('--status <pending|done>', 'Update task status')
  .action((id, options) => updateTask(id, options))

cli.command('delete <id>')
  .action((id) => deleteTask(id))

cli.parse()
```

### 2. Color Library

**Options Considered**:
- **Picocolors** (chosen): 0.8KB, 2x faster
- **Chalk**: Larger, slower but more features
- **Cli-color**: Outdated
- **Kleur**: Abandoned project

**Decision**: Picocolors

**Rationale**:
- 14x smaller than Chalk
- 2x faster performance
- Actively maintained
- Used by PostCSS, Browserslist, ESLint

**Color Scheme per Constitution**:
```typescript
import pc from 'picocolors'

// Success messages
pc.green('✓ Task added successfully')

// Errors/failures
pc.red('✗ Task not found')

// Warnings
pc.yellow('⚠ File corrupted, using backup')

// Info/neutral
pc.blue('ℹ 10 tasks found')

// Task status indicators
const statusColors = {
  pending: pc.yellow,
  done: pc.green
}
```

### 3. File I/O Patterns

**Key Requirements**:
- Atomic writes (constitution requirement)
- Corruption prevention
- Cross-platform compatibility
- Error recovery

**Decision**: Native Node.js `fs/promises` with atomic write pattern

**Implementation Strategy**:
```typescript
import { writeFile, rename, readFile } from 'fs/promises'
import { join } from 'path'

class StorageService {
  private dataPath: string

  async save(data: TaskList): Promise<void> {
    const tempPath = `${this.dataPath}.tmp.${process.pid}`
    const json = JSON.stringify(data, null, 2)

    // Write to temp file
    await writeFile(tempPath, json, 'utf8')

    // Atomic rename (POSIX) or overwriting (Windows)
    await rename(tempPath, this.dataPath)
  }

  async load(): Promise<TaskList> {
    try {
      const json = await readFile(this.dataPath, 'utf8')
      return JSON.parse(json)
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty
        return { version: '1.0', tasks: [] }
      }
      throw error
    }
  }
}
```

**Concurrency Approach**:
- Constitution assumes single-process usage
- No file locking needed (adds complexity)
- If concurrent access occurs, last write wins (acceptable for CLI)

**Error Recovery**:
- Backup corrupted JSON with timestamp
- Validate JSON structure after read
- Provide user-friendly error messages per FR-014

### 4. Timestamp Formatting

**Options Considered**:
- **Custom + tinydate** (chosen): Minimal, flexible
- **Day.js**: Too large (67KB)
- **date-fns**: Tree-shakeable but still large
- **Luxon**: Overkill

**Decision**: Custom relative time function + tinydate for absolute dates

**Implementation**:
```typescript
function formatRelative(isoDate: string): string {
  const now = new Date()
  const then = new Date(isoDate)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  // Use tinydate for older dates
  return tinydate('{YYYY}-{MM}-{DD}')(then)
}
```

### 5. Confirmation Prompts

**Options Considered**:
- **Native readline** (chosen): Zero dependencies
- **Inquirer**: Feature-rich but large
- **Prompts**: Great UX but adds dependency

**Decision**: Native `readline` module

**Implementation**:
```typescript
import { createInterface } from 'readline'

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

// Usage
const confirmed = await confirm('Delete this task?')
if (!confirmed) {
  console.log(pc.dim('Task not deleted'))
  process.exit(0)
}
```

## Performance Budget

Per Constitution requirements:

| Metric | Target | Approach |
|--------|--------|----------|
| CLI startup | <50ms | CAC + minimal deps, lazy loading |
| Data operations | <100ms | Native fs, in-memory operations |
| Bundle size | <5MB | Tree-shaking, minimal dependencies |
| Memory usage | <50MB | Stream processing, no caching |

## Dependencies Summary

**Production Dependencies** (~3.3KB total):
- `cac`: CLI framework (2.4KB)
- `picocolors`: Terminal colors (0.8KB)
- `tinydate`: Date formatting (0.1KB)

**Dev Dependencies**:
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions
- `eslint`: Linting
- `prettier`: Formatting

**Total Impact**: <5ms startup overhead, well under 50ms budget

## Alternatives Considered and Rejected

| Alternative | Rejected Because |
|-------------|------------------|
| Commander.js | 10x larger than CAC, slower startup |
| Chalk | 14x larger than Picocolors |
| Day.js | 67KB vs 0.1KB tinydate for simple formatting |
| Inquirer | Unnecessary complexity for simple y/n prompt |
| proper-lockfile | Adds complexity for single-process assumed usage |
| LowDB | Overkill for simple JSON file operations |

## Cross-Platform Considerations

All chosen solutions work identically on:
- **Windows** (PowerShell, CMD)
- **macOS** (zsh, bash)
- **Linux** (various shells)

Key considerations:
- Use `path.join()` for paths (not string concatenation)
- Test line endings in JSON (CRLF vs LF)
- Validate ANSI color support (disable in CI/non-TTY)

## Next Steps

Phase 1 will use these research decisions to design:
1. Data model with TypeScript interfaces
2. Service layer architecture
3. CLI command contracts
4. Quickstart guide for developers
