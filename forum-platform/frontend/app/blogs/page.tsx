'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    id: string;
    displayName: string;
  };
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  coverImage?: string;
}

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js 16 and React 19',
    excerpt: 'Learn how to build modern web applications with the latest versions of Next.js and React, including new features like Server Components and improved performance.',
    author: { id: '1', displayName: 'John Doe' },
    createdAt: '2024-01-15T10:30:00Z',
    viewCount: 1250,
    likeCount: 89,
    commentCount: 12,
  },
  {
    id: '2',
    title: 'Building Real-time Applications with WebSockets',
    excerpt: 'Explore how to implement real-time features in your applications using WebSocket technology for instant updates and notifications.',
    author: { id: '2', displayName: 'Jane Smith' },
    createdAt: '2024-01-14T14:20:00Z',
    viewCount: 890,
    likeCount: 67,
    commentCount: 8,
  },
  {
    id: '3',
    title: 'Best Practices for API Development',
    excerpt: 'Discover essential best practices for building robust and scalable APIs that can handle high traffic and provide excellent developer experience.',
    author: { id: '3', displayName: 'Mike Johnson' },
    createdAt: '2024-01-13T09:45:00Z',
    viewCount: 2100,
    likeCount: 156,
    commentCount: 23,
  },
];

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Latest Blogs</h1>
          <p className="text-slate-400">Read the latest articles from our community members</p>
        </div>

        {loading ? (
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
                <div className="h-8 bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-slate-700 rounded"></div>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors mb-3">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 mb-4">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {post.author.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{post.author.displayName}</p>
                        <p className="text-sm text-slate-500">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-2 text-slate-400">
                        <Eye className="w-4 h-4" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-2 text-slate-400">
                        <Heart className="w-4 h-4" />
                        {post.likeCount}
                      </span>
                      <span className="flex items-center gap-2 text-slate-400">
                        <MessageCircle className="w-4 h-4" />
                        {post.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="ghost">
            Load More Posts
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}