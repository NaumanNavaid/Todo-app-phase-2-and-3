# Technology Research: TodoApp - Professional Task Manager with AI Assistant

**Feature**: 001-todo-app
**Date**: 2026-01-21
**Purpose**: Document technology decisions and rationale for frontend implementation

---

## Executive Summary

This document captures the research and decision-making process for selecting the technology stack for the TodoApp frontend. The application is a web-based task management system with an AI chat interface placeholder, designed for integration with an existing FastAPI backend.

**Selected Stack**: Next.js 16.1 + React 19 + TypeScript 5 + Tailwind CSS v4

---

## Technology Decisions

### 1. Frontend Framework: Next.js 16.1

**Decision**: Use Next.js 16.1 with App Router

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Next.js 16.1 | Built-in routing, SSR, API routes, excellent DX | Learning curve for beginners | **SELECTED** |
| Vite + React | Faster dev server, simpler | Manual routing setup, no SSR | Rejected |
| Create React App | Simple, widely adopted | Deprecated, outdated tooling | Rejected |
| Remix | Excellent nested routing | Smaller ecosystem, more opinionated | Rejected |

**Rationale**:
- Next.js 16.1 represents the latest stable version with modern features
- App Router provides React Server Components out of the box
- Built-in API routes will facilitate future FastAPI proxying
- Strong community momentum and long-term support guarantee
- Zero-config deployment to Vercel or self-hosted environments

**Key Features Leveraged**:
- File-based routing (`app/page.tsx`, `app/layout.tsx`)
- Server and Client Component separation
- Built-in image optimization (future use for avatars)
- API routes for potential middleware needs

---

### 2. UI Library: React 19.2.3

**Decision**: Use React 19.2.3 (latest stable)

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| React 19 | Latest features, improved Concurrent rendering | New ecosystem patterns | **SELECTED** |
| React 18 | Stable, widely documented | Missing new features | Rejected |
| Vue 3 | Simpler reactivity model | Smaller job market | Rejected |
| Svelte 4 | Best performance, no VDOM | Smaller ecosystem | Rejected |

**Rationale**:
- React 19 includes automatic JSX runtime (no `import React` needed)
- Improved Suspense and Transitions for better UX
- Next.js 16.1 is built specifically for React 19
- Largest component library ecosystem
- Type-safe with TypeScript 5

---

### 3. Styling: Tailwind CSS v4

**Decision**: Use Tailwind CSS v4 with @import syntax (no config file)

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Tailwind v4 | No config needed, faster build, CSS variables | New syntax changes | **SELECTED** |
| Tailwind v3 | Stable, well-documented | Requires `tailwind.config.js` | Rejected |
| CSS Modules | Scoped by default, native | No utility classes | Rejected |
| Styled Components | Dynamic styling | Runtime overhead, larger bundle | Rejected |

**Rationale**:
- Next.js 16.1 has native Tailwind v4 support
- No configuration file needed (uses `@import "tailwindcss"`)
- CSS-first approach enables better theme customization
- Smaller bundle size due to CSS variables
- Utility classes align with rapid prototyping needs

**Key v4 Differences**:
- Gradient syntax: `bg-linear-to-br` instead of `bg-gradient-to-br`
- `@import` replaces `@tailwind` directives
- CSS variables for theme customization in `:root`
- No `tailwind.config.js` file required

---

### 4. Language: TypeScript 5

**Decision**: Use TypeScript 5 in strict mode

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| TypeScript 5 | Type safety, great IDE support | Build step required | **SELECTED** |
| JavaScript | No build step | No type safety, runtime errors | Rejected |
| JSDoc | Types without compilation | Limited type inference | Rejected |

**Rationale**:
- Catches type errors at compile time (60-70% of bugs)
- Self-documenting code with interfaces and types
- Excellent IDE autocomplete and refactoring
- Industry standard for React/Next.js projects
- Next.js 16.1 has first-class TypeScript support

**Strict Mode Settings**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

---

### 5. State Management: React Hooks + Context API

**Decision**: Use built-in React hooks (useState, useContext, useMemo, useCallback)

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| React Hooks | Built-in, no dependencies | Manual for complex state | **SELECTED** |
| Zustand | Simple, boilerplate-free | Additional dependency | Rejected for now |
| Redux Toolkit | Standard for large apps | Overkill for this scope | Rejected |
| Jotai | Atomic state, simple | Smaller ecosystem | Rejected |

**Rationale**:
- TodoApp has moderate state complexity (todos, auth, chat, tabs)
- React Context + hooks sufficient for current scale
- No external dependencies reduces bundle size
- Can migrate to Zustand/Redux if state grows
- Aligned with React 19's improved hook performance

**State Split Strategy**:
- `useAuth`: User authentication and session
- `useTodos`: Task CRUD and filtering
- `useChat`: Chat messages and sending
- `useTabs`: Tab navigation state

---

### 6. Data Fetching: Client-side (mock) → REST API Integration

**Decision**: Start with mock data, prepare REST API client structure

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Mock data | Immediate development, no backend dependency | Not real data | **PHASE 1** |
| REST API (FastAPI) | Real data, user's existing backend | Requires backend | **PHASE 2** |
| GraphQL | Single endpoint, typed queries | Backend must support | Rejected |
| tRPC | End-to-end types, no schemas | Backend must use Node/TypeScript | Rejected |

**Rationale**:
- User has existing FastAPI backend
- Frontend should work standalone for development
- Mock data allows immediate UI development
- API client structure prepared for seamless switchover
- OpenAPI specifications ensure contract alignment

**API Client Pattern**:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
  getTodos: () => fetch(`${API_BASE_URL}/todos`).then(r => r.json()),
  createTodo: (todo) => fetch(`${API_BASE_URL}/todos`, { method: 'POST', body: JSON.stringify(todo) }),
  // ...
};
```

---

### 7. Authentication: JWT with localStorage

**Decision**: JWT tokens stored in localStorage (demo: mock tokens)

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| JWT + localStorage | Simple, works with SPA | XSS vulnerable if not careful | **SELECTED** |
| HTTP-only cookies | More secure, XSS-proof | Requires backend setup | Future enhancement |
| Third-party (NextAuth) | Feature-rich, OAuth ready | Overkill for custom backend | Rejected |
| Session-based | Simple server-side | Not SPA-friendly | Rejected |

**Rationale**:
- User's FastAPI backend will handle JWT issuance
- localStorage allows immediate demo functionality
- X-XSS-Protection headers mitigate XSS risks
- Can upgrade to httpOnly cookies in production
- Consistent with standard SPAs

**Token Storage**:
```typescript
// Session persistence
localStorage.setItem('auth_token', token);
localStorage.setItem('user', JSON.stringify(user));
```

---

### 8. Form Handling: Controlled Components + Validation

**Decision**: React controlled components with inline validation

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Controlled components | Simple, React-native | Manual validation | **SELECTED** |
| React Hook Form | Less boilerplate, performant | Additional dependency | Rejected for now |
| Formik | Mature, widely-used | Larger bundle, dated API | Rejected |
| Zod + RHF | Type-safe validation | More complexity | Rejected |

**Rationale**:
- TodoApp forms are simple (3-5 fields)
- Controlled components provide immediate validation
- No need for form library overhead at this scale
- Can upgrade to React Hook Form if forms grow complex

---

### 9. Icons: Inline SVG / Unicode

**Decision**: Use inline SVG for critical icons, Unicode for common symbols

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Inline SVG | Customizable, no request | Code clutter | **SELECTED** (limited) |
| Unicode | Zero dependencies, simple | Limited set, inconsistent | **SELECTED** (common) |
| Lucide React | Tree-shakeable, consistent | Additional dependency | Rejected for now |
| Heroicons | Official Tailwind icons | Must install separately | Rejected for now |

**Rationale**:
- Minimize dependencies for faster initial development
- Unicode sufficient for common UI elements (📋, 🤖, ✓, ✗)
- Inline SVG for branding elements only
- Can add Lucide/Heroicons if icon needs grow

**Unicode Usage**:
- Tab icons: `📋` (Todos), `🤖` (AI Assistant)
- Checkmarks: `✓` (complete), `✗` (delete)
- Priority indicators can use colored badges instead

---

### 10. Testing Strategy: Manual → Jest + React Testing Library

**Decision**: Manual testing for MVP, automated tests added in Phase 2

**Alternatives Considered**:
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Manual testing | Immediate, no setup | Not scalable | **PHASE 1** |
| RTL + Jest | Standard, component-focused | Setup time | **PHASE 2** |
| Playwright | E2E, real browser | Slower, more brittle | **PHASE 3** |
| Vitest | Faster than Jest | Newer, less mature | Rejected |

**Rationale**:
- User's priority is working features first
- Component tests provide good coverage for React apps
- Manual testing acceptable for initial prototype
- Automated tests added before production deployment

**Test Plan**:
- Phase 1: Manual testing of user flows
- Phase 2: Component tests with React Testing Library
- Phase 3: E2E tests with Playwright

---

## Architecture Patterns

### Component Architecture: Container/Presentational Separation

```
Smart Components (Containers):
- TodoDashboard (state, logic)
- ChatInterface (state, logic)
- AuthPage (state, logic)

Dumb Components (Presentational):
- TodoCard (props → UI)
- Button (props → UI)
- Input (props → UI)
```

**Rationale**: Clear separation enables easier testing and reusability

### Custom Hooks Pattern

```typescript
// State + logic encapsulation
const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  // CRUD operations, filtering, stats
  return { todos, addTodo, updateTodo, deleteTodo, stats };
};
```

**Rationale**: Reusable state logic, cleaner components

---

## Performance Considerations

### Bundle Size Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Initial JS bundle | < 200 KB gzipped | Fast first paint on mobile |
| First Contentful Paint | < 1.5s (4G) | Good perceived performance |
| Time to Interactive | < 3s (4G) | Usable application quickly |

### Optimization Strategies

1. **Code Splitting**: Dynamic imports for chat interface
   ```typescript
   const ChatInterface = dynamic(() => import('@/components/chat/ChatInterface'));
   ```

2. **Image Optimization**: Next.js Image component for avatars (future)

3. **CSS Purging**: Tailwind v4 automatically purges unused styles

4. **Tree Shaking**: ES modules in Next.js automatically tree-shake

---

## Accessibility Targets

| Standard | Target | Notes |
|----------|--------|-------|
| WCAG Level | AA | Industry standard for public apps |
| Keyboard Navigation | 100% | All features accessible via keyboard |
| Screen Reader | NVDA/JAWS compatible | Semantic HTML, ARIA labels |
| Color Contrast | 4.5:1 minimum | Tailwind slate palette meets this |

---

## Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 120+ | Last 2 versions |
| Firefox | 120+ | Last 2 versions |
| Safari | 16+ | Last 2 versions |
| Edge | 120+ | Chromium-based |

**Rationale**: Modern browser APIs (ES2022+, CSS Grid, CSS Variables)

---

## Security Considerations

### Frontend Security Measures

1. **XSS Prevention**:
   - React auto-escapes JSX content
   - Avoid `dangerouslySetInnerHTML`
   - Sanitize any user-generated content

2. **CSRF Protection**:
   - Backend must implement CSRF tokens
   - SameSite cookie attributes

3. **Content Security Policy**:
   ```typescript
   // next.config.js
   headers: {
     'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline';"
   }
   ```

4. **JWT Storage**:
   - localStorage for demo (acceptable for this scope)
   - Upgrade to httpOnly cookies for production

---

## Deployment Strategy

### Development
```bash
npm run dev          # Next.js dev server on :3000
```

### Production
```bash
npm run build        # Optimized production build
npm start            # Production server
```

### Deployment Options
1. **Vercel**: Zero-config deployment (recommended)
2. **Self-hosted**: Node.js server with PM2
3. **Docker**: Containerized deployment

---

## Technology Radar Summary

| Technology | Status | Trial | Assess | Hold | Adopt |
|------------|--------|-------|--------|------|-------|
| Next.js 16.1 | ✅ Adopt | | | | ✅ |
| React 19 | ✅ Adopt | | | | ✅ |
| TypeScript 5 | ✅ Adopt | | | | ✅ |
| Tailwind CSS v4 | ✅ Adopt | | | | ✅ |
| Zustand | | ✅ Trial | | | |
| React Hook Form | | ✅ Trial | | | |
| Playwright | | ✅ Trial | | | |

**Legend**:
- **Adopt**: Use for new projects
- **Trial**: Worth exploring for future needs
- **Assess**: Research for potential use
- **Hold**: Not recommended currently

---

## References and Resources

### Documentation
- [Next.js 16.1 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [TypeScript 5 Handbook](https://www.typescriptlang.org/docs/)

### Learning Resources
- [Next.js Learn Course](https://nextjs.org/learn)
- [React 19 Beta Docs](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

### API Specifications
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)

---

## Conclusion

The selected technology stack (Next.js 16.1 + React 19 + TypeScript 5 + Tailwind CSS v4) provides:

✅ Modern, future-forward technology with strong community support
✅ Excellent developer experience with type safety
✅ Fast performance with minimal configuration
✅ Clear upgrade paths for state management, forms, and testing
✅ Seamless integration path to user's existing FastAPI backend

This stack balances rapid development velocity with production readiness, enabling immediate feature delivery while maintaining architectural integrity for long-term maintenance.
