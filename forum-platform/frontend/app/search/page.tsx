'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  Filter,
  MessageSquare,
  Users,
  Calendar,
  Tag,
  Clock,
  Eye,
  ThumbsUp,
  X,
  ChevronDown,
  ChevronUp,
  SortAsc,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'topic' | 'user' | 'post' | 'group';
  title: string;
  excerpt: string;
  url: string;
  author?: {
    id: string;
    username: string;
    displayName: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  createdAt: string;
  stats?: {
    replies?: number;
    views?: number;
    likes?: number;
    members?: number;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'topic' | 'user' | 'post' | 'group',
    category: '',
    dateRange: 'all' as 'all' | 'day' | 'week' | 'month' | 'year',
    sortBy: 'relevance' as 'relevance' | 'date' | 'popularity',
    minLikes: 0,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Fetch search suggestions
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      // Mock suggestions
      setSuggestions([
        'react hooks',
        'javascript',
        'typescript',
        'next.js',
        'web development',
      ]);
    };
    fetchSuggestions();
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({ q: query });
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.dateRange !== 'all') params.append('date', filters.dateRange);
      params.append('sort', filters.sortBy);

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'topic':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'user':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'post':
        return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'group':
        return <Users className="w-5 h-5 text-orange-400" />;
      default:
        return <Search className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-400" />
            Search
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, users, groups..."
                className="w-full pl-12 pr-32 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !searched && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch();
                    }}
                    className="w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-slate-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="topic">Topics</option>
                    <option value="user">Users</option>
                    <option value="post">Posts</option>
                    <option value="group">Groups</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="day">Past 24 Hours</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="year">Past Year</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Most Recent</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                  <input
                    type="text"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    placeholder="Filter by category"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between">
                <button
                  onClick={() => setFilters({
                    type: 'all',
                    category: '',
                    dateRange: 'all',
                    sortBy: 'relevance',
                    minLikes: 0,
                  })}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Reset Filters
                </button>
                <Button onClick={handleSearch}>Apply Filters</Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {searched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400">
                {results.length} results{query && ` for "${query}"`}
              </p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4 animate-pulse">
                    <div className="h-6 bg-slate-700 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
                <p className="text-slate-400">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <a
                    key={result.id}
                    href={result.url}
                    className="block bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="mt-1">{getResultIcon(result.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400 capitalize">
                            {result.type}
                          </span>
                          {result.category && (
                            <span className="text-xs text-slate-500">
                              in {result.category.name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                          {result.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {result.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {result.author && (
                        <span>by {result.author.displayName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(result.createdAt)}
                      </span>
                      {result.stats?.replies !== undefined && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {result.stats.replies}
                        </span>
                      )}
                      {result.stats?.views !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {result.stats.views}
                        </span>
                      )}
                      {result.stats?.likes !== undefined && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {result.stats.likes}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
