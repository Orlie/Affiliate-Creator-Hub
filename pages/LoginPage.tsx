import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { GoogleIcon, AppleIcon } from '../components/icons/Icons';

const LoginPage: React.FC = () => {
  const { login, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Successful login will trigger a redirect from the App component
    } catch (err: any) {
      console.error(err.code, err.message);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to sign in. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setError('');
    setLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }
      // Success will trigger redirect via AuthContext
    } catch (err: any) {
      console.error(err.code, err.message);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(`Failed to sign in with ${provider}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Creator Hub</h1>
            <p className="mt-2 text-text-secondary">Welcome to the Affiliate Creator Hub.</p>
        </div>
        <div className="mt-8 bg-surface border border-border p-8 shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-center text-text-primary">Sign In</h2>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="email-input"
              disabled={loading}
            />
            <div>
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="password-input"
                  disabled={loading}
                />
                 <div className="text-right text-sm mt-1">
                    <Link to="/forgot-password" className="font-medium text-primary hover:brightness-110">
                        Forgot password?
                    </Link>
                </div>
            </div>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-text-secondary">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full flex items-center justify-center"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <GoogleIcon className="h-5 w-5 mr-2" />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full flex items-center justify-center"
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
              >
                <AppleIcon className="h-5 w-5 mr-2 text-text-primary" />
                Continue with Apple
              </Button>
            </div>
          <div className="text-center mt-6">
              <p className="text-sm text-text-secondary">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary hover:brightness-110">
                      Sign up
                  </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;