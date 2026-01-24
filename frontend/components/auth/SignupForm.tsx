'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import type { SignupCredentials } from '@/lib/auth-types';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const { signup, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      await signup(credentials);
      onSuccess?.();
    } catch {
      // Error is handled by useAuth
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = credentials.password === credentials.confirmPassword &&
    credentials.password.length >= 6 &&
    credentials.name.trim() !== '';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create Account</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Start organizing your tasks today
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={credentials.name}
            onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
            required
            autoFocus
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
            minLength={6}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={credentials.confirmPassword}
            onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
            required
            minLength={6}
            error={credentials.confirmPassword && credentials.password !== credentials.confirmPassword
              ? 'Passwords do not match'
              : undefined
            }
          />

          <div className="text-xs text-slate-500">
            <p>By signing up, you agree to our Terms of Service and Privacy Policy.</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
