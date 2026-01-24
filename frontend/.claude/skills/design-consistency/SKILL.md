# Skill: Design Consistency

## Purpose
Maintain visual and interaction consistency across the entire application.

## Core Principle
Every component should feel like it belongs to the same product family.

## Design System Rules

### Colors
- Define a limited color palette (primary, secondary, neutral, semantic)
- Use CSS variables or design tokens
- Never hardcode color values
- Semantic naming: `color-primary`, `color-text`, `color-border`

### Typography
- Maximum 2-3 font families
- Consistent type scale (h1-h6, body, small, caption)
- Line heights: 1.5 for body, 1.2 for headings
- Consistent font weights per usage

### Spacing
- Use a spacing scale (4px, 8px, 16px, 24px, 32px, 48px)
- Never use arbitrary values like "13px" or "27px"
- Consistent padding inside components
- Consistent gaps between elements

### Borders & Shadows
- 1-2 border radius values max (e.g., 4px, 8px)
- 1-2 shadow styles max (subtle, elevated)
- Consistent border colors

### Component Patterns
- Reuse existing components before creating new ones
- Similar interactions should behave identically
- Buttons follow same hierarchy (primary, secondary, ghost)
- Forms follow same layout and validation

## Before Creating Anything
1. Check if a similar component exists
2. Verify if design tokens are defined
3. Ensure consistency with existing patterns

## Forbidden
- Copy-pasting styles (use design tokens)
- One-off components without reuse potential
- Inconsistent spacing or colors
- Creating new patterns without checking existing ones
