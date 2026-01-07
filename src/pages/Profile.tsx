import { useStore } from '../store/useStore';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useStore();

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl space-y-8">
      <div className="flex items-center gap-6 p-6 rounded-lg border border-border bg-card">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <UserIcon className="h-12 w-12" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-4 w-4" /> Settings
        </h2>
        <div className="p-4 rounded-lg border border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
                <span>Reading Preferences</span>
                <button className="text-sm text-primary hover:underline">Edit</button>
            </div>
             <div className="flex items-center justify-between">
                <span>Account Security</span>
                <button className="text-sm text-primary hover:underline">Manage</button>
            </div>
        </div>
      </div>

      <button 
        onClick={() => setUser(null)}
        className="flex items-center gap-2 text-destructive hover:text-destructive/80 font-medium"
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </button>
    </div>
  );
}
