'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Bookmark, Trash2, Edit3, Eye, MessageCircle, ArrowLeft, Folder } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

interface BookmarkItem {
  id: string;
  topicId: string;
  note?: string;
  createdAt: string;
  topic: {
    id: string;
    title: string;
    slug: string;
    replyCount: number;
    viewCount: number;
    createdAt: string;
    author: {
      id: string;
      displayName: string;
      username: string;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks);
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (topicId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setBookmarks(bookmarks.filter(b => b.topicId !== topicId));
      }
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  const handleUpdateNote = async (topicId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ note: noteText }),
      });
      if (response.ok) {
        setBookmarks(bookmarks.map(b =>
          b.topicId === topicId ? { ...b, note: noteText } : b
        ));
        setEditingNote(null);
        setNoteText('');
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
            <Bookmark className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Sign in to view bookmarks</h1>
          <p className="text-slate-400 mb-4">Save topics to read later and access them from any device.</p>
          <Button>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6" />
              Saved Topics
            </h1>
            <p className="text-slate-400">{bookmarks.length} topics saved</p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-4">
                <div className="h-6 bg-slate-700 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
              <Folder className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No saved topics yet</h2>
            <p className="text-slate-400">Click the bookmark icon on any topic to save it for later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <a
                      href={`/forums/categories/${bookmark.topic.category.slug}/topics/${bookmark.topic.slug}`}
                      className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {bookmark.topic.title}
                    </a>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                      <span>by {bookmark.topic.author.displayName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {bookmark.topic.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {bookmark.topic.replyCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingNote(bookmark.topicId);
                        setNoteText(bookmark.note || '');
                      }}
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                      title="Edit note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.topicId)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingNote === bookmark.topicId ? (
                  <div className="mt-4">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleUpdateNote(bookmark.topicId)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingNote(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : bookmark.note ? (
                  <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-300">{bookmark.note}</p>
                  </div>
                ) : null}

                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <span>Saved {formatDate(bookmark.createdAt)}</span>
                  <a
                    href={`/forums/categories/${bookmark.topic.category.slug}`}
                    className="hover:text-blue-400"
                  >
                    {bookmark.topic.category.name}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
