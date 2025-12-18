import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, error, successMessage, loading, clearMessages } = useAuthStore();

  useEffect(() => {
    clearMessages();
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      const success = await signUp(email, password);
      if (success) {
        setIsSignUp(false);
        setPassword('');
      }
    } else {
      await signIn(email, password);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <Card className="w-full max-w-md mx-4 bg-zinc-800/90 border-zinc-700 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-zinc-300" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-100">
            3D Editor
          </CardTitle>
          <p className="text-zinc-400 text-sm mt-1">
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500"
                />
              </div>
            </div>

            {successMessage && (
              <div className="text-green-400 text-sm text-center bg-green-500/10 py-2 rounded-md border border-green-500/20">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-md border border-red-500/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-600 hover:bg-zinc-500 text-zinc-100 font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-zinc-400 hover:text-zinc-300 text-sm underline-offset-4 hover:underline transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
