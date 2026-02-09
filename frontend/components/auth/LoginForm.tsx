'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import type { LoginCredentials } from '@/lib/auth-types';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);

    try {
      await login(credentials);
      onSuccess?.();
    } catch {
      // Error is handled by useAuth
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-card border-border/50">
      <CardHeader>
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-3xl text-white">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your account to continue
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a
              href="#"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full shadow-lg shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Demo Account
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <p>Use any email with password ≥ 6 characters</p>
            <p className="mt-1">Example: demo@example.com / password123</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
