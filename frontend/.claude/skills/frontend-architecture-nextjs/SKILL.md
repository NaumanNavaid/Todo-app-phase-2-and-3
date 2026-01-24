# Skill: Frontend Architecture – Next.js

## Purpose
Maintain scalable, clean, and maintainable frontend architecture.

## Framework Assumptions
- Next.js App Router
- React Server Components by default
- Tailwind CSS

## Architecture Rules
- Server Components by default
- Client Components only when interaction is required
- Single API client layer
- No direct fetch calls inside UI components
- Clear separation of concerns

## Folder Discipline
- Pages handle routing only
- Components are reusable and dumb
- Business logic stays outside UI

## State Management
- Prefer server state
- Minimal client-side state
- No unnecessary global stores

## Forbidden
- Random folder structures
- Fetch logic inside JSX
- Over-engineered state solutions
