'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { MessageSquare, Heart, UserPlus, Award, Users, BookOpen, Reply, Activity } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

interface Activity {
  id: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  target?: any;
  metadata?: any;
}

const ACTIVITY_ICONS: Record<string, any> = {
  TOPIC_CREATED: MessageSquare,
  REPLY_CREATED: Reply,
  REACTION_LIKE: Heart,
  REACTION_LOVE: Heart,
  FOLLOWED_USER: UserPlus,
  BADGE_EARNED: Award,
  GROUP_JOINED: Users,
};

const ACTIVITY_COLORS: Record<string, string> = {
  TOPIC_CREATED: 'text-blue-400 bg-blue-400/20',
  REPLY_CREATED: 'text-green-400 bg-green-400/20',
  REACTION_LIKE: 'text-red-400 bg-red-400/20',
  REACTION_LOVE: 'text-red-400 bg-red-400/20',
  FOLLOWED_USER: 'text-purple-400 bg-purple-400/20',
  BADGE_EARNED: 'text-yellow-400 bg-yellow-400/20',
  GROUP_JOINED: 'text-cyan-400 bg-cyan-400/20',
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchActivities();
    } else {
      setLoading(false);
    }
  }, [page]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/activity/feed?page=${page}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(prev => page === 1 ? data.activities : [...prev, ...data.activities]);
        setHasMore(data.activities.length === 20);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityMessage = (activity: Activity) => {
    const user = activity.user;
    switch (activity.type) {
      case 'TOPIC_CREATED':
        return (
          <>
            <span className="font-medium text-white">{user.displayName}</span>
            {' created a new topic '}
            <a href={`/forums/categories/${activity.target?.category?.slug}/topics/${activity.metadata?.slug}`} className="text-blue-400 hover:underline">
              {activity.metadata?.title}
            </a>
          </>
        );
      case 'REPLY_CREATED':
        return (
          <>
            <span className="font-medium text-white">{user.displayName}</span>
            {' replied to '}
            <a href={`/forums/categories/${activity.target?.category?.slug}/topics/${activity.metadata?.topicSlug}`} className="text-blue-400 hover:underline">
              {activity.metadata?.topicTitle}
            </a>
          </>
        );
      case 'FOLLOWED_USER':
        return (
          <>
            <span className="font-medium text-white">{user.displayName}</span>
            {' started following '}
            <a href={`/users/${activity.target?.id}`} className="text-blue-400 hover:underline">
              {activity.target?.displayName}
            </a>
          </>
        );
      case 'BADGE_EARNED':
        return (
          <>
            <span className="font-medium text-white">{user.displayName}</span>
            {' earned a new badge '}
            <span className="text-yellow-400">{activity.metadata?.badgeName}</span>
          </>
        );
      case 'GROUP_JOINED':
        return (
          <>
            <span className="font-medium text-white">{user.displayName}</span>
            {' joined '}
            <a href={`/groups/${activity.metadata?.groupSlug}`} className="text-blue-400 hover:underline">
              {activity.metadata?.groupName}
            </a>
          </>
        );
      default:
        return (
          <>
            <span className="font-medium text-white">{user.displayName}</span>
            {' performed an action'}
          </>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Activity Feed</h1>
          <p className="text-slate-400">Sign in to see what your friends are doing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Activity Feed</h1>
          <p className="text-slate-400">See what people you follow are doing</p>
        </div>

        {loading && activities.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h2 className="text-xl font-semibold text-white mb-2">No activity yet</h2>
            <p className="text-slate-400">
              Follow some people to see their activity here
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] || Activity;
                const colorClass = ACTIVITY_COLORS[activity.type] || 'text-slate-400 bg-slate-400/20';

                return (
                  <div
                    key={activity.id}
                    className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {activity.user.displayName.charAt(0)}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${colorClass} rounded-full flex items-center justify-center`}>
                          <Icon className="w-3 h-3" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {getActivityMessage(activity)}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {formatTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Target preview */}
                    {activity.type === 'TOPIC_CREATED' && activity.target && (
                      <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-300 line-clamp-2">
                          {activity.metadata?.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          in {activity.target.category?.name}
                        </p>
                      </div>
                    )}

                    {activity.type === 'BADGE_EARNED' && activity.metadata?.badgeIcon && (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl">
                          {activity.metadata.badgeIcon}
                        </div>
                        <div>
                          <p className="text-white font-medium">{activity.metadata.badgeName}</p>
                          <p className="text-xs text-slate-400">Badge earned!</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="px-6 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
