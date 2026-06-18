'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, User, Calendar, MessageCircle, Trophy, Settings, Edit3, Heart } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  createdAt: string;
  postCount: number;
  replyCount: number;
  likeCount: number;
  reputation: number;
}

const mockUser: UserProfile = {
  id: '1',
  username: 'john_doe',
  displayName: 'John Doe',
  email: 'john@example.com',
  bio: 'Full-stack developer passionate about React and Node.js. Love building scalable applications and contributing to open source.',
  createdAt: '2023-06-15',
  postCount: 128,
  replyCount: 456,
  likeCount: 2340,
  reputation: 1500,
};

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                  <div className="h-8 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">😕</span>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">User not found</h1>
            <p className="text-slate-400">The user you're looking for doesn't exist.</p>
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                  @{user.username}
                </span>
              </div>
              <p className="text-slate-400 mb-4">{user.bio}</p>

              <div className="flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button>Send Message</Button>
              <Button variant="ghost">
                <Heart className="w-4 h-4 mr-2" />
                Follow
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{user.postCount}</div>
            <div className="text-sm text-slate-400 mt-1">Topics Created</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{user.replyCount}</div>
            <div className="text-sm text-slate-400 mt-1">Replies</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{user.likeCount}</div>
            <div className="text-sm text-slate-400 mt-1">Likes Received</div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">Reputation</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-white">{user.reputation}</div>
            <div className="flex-1">
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                  style={{ width: `${Math.min((user.reputation / 2000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-slate-400">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}