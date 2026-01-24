# Developer Quick Start Guide: TodoApp

**Feature**: 001-todo-app
**Last Updated**: 2026-01-21
**Purpose**: Get developers up and running quickly

---

## Prerequisites

Before starting, ensure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18.x or higher | `node --version` |
| npm | 9.x or higher | `npm --version` |
| Git | Latest | `git --version` |
| Code Editor | VS Code recommended | - |

**Note**: The backend (FastAPI) should be running on `http://localhost:8000` for full integration. The frontend works standalone with mock data for development.

---

## Installation

### 1. Clone and Navigate

```bash
# Clone your repository
git clone <your-repo-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

Expected output:
```
added 324 packages, and audited 325 packages in 45s
found 0 vulnerabilities
```

### 3. Verify Installation

```bash
npm run dev
```

Expected output:
```
   ▲ Next.js 16.1.4
   - Local:        http://localhost:3000
   - Ready in 2.3s
```

---

## Development Workflow

### Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Development Features

| Feature | Description |
|---------|-------------|
| Hot Reload | Changes appear instantly without refresh |
| Fast Refresh | Component state preserved during edits |
| Error Overlay | In-browser error reporting |
| TypeScript | Type checking in real-time |

---

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main application page
│   └── globals.css          # Global styles & theme
│
├── components/              # React components
│   ├── layout/              # Layout components
│   │   ├── TabNavigation.tsx
│   │   └── AppHeader.tsx
│   ├── auth/                # Authentication
│   │   ├── AuthProvider.tsx
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── AuthPage.tsx
│   ├── todos/               # Todo features
│   │   ├── TodoDashboard.tsx
│   │   ├── TodoList.tsx
│   │   ├── TodoCard.tsx
│   │   ├── TodoForm.tsx
│   │   └── TodoFilters.tsx
│   ├── chat/                # AI chat interface
│   │   └── ChatInterface.tsx
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Card.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.tsx          # Authentication state
│   ├── useTodos.ts          # Todo CRUD
│   ├── useChat.ts           # Chat state
│   └── useTabs.ts           # Tab navigation
│
├── lib/                     # Utilities & types
│   ├── types.ts             # TypeScript interfaces
│   ├── mock-data.ts         # Sample data
│   ├── mock-auth.ts         # Auth simulation
│   ├── utils.ts             # Helper functions
│   └── api-client.ts        # API client (placeholder)
│
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
└── next.config.js           # Next.js config
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type check |

---

## Authentication (Demo Mode)

The app currently uses **mock authentication** for development:

### Demo Credentials

```
Email: demo@example.com
Password: demo123
```

Or create a new account via the Sign Up form (any valid email + 6+ char password works).

### Switch to Real Backend

When your FastAPI backend is ready, update the API base URL:

```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

Then set the environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| Next.js 16.1 | React framework with routing |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS v4 | Styling (no config file needed) |
| React Context | State management |

---

## Common Tasks

### Add a New Todo Component

```bash
# Create new file in components/todos/
touch components/todos/MyNewComponent.tsx
```

```typescript
// components/todos/MyNewComponent.tsx
'use client';

export function MyNewComponent() {
  return <div>Hello from new component</div>;
}
```

### Add a New Custom Hook

```bash
touch hooks/useMyHook.ts
```

```typescript
// hooks/useMyHook.ts
import { useState } from 'react';

export function useMyHook() {
  const [value, setValue] = useState(null);
  return { value, setValue };
}
```

### Update Global Styles

Edit `app/globals.css`:

```css
:root {
  /* Add your custom CSS variables here */
  --my-custom-color: #3b82f6;
}

.my-custom-class {
  color: var(--my-custom-color);
}
```

---

## Backend Integration Guide

### Step 1: Set API URL

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 2: Update useAuth Hook

Replace mock auth with real API calls in `hooks/useAuth.tsx`:

```typescript
// Replace mock login with:
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### Step 3: Update useTodos Hook

Replace mock data with API calls in `hooks/useTodos.ts`:

```typescript
// Replace:
// const [todos, setTodos] = useState(mockTodos);

// With:
const [todos, setTodos] = useState([]);

useEffect(() => {
  const fetchTodos = async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setTodos(data);
  };
  fetchTodos();
}, []);
```

### Step 4: Test Integration

```bash
# Start backend
# (in backend directory)
uvicorn main:app --reload --port 8000

# Start frontend (in another terminal)
npm run dev
```

---

## Troubleshooting

### Build Errors

**Problem**: Type errors after editing

```bash
# Run type check to see specific errors
npm run type-check
```

**Problem**: Import errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Port Already in Use

**Problem**: Port 3000 is busy

```bash
# Use different port
npm run dev -- -p 3001
```

### CORS Issues

**Problem**: Frontend can't reach backend

Update backend CORS settings (`.env` in FastAPI project):

```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Module Not Found

**Problem**: `Module not found: Can't resolve '@/components/...'`

Check `tsconfig.json` has correct path alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Debugging

### Browser DevTools

1. Open Chrome DevTools: `F12` or `Ctrl+Shift+I`
2. Go to **Console** tab for JavaScript errors
3. Go to **Network** tab to see API requests
4. Go to **React** tab (if React DevTools installed) for component tree

### React DevTools Extension

Install for your browser:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- Firefox: [React Developer Tools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Console Logging

```typescript
// Add debug logs
console.log('Current todos:', todos);
console.log('Filter state:', filter);
console.error('API Error:', error);
```

---

## Testing

### Manual Testing Checklist

- [ ] Login with demo credentials
- [ ] Create a new todo
- [ ] Mark todo as complete
- [ ] Edit existing todo
- [ ] Delete todo
- [ ] Search todos
- [ ] Filter by status
- [ ] Switch to AI Chat tab
- [ ] Send chat message
- [ ] Logout

### Responsive Testing

| Viewport | Width | Test |
|----------|-------|------|
| Mobile | 375px | Single column layout |
| Tablet | 768px | Two column grid |
| Desktop | 1280px | Three column grid |

Use browser DevTools to simulate (Device Toolbar: `Ctrl+Shift+M`)

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Set in Vercel dashboard or your hosting platform:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Project Documentation
- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)

### Internal
- [Constitution](../../.specify/memory/constitution.md)
- [Templates](../../.specify/templates/)

---

## Getting Help

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Use `npm run dev -- -p 3001` |
| Type errors | Run `npm run type-check` |
| Styles not loading | Check Tailwind `@import` in globals.css |
| Auth not working | Check localStorage for token |
| API errors | Verify backend is running on port 8000 |

### Ask Questions

- Check existing [Issues](https://github.com/your-repo/issues)
- Create new issue with template
- Tag with `question` or `bug`

---

## Next Steps

1. ✅ Complete installation
2. ✅ Run `npm run dev`
3. ✅ Explore the codebase
4. ✅ Make your first change
5. ✅ Test the change
6. ✅ Commit and push

Happy coding! 🚀
