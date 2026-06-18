'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  MessageSquare,
  Heart,
  UserPlus,
  Award,
  AtSign,
  MessageCircle,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  Filter,
} from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

const NOTIFICATION_ICONS: Record<string, any> = {
  NEW_REPLY: MessageSquare,
  NEW_TOPIC: MessageCircle,
  LIKE: Heart,
  FOLLOW: UserPlus,
  BADGE: Award,
  MENTION: AtSign,
  SYSTEM: Bell,
  REPORT: MessageSquare,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  NEW_REPLY: 'text-blue-400 bg-blue-400/20',
  NEW_TOPIC: 'text-green-400 bg-green-400/20',
  LIKE: 'text-red-400 bg-red-400/20',
  FOLLOW: 'text-purple-400 bg-purple-400/20',
  BADGE: 'text-yellow-400 bg-yellow-400/20',
  MENTION: 'text-cyan-400 bg-cyan-400/20',
  SYSTEM: 'text-slate-400 bg-slate-400/20',
  REPORT: 'text-orange-400 bg-orange-400/20',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      let url = '/api/notifications';
      if (filter) {
        url += `?type=${filter}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
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

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'NEW_REPLY':
      case 'NEW_TOPIC':
        return notification.data?.topicSlug
          ? `/forums/categories/${notification.data.categorySlug}/topics/${notification.data.topicSlug}`
          : '#';
      case 'MENTION':
        return notification.data?.contentUrl || '#';
      case 'FOLLOW':
        return `/users/${notification.sender?.id}`;
      case 'BADGE':
        return '/achievements';
      default:
        return '#';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-slate-400">Sign in to view your notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-blue-500 text-white text-sm rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              !filter
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {['NEW_REPLY', 'MENTION', 'LIKE', 'FOLLOW', 'BADGE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
            <h3 className="text-white font-medium mb-3">Notification Settings</h3>
            <div className="space-y-3">
              {['NEW_REPLY', 'NEW_TOPIC', 'MENTION', 'LIKE', 'FOLLOW', 'BADGE'].map((type) => (
                <label key={type} className="flex items-center justify-between">
                  <span className="text-slate-300">{type.replace('_', ' ')}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h2 className="text-xl font-semibold text-white mb-2">No notifications</h2>
            <p className="text-slate-400">
              {filter ? 'No notifications match this filter' : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
              const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-slate-400 bg-slate-400/20';

              return (
                <div
                  key={notification.id}
                  className={`bg-slate-800 rounded-xl border transition-colors ${
                    notification.isRead
                      ? 'border-slate-700'
                      : 'border-blue-500/50 bg-blue-500/5'
                  }`}
                >
                  <a
                    href={getNotificationLink(notification)}
                    className="block p-4"
                  >
                    <div className="flex gap-3">
                      {notification.sender ? (
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {notification.sender.displayName.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${colorClass} rounded-full flex items-center justify-center`}>
                            <Icon className="w-3 h-3" />
                          </div>
                        </div>
                      ) : (
                        <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.isRead ? 'text-slate-400' : 'text-white'}`}>
                          <span className="font-medium">
                            {notification.sender?.displayName || 'System'}
                          </span>
                          {' '}
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </a>

                  <div className="px-4 pb-2 flex justify-end gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
