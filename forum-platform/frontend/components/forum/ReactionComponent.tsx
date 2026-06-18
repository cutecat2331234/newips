'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { isAuthenticated } from '@/lib/auth';

const REACTION_TYPES = [
  { type: 'like', icon: '👍', label: 'Like', color: '#3b82f6' },
  { type: 'love', icon: '❤️', label: 'Love', color: '#ef4444' },
  { type: 'laugh', icon: '😂', label: 'Haha', color: '#f59e0b' },
  { type: 'wow', icon: '😮', label: 'Wow', color: '#8b5cf6' },
  { type: 'sad', icon: '😢', label: 'Sad', color: '#06b6d4' },
  { type: 'angry', icon: '😠', label: 'Angry', color: '#f97316' },
];

interface Reaction {
  type: string;
  icon: string;
  label: string;
  color: string;
  count: number;
}

interface ReactionComponentProps {
  targetType: 'topic' | 'post';
  targetId: string;
  initialReactions?: Reaction[];
  initialCount?: number;
  initialUserReaction?: string | null;
}

export default function ReactionComponent({
  targetType,
  targetId,
  initialReactions = [],
  initialCount = 0,
  initialUserReaction = null,
}: ReactionComponentProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [userReaction, setUserReaction] = useState<string | null>(initialUserReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(initialReactions.length === 0);

  useEffect(() => {
    if (initialReactions.length === 0) {
      fetchReactions();
    }
  }, [targetType, targetId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/reactions/${targetType}/${targetId}`);
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setTotalCount(data.totalCount);
      }

      if (isAuthenticated()) {
        const userReactionRes = await fetch(`/api/reactions/${targetType}/${targetId}/user`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (userReactionRes.ok) {
          const userData = await userReactionRes.json();
          setUserReaction(userData.reactionType);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ targetType, targetId, reactionType }),
      });

      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions);
        setTotalCount(data.totalCount);
        setUserReaction(reactionType);
        setShowPicker(false);
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const userReactionData = REACTION_TYPES.find(r => r.type === userReaction);

  return (
    <div className="flex items-center gap-2">
      {/* Main Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            userReaction
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
          }`}
        >
          {userReactionData ? (
            <>
              <span>{userReactionData.icon}</span>
              <span className="text-sm">{userReactionData.label}</span>
            </>
          ) : (
            <>
              <span>👍</span>
              <span className="text-sm">Like</span>
            </>
          )}
        </button>

        {/* Reaction Picker */}
        {showPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-800 rounded-xl border border-slate-600 shadow-xl flex gap-1 animate-in fade-in slide-in-from-bottom-2">
            {REACTION_TYPES.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className={`relative group p-2 rounded-lg hover:bg-slate-700 transition-all ${
                  userReaction === reaction.type ? 'bg-slate-700' : ''
                }`}
                title={reaction.label}
              >
                <span className="text-2xl">{reaction.icon}</span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {reaction.label}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction Stats */}
      {totalCount > 0 && (
        <div className="flex items-center gap-1">
          {reactions.slice(0, 3).map((reaction) => (
            <span
              key={reaction.type}
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: `${reaction.color}20` }}
              title={`${reaction.label}: ${reaction.count}`}
            >
              {reaction.icon}
            </span>
          ))}
          {reactions.length > 3 && (
            <span className="text-slate-400 text-sm ml-1">+{reactions.length - 3}</span>
          )}
          <span className="text-slate-400 text-sm ml-2">{totalCount}</span>
        </div>
      )}

      {/* Click outside to close */}
      {showPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

// Compact version for lists
export function ReactionCount({ count, reactions }: { count: number; reactions: Reaction[] }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {reactions.slice(0, 3).map((reaction) => (
        <span
          key={reaction.type}
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: `${reaction.color}20` }}
        >
          {reaction.icon}
        </span>
      ))}
      <span className="text-slate-400 text-xs ml-1">{count}</span>
    </div>
  );
}
