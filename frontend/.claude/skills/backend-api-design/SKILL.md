# Skill: Backend API Design

## Purpose
Create predictable, consistent, and consumer-friendly APIs.

## Design Principles
- RESTful conventions
- Clear resource naming
- Explicit behavior

## API Rules
- Use standard HTTP status codes
- Consistent error response structure
- JWT authentication via Authorization header
- Clear request and response schemas

## Error Format
- error: string
- message: human-readable explanation
- details: optional technical info

## Data Handling
- Validate inputs strictly
- Never trust client data
- Paginate list endpoints

## Forbidden
- Inconsistent response shapes
- Silent failures
- Ambiguous endpoints
