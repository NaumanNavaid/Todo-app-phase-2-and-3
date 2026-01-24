# TodoApp - Professional Task Manager with AI Assistant

A modern, full-featured task management application built with Next.js 16.1, React 19, TypeScript 5, and Tailwind CSS v4. Features user authentication, real-time CRUD operations, filtering, statistics, and an AI chat assistant interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

---

## Features

- ✅ **User Authentication** - Signup, login, logout with JWT tokens
- ✅ **Task Management** - Create, read, update, delete tasks
- ✅ **Task Filtering** - By status, category, priority, and text search
- ✅ **Statistics Dashboard** - Track completion rates and pending work
- ✅ **Priority Levels** - High, Medium, Low with color coding
- ✅ **Categories** - Work, Personal, Shopping, Health, Finance, Other
- ✅ **Due Dates** - Track deadlines with overdue indicators
- ✅ **AI Chat Interface** - Placeholder for AI assistant integration
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Light Theme** - Clean slate color palette

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- FastAPI backend running on `http://localhost:8000` (optional - app works with mock data)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if your backend is on a different URL
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Application Documentation](docs/APPLICATION_DOCUMENTATION.md) | Complete app documentation with design, features, and architecture |
| [Changelog](docs/CHANGELOG.md) | Version history and change log |
| [Feature Specification](specs/001-todo-app/spec.md) | User stories, requirements, and success criteria |
| [Implementation Plan](specs/001-todo-app/plan.md) | Technical architecture and implementation phases |
| [Technology Research](specs/001-todo-app/research.md) | Technology decisions and rationale |
| [Data Model](specs/001-todo-app/data-model.md) | Entity definitions and relationships |
| [API Contracts](specs/001-todo-app/contracts/) | OpenAPI specifications for all endpoints |
| [Developer Quick Start](specs/001-todo-app/quickstart.md) | Setup guide and troubleshooting |

---

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── layout/            # Layout components
│   ├── auth/              # Authentication
│   ├── todos/             # Task management
│   ├── chat/              # AI chat interface
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
├── docs/                  # Documentation
├── specs/                 # Feature specifications
└── .env.local            # Environment variables
```

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.4 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Styling (no config file) |
| FastAPI | - | Backend API (user-provided) |

---

## API Integration

The frontend integrates with a FastAPI backend for:

- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Tasks**: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}`, `PATCH /api/tasks/{id}/toggle`

### Environment Variables

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### CORS Configuration

Ensure your FastAPI backend allows frontend origin:
```bash
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

---

## Design System

### Color Palette

**Priority Colors**
- High: `#ef4444` (Red)
- Medium: `#f59e0b` (Amber)
- Low: `#22c55e` (Green)

**Category Colors**
- Work: `#3b82f6` (Blue)
- Personal: `#8b5cf6` (Violet)
- Shopping: `#ec4899` (Pink)
- Health: `#10b981` (Emerald)
- Finance: `#f97316` (Orange)
- Other: `#6b7280` (Gray)

**UI Colors**
- Background: `#f8fafc` (Slate-50)
- Foreground: `#0f172a` (Slate-900)
- Primary: `#6366f1` (Indigo-500)

### Responsive Breakpoints

| Screen | Columns |
|--------|---------|
| Mobile (<640px) | 1 |
| Tablet (640-1024px) | 2 |
| Desktop (>1024px) | 3 |

---

## Features in Detail

### Authentication

- User registration with name, email, password
- Login with email/password
- JWT token storage in localStorage
- Session persistence across reloads
- Auto-logout on token expiration

### Task Management

- Create tasks with title, description, priority, category, due date
- Edit all task fields
- Delete tasks (one-click)
- Toggle completion status
- Filter by status (All, Active, Completed)
- Filter by category (6 categories)
- Filter by priority (High, Medium, Low)
- Search across titles and descriptions

### Statistics

- Total tasks
- Completed tasks
- Active tasks
- High priority tasks
- Overdue tasks
- Completion rate percentage

### AI Chat (Placeholder)

- User/assistant message display
- Typing indicator
- Clear chat button
- Ready for backend integration

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Environment Variables

Set in Vercel dashboard:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |

### Component Guidelines

- Use `'use client'` directive for interactive components
- Keep components small and focused
- Use TypeScript for type safety
- Follow existing naming conventions
- Use Tailwind utility classes for styling

---

## Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for version history and changes.

---

## License

This project is licensed under the MIT License.

---

## Support

For issues, questions, or contributions:
- Check the [Documentation](docs/APPLICATION_DOCUMENTATION.md)
- Review the [Quick Start Guide](specs/001-todo-app/quickstart.md)
- See [API Contracts](specs/001-todo-app/contracts/)

---

**Version**: 1.0.0
**Last Updated**: 2026-01-21
