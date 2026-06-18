'use client';

import { useEffect, useState } from 'react';
import { forumApi, Category, Topic } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Users, ArrowRight, TrendingUp, Clock, Eye, MessageCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestTopics, setLatestTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, topicsRes] = await Promise.all([
          forumApi.getCategories(),
          forumApi.getCategoryBySlug('general'),
        ]);
        setCategories(categoriesRes.data);
        setLatestTopics(topicsRes.data.topics.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 bg-slate-700 rounded w-full"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to ForumHub</h1>
          <p className="text-slate-400">Join our vibrant community of passionate individuals. Discuss topics, share knowledge, and connect with like-minded people.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-white">Latest Discussions</h2>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="divide-y divide-slate-700">
                {latestTopics.map((topic) => (
                  <div key={topic.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white hover:text-blue-400 transition-colors truncate">
                          {topic.isPinned && <span className="text-yellow-400 mr-2">📌</span>}
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                          <span>{topic.author.displayName}</span>
                          <span>•</span>
                          <span>{formatDate(topic.createdAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {topic.viewCount}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {topic.replyCount}
                          </span>
                        </div>
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {topic.tags.slice(0, 3).map((tagItem) => (
                              <span
                                key={tagItem.tag.id}
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{ backgroundColor: `${tagItem.tag.color}20`, color: tagItem.tag.color }}
                              >
                                {tagItem.tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-white">Categories</h2>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <a
                    key={category.id}
                    href={`/forums/categories/${category.slug}`}
                    className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        {category.icon || '📁'}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {category.topics.length} topics
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Join Our Community</h3>
              <p className="text-blue-100 text-sm mb-4">
                Create an account to start participating in discussions, share your thoughts, and connect with others.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Get Started
              </Button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <h2 className="text-lg font-semibold text-white">Active Members</h2>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">User{i}</p>
                      <p className="text-xs text-slate-400">Active now</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}