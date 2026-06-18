'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Poll, BarChart3, CheckCircle2, Clock, Users } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  voteCount?: number;
  percentage?: number;
}

interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  isActive: boolean;
  hasVoted: boolean;
  userVotedOptions: string[];
  canSeeResults: boolean;
  allowMultiple: boolean;
  maxChoices: number;
  endsAt?: string;
  showResults: string;
}

interface PollComponentProps {
  topicId: string;
  initialData?: PollData;
}

export default function PollComponent({ topicId, initialData }: PollComponentProps) {
  const [poll, setPoll] = useState<PollData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialData) {
      fetchPoll();
    }
  }, [topicId]);

  const fetchPoll = async () => {
    try {
      const response = await fetch(`/api/polls/topic/${topicId}`);
      if (response.ok) {
        const data = await response.json();
        setPoll(data);
      }
    } catch (err) {
      console.error('Failed to fetch poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (optionId: string) => {
    if (poll?.hasVoted) return;

    setSelectedOptions(prev => {
      if (poll?.allowMultiple) {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        }
        if (prev.length >= (poll?.maxChoices || 1)) {
          return prev;
        }
        return [...prev, optionId];
      } else {
        return [optionId];
      }
    });
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      setError('Please select at least one option');
      return;
    }

    setVoting(true);
    setError('');

    try {
      const response = await fetch(`/api/polls/${poll?.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIds: selectedOptions }),
      });

      if (response.ok) {
        await fetchPoll();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to vote');
      }
    } catch (err) {
      setError('Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const isEnded = poll.endsAt && new Date(poll.endsAt) < new Date();

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Poll className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-white">{poll.question}</h3>
      </div>

      <div className="space-y-3 mb-4">
        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const isUserVoted = poll.userVotedOptions.includes(option.id);
          const showPercentage = poll.canSeeResults || isEnded;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              disabled={poll.hasVoted || isEnded}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
              } ${poll.hasVoted || isEnded ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-500'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white">{option.text}</span>
                </div>
                {isUserVoted && (
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                )}
              </div>

              {showPercentage && option.percentage !== undefined && (
                <div className="relative h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!poll.hasVoted && !isEnded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {poll.totalVotes} votes
            </span>
            {poll.allowMultiple && (
              <span className="text-blue-400">
                Select up to {poll.maxChoices}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleVote}
            disabled={voting || selectedOptions.length === 0}
          >
            {voting ? 'Voting...' : 'Vote'}
          </Button>
        </div>
      )}

      {(poll.hasVoted || isEnded) && poll.canSeeResults && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              {poll.totalVotes} total votes
            </span>
            {isEnded && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Clock className="w-4 h-4" />
                Poll ended
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-400">{error}</div>
      )}

      {poll.endsAt && !isEnded && (
        <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            Ends {new Date(poll.endsAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}
