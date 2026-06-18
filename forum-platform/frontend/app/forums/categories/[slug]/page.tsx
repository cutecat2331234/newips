'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumApi, Category, Topic } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { MessageSquare, Eye, MessageCircle, Pin, Clock, ArrowLeft, Plus, Tag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { isAuthenticated } from '@/lib/auth';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await forumApi.getCategoryBySlug(slug);
        setCategory(response.data);
      } catch (error) {
        console.error('Failed to fetch category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const tagsArray = newTopicTags.split(',').map(t => t.trim()).filter(Boolean);
      await forumApi.createTopic(category!.id, newTopicTitle, newTopicContent, tagsArray);
      setShowNewTopicModal(false);
      setNewTopicTitle('');
      setNewTopicContent('');
      setNewTopicTags('');
      setError('');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create topic');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-700 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">😕</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Category not found</h1>
            <p className="text-slate-400">The category you're looking for doesn't exist.</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{category.name}</h1>
            <p className="text-slate-400">{category.description}</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {category.topics.length} topics
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {category.totalViews} views
              </span>
            </div>
            {isAuthenticated() && (
              <Button onClick={() => setShowNewTopicModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            )}
          </div>

          <div className="divide-y divide-slate-700">
            {category.topics.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No topics yet</h3>
                <p className="text-slate-400">Be the first to start a discussion in this category!</p>
              </div>
            ) : (
              category.topics.map((topic) => (
                <a
                  key={topic.id}
                  href={`/forums/categories/${slug}/topics/${topic.slug}`}
                  className="block p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium">
                        {topic.replyCount}
                      </div>
                      <span className="text-xs text-slate-500">Replies</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {topic.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                        {topic.isLocked && (
                          <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400">Locked</span>
                        )}
                        <h3 className="font-medium text-white hover:text-blue-400 transition-colors truncate">
                          {topic.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span>by {topic.author.displayName}</span>
                        <span>•</span>
                        <span>{formatDate(topic.createdAt)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {topic.viewCount}
                        </span>
                      </div>
                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {topic.tags.map((tagItem) => (
                            <span
                              key={tagItem.tag.id}
                              className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                              style={{ backgroundColor: `${tagItem.tag.color}20`, color: tagItem.tag.color }}
                            >
                              <Tag className="w-3 h-3" />
                              {tagItem.tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-500">Last reply</p>
                      <p className="text-xs text-slate-400">{formatDate(topic.lastReplyAt)}</p>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </main>

      {showNewTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-600 w-full max-w-lg">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Create New Topic</h2>
              <button
                onClick={() => {
                  setShowNewTopicModal(false);
                  setError('');
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <Input
                label="Title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Enter topic title..."
                className="bg-slate-700/50 border-slate-600 text-white"
              />

              <Textarea
                label="Content"
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                placeholder="Write your message..."
                rows={6}
                className="bg-slate-700/50 border-slate-600 text-white"
              />

              <Input
                label="Tags (comma separated)"
                value={newTopicTags}
                onChange={(e) => setNewTopicTags(e.target.value)}
                placeholder="tag1, tag2, tag3..."
                className="bg-slate-700/50 border-slate-600 text-white"
              />

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNewTopicModal(false);
                  setError('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTopic}>
                Create Topic
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}