'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Trophy, Star, Lock, Award, TrendingUp, Clock } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: string;
}

interface BadgeCategory {
  name: string;
  displayName: string;
  badges: Badge[];
  total: number;
  earned: number;
}

export default function AchievementsPage() {
  const [categories, setCategories] = useState<BadgeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges');
      if (response.ok) {
        const badges = await response.json();
        
        // Group badges by category
        const groupedBadges: Record<string, Badge[]> = {
          starter: [],
          creator: [],
          engagement: [],
          reputation: [],
          community: [],
          special: [],
          rare: [],
          epic: [],
        };

        badges.forEach((badge: Badge) => {
          // Assign to category based on name/description
          const name = badge.name.toLowerCase();
          if (name.includes('new') || name.includes('first') || name.includes('starter')) {
            groupedBadges.starter.push(badge);
          } else if (name.includes('topic') || name.includes('post') || name.includes('blog') || name.includes('content')) {
            groupedBadges.creator.push(badge);
          } else if (name.includes('like') || name.includes('follower') || name.includes('reply')) {
            groupedBadges.engagement.push(badge);
          } else if (name.includes('reputation') || name.includes('rank') || name.includes('star')) {
            groupedBadges.reputation.push(badge);
          } else if (name.includes('community') || name.includes('event') || name.includes('group')) {
            groupedBadges.community.push(badge);
          } else if (name.includes('year') || name.includes('anniversary') || name.includes('special')) {
            groupedBadges.special.push(badge);
          } else if (name.includes('rare') || name.includes('hidden') || name.includes('secret')) {
            groupedBadges.rare.push(badge);
          } else {
            groupedBadges.epic.push(badge);
          }
        });

        const categoryData: BadgeCategory[] = Object.entries(groupedBadges)
          .filter(([_, badges]) => badges.length > 0)
          .map(([key, categoryBadges]) => ({
            name: key,
            displayName: formatCategoryName(key),
            badges: categoryBadges,
            total: categoryBadges.length,
            earned: 0, // Would need to fetch from user badges
          }));

        setCategories(categoryData);
        if (categoryData.length > 0) {
          setSelectedCategory(categoryData[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCategoryName = (name: string) => {
    const names: Record<string, string> = {
      starter: 'Starter',
      creator: 'Content Creator',
      engagement: 'Engagement',
      reputation: 'Reputation',
      community: 'Community',
      special: 'Special',
      rare: 'Rare',
      epic: 'Epic',
    };
    return names[name] || name;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      starter: <Star className="w-5 h-5" />,
      creator: <TrendingUp className="w-5 h-5" />,
      engagement: <Trophy className="w-5 h-5" />,
      reputation: <Award className="w-5 h-5" />,
      community: <Star className="w-5 h-5" />,
      special: <Award className="w-5 h-5" />,
      rare: <Trophy className="w-5 h-5" />,
      epic: <Star className="w-5 h-5" />,
    };
    return icons[category] || <Award className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      starter: 'text-green-400',
      creator: 'text-orange-400',
      engagement: 'text-blue-400',
      reputation: 'text-yellow-400',
      community: 'text-purple-400',
      special: 'text-pink-400',
      rare: 'text-cyan-400',
      epic: 'text-red-400',
    };
    return colors[category] || 'text-gray-400';
  };

  const selectedCategoryData = categories.find(c => c.name === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-slate-400">
            Earn badges and achievements by participating in the community
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-20 bg-slate-800 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span className={getCategoryColor(category.name)}>
                    {getCategoryIcon(category.name)}
                  </span>
                  <span>{category.displayName}</span>
                  <span className="text-xs opacity-75">
                    ({category.earned}/{category.total})
                  </span>
                </button>
              ))}
            </div>

            {/* Badges Grid */}
            {selectedCategoryData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCategoryData.badges.map((badge) => {
                  const isEarned = !!badge.earnedAt;
                  return (
                    <div
                      key={badge.id}
                      className={`relative p-6 rounded-xl border transition-all ${
                        isEarned
                          ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                          : 'bg-slate-800/50 border-slate-700/50 opacity-60'
                      }`}
                    >
                      {!isEarned && (
                        <div className="absolute top-4 right-4">
                          <Lock className="w-4 h-4 text-slate-500" />
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                          style={{
                            backgroundColor: isEarned ? `${badge.color}20` : '#1e293b',
                            border: isEarned ? `2px solid ${badge.color}` : '2px solid #334155',
                          }}
                        >
                          {isEarned ? badge.icon : '?'}
                        </div>

                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            isEarned ? 'text-white' : 'text-slate-400'
                          }`}>
                            {badge.name}
                          </h3>
                          <p className="text-sm text-slate-400 mb-2">
                            {badge.description}
                          </p>
                          {isEarned && badge.earnedAt && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Earned {new Date(badge.earnedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {categories.reduce((sum, c) => sum + c.total, 0)}
                </div>
                <div className="text-sm text-slate-400">Total Badges</div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {categories.reduce((sum, c) => sum + c.earned, 0)}
                </div>
                <div className="text-sm text-slate-400">Earned</div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {Math.round(
                    (categories.reduce((sum, c) => sum + c.earned, 0) /
                      Math.max(categories.reduce((sum, c) => sum + c.total, 0), 1)) *
                      100
                  )}%
                </div>
                <div className="text-sm text-slate-400">Complete</div>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-slate-400">Categories</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
