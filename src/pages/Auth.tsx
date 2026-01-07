import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { User } from '../types';

export default function Auth() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Mock login
    const mockUser: User = {
      id: '1',
      email: 'demo@fictionzone.net',
      username: 'DemoReader',
      reading_preferences: {
        theme: 'light',
        font_size: 16,
        font_family: 'Inter'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(mockUser);
    navigate('/');
  };

  return (
    <div className="container py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg border border-border bg-card shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'Enter your details to sign in' : 'Join FictionZone today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              required
              className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              required
              className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full h-10 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
