'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumApi, Topic, Reply, User } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Eye, MessageCircle, Heart, Bookmark, Share2, Edit3, Trash2, Pin, Lock, Send, User as UserIcon } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { isAuthenticated, getUser } from '@/lib/auth';

export default function TopicPage() {
  const { slug: categorySlug, topicSlug } = useParams<{ slug: string; topicSlug: string }>();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await forumApi.getTopicBySlug(topicSlug);
        setTopic(response.data);
        setReplies(response.data.replies);
      } catch (error) {
        console.error('Failed to fetch topic:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicSlug]);

  const handleReply = async () => {
    if (!replyContent.trim()) {
      setError('Please enter a reply');
      return;
    }

    try {
      const response = await forumApi.createReply(topic!.id, replyContent);
      setReplies([...replies, response.data]);
      setReplyContent('');
      setError('');
      if (replyRef.current) {
        replyRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post reply');
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

  const currentUser = getUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                <div>
                  <div className="h-6 bg-slate-700 rounded w-1/3 mb-1"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-700 rounded w-full mb-4"></div>
              <div className="h-4 bg-slate-700 rounded w-4/5"></div>
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                    <div>
                      <div className="h-5 bg-slate-700 rounded w-1/4 mb-1"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">😕</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Topic not found</h1>
            <p className="text-slate-400">The topic you're looking for doesn't exist.</p>
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
          <Button variant="ghost" onClick={() => router.push(`/forums/categories/${categorySlug}`)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <a href="/" className="hover:text-white">Home</a>
              <span>/</span>
              <a href={`/forums/categories/${categorySlug}`} className="hover:text-white">{categorySlug}</a>
              <span>/</span>
              <span className="text-slate-300">{topic.title}</span>
            </nav>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {topic.isPinned && (
                <Pin className="w-4 h-4 text-yellow-500" />
              )}
              {topic.isLocked && (
                <Lock className="w-4 h-4 text-red-500" />
              )}
              <h1 className="text-xl font-bold text-white">{topic.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {topic.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {topic.replyCount}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {topic.author.displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-white">{topic.author.displayName}</span>
                  <span className="text-sm text-slate-500">•</span>
                  <span className="text-sm text-slate-500">{formatDate(topic.createdAt)}</span>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap">{topic.content}</p>
                </div>
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-700">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                    <Bookmark className="w-4 h-4" />
                    <span className="text-sm">Bookmark</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                  {currentUser?.id === topic.author.id && (
                    <>
                      <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                        <Edit3 className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Replies ({replies.length})</h2>
          </div>

          <div className="space-y-4">
            {replies.map((reply) => (
              <div key={reply.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                      {reply.author.displayName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-white">{reply.author.displayName}</span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-500">{formatDate(reply.createdAt)}</span>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-300 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm">
                        <Heart className="w-4 h-4" />
                        Like
                      </button>
                      {currentUser?.id === reply.author.id && (
                        <>
                          <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm">
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {replies.length === 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No replies yet</h3>
              <p className="text-slate-400">Be the first to reply to this topic!</p>
            </div>
          )}
        </div>

        {isAuthenticated() && !topic.isLocked && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Write a Reply</h3>
            <Textarea
              ref={replyRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
              className="bg-slate-700/50 border-slate-600 text-white mb-4"
            />
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleReply}>
                <Send className="w-4 h-4 mr-2" />
                Post Reply
              </Button>
            </div>
          </div>
        )}

        {!isAuthenticated() && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <p className="text-slate-400 mb-4">Please sign in to reply to this topic.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" className="text-slate-300">
                <a href="/login">Sign In</a>
              </Button>
              <Button>
                <a href="/register">Sign Up</a>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}