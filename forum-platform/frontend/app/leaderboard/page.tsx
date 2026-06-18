'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Trophy, Medal, Award, TrendingUp, Users, Star } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  reputation: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeRange, setTimeRange] = useState<'all' | 'monthly' | 'weekly'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reputation/leaderboard?time=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">
          {rank}
        </span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 2:
        return 'from-slate-400/20 to-slate-500/10 border-slate-400/30';
      case 3:
        return 'from-amber-600/20 to-amber-700/10 border-amber-600/30';
      default:
        return 'from-slate-800 to-slate-800/50 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Reputation Leaderboard
          </h1>
          <p className="text-slate-400">See who's leading the community</p>
        </div>

        {/* Time Range Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'monthly', 'weekly'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {range === 'all' ? 'All Time' : range === 'monthly' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Second Place */}
            <div className={`rounded-xl border bg-gradient-to-b p-6 text-center ${getRankColor(2)}`}>
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {leaderboard[1].displayName.charAt(0)}
              </div>
              <div className="flex justify-center mb-2">
                <Medal className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">{leaderboard[1].displayName}</h3>
              <p className="text-yellow-400 font-bold text-lg">
                {leaderboard[1].reputation.toLocaleString()}
              </p>
              <p className="text-slate-400 text-sm">reputation</p>
            </div>

            {/* First Place */}
            <div className={`rounded-xl border bg-gradient-to-b p-6 text-center ${getRankColor(1)}`}>
              <div className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {leaderboard[0].displayName.charAt(0)}
              </div>
              <h3 className="text-white font-bold text-xl mb-1">{leaderboard[0].displayName}</h3>
              <p className="text-yellow-400 font-bold text-2xl">
                {leaderboard[0].reputation.toLocaleString()}
              </p>
              <p className="text-slate-400 text-sm">reputation</p>
            </div>

            {/* Third Place */}
            <div className={`rounded-xl border bg-gradient-to-b p-6 text-center ${getRankColor(3)}`}>
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {leaderboard[2].displayName.charAt(0)}
              </div>
              <div className="flex justify-center mb-2">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-white font-semibold mb-1">{leaderboard[2].displayName}</h3>
              <p className="text-yellow-400 font-bold text-lg">
                {leaderboard[2].reputation.toLocaleString()}
              </p>
              <p className="text-slate-400 text-sm">reputation</p>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Full Rankings
            </h2>
            <span className="text-slate-400 text-sm">{leaderboard.length} users</span>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 bg-slate-700 rounded"></div>
                  <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-1/3 mb-1"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 flex items-center gap-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <a href={`/users/${entry.id}`} className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {entry.displayName.charAt(0)}
                  </a>

                  <div className="flex-1 min-w-0">
                    <a href={`/users/${entry.id}`} className="text-white font-medium hover:text-blue-400 transition-colors">
                      {entry.displayName}
                    </a>
                    <p className="text-slate-400 text-sm">@{entry.username}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold">
                      <Star className="w-4 h-4" />
                      <span>{entry.reputation.toLocaleString()}</span>
                    </div>
                    <p className="text-slate-500 text-xs">reputation</p>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                  <p className="text-slate-400">No data available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
