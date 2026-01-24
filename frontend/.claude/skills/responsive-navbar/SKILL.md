# Skill: Responsive Navbar

## Purpose
Create clean, functional, and accessible navigation bars that work across all device sizes.

## Core Requirements
- Mobile-first approach
- Hamburger menu on small screens (< 768px)
- Full navigation on larger screens
- Smooth transitions between states

## Desktop Behavior
- Horizontal navigation links
- Logo/brand on left
- Actions (login, cart, etc.) on right
- Hover states for interactive items
- Dropdowns with proper keyboard support

## Mobile Behavior
- Hamburger icon (3 lines)
- Full-screen or slide-out menu
- Close button after opening
- Touch-friendly tap targets (min 44x44px)
- Backdrop blur or dimmed background

## Technical Standards
- Semantic HTML: `<nav>`, `<ul>`, `<li>`, `<a>` or `<button>`
- ARIA labels for accessibility
- Escape key closes mobile menu
- Click outside closes mobile menu
- Proper focus management

## Styling Rules
- Sticky or fixed positioning
- Subtle shadow on scroll
- Active state for current page
- Consistent padding and spacing
- Neutral colors matching brand

## Forbidden
- Complex animations
- Nested multi-level dropdowns (keep it flat)
- JavaScript-heavy implementations (prefer CSS)
- Inaccessible patterns (no click traps)
