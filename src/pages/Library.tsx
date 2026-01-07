import { useState } from 'react';
import { BookOpen, Clock, Bookmark } from 'lucide-react';

export default function Library() {
  const [activeTab, setActiveTab] = useState('bookmarks');

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">My Library</h1>
      
      <div className="space-y-4">
        <div className="flex border-b border-border">
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bookmarks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> Bookmarks
            </div>
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('history')}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> History
            </div>
          </button>
        </div>

        <div className="py-4">
          {activeTab === 'bookmarks' && (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>You haven't bookmarked any stories yet.</p>
            </div>
          )}
          {activeTab === 'history' && (
             <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Your reading history is empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
