/**
 * Mock Authentication Service
 * Replace with actual API calls to your FastAPI backend
 */

import type { User, LoginCredentials, SignupCredentials, AuthResponse } from './auth-types';

// Mock user database (in-memory)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date('2026-01-01'),
  },
];

const mockTokens = new Map<string, string>();

/**
 * Simulate login API call
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // For demo: accept any email with password length >= 6
  if (credentials.password.length < 6) {
    throw new Error('Invalid credentials');
  }

  const user = mockUsers.find(u => u.email === credentials.email) || {
    id: Math.random().toString(36),
    email: credentials.email,
    name: credentials.email.split('@')[0],
    createdAt: new Date(),
  };

  const token = `mock-token-${Date.now()}`;
  mockTokens.set(user.id, token);

  return { user, token };
}

/**
 * Simulate signup API call
 */
export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Validation
  if (credentials.password !== credentials.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (credentials.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user exists
  const existingUser = mockUsers.find(u => u.email === credentials.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: Math.random().toString(36),
    email: credentials.email,
    name: credentials.name,
    createdAt: new Date(),
  };

  mockUsers.push(newUser);

  const token = `mock-token-${Date.now()}`;
  mockTokens.set(newUser.id, token);

  return { user: newUser, token };
}

/**
 * Simulate logout API call
 */
export async function logout(): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Clear tokens
  mockTokens.clear();
}

/**
 * Simulate getting current user
 */
export async function getCurrentUser(token: string): Promise<User | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In real app, validate token and return user
  return mockUsers[0] || null;
}
