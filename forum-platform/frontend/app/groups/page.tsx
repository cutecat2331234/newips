'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, Search, Plus, Lock, Globe, Check, Clock, Settings, Crown } from 'lucide-react';
import { isAuthenticated, getUser } from '@/lib/auth';

interface Group {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  icon?: string;
  isPrivate: boolean;
  requiresApproval: boolean;
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  _count: {
    members: number;
    topics: number;
  };
  isMember?: boolean;
  membership?: any;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private' | 'my'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'created'>('name');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    slug: '',
    description: '',
    isPrivate: false,
    requiresApproval: false,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [activeTab, sortBy]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: activeTab,
        sort: sortBy,
      });

      let headers: any = {};
      if (isAuthenticated()) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }

      const response = await fetch(`/api/groups?${params}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.slug) return;

    setCreating(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newGroup),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewGroup({ name: '', slug: '', description: '', isPrivate: false, requiresApproval: false });
        fetchGroups();
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (slug: string) => {
    try {
      const response = await fetch(`/api/groups/${slug}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchGroups();
      }
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async (slug: string) => {
    try {
      const response = await fetch(`/api/groups/${slug}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchGroups();
      }
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-500" />
              Groups
            </h1>
            <p className="text-slate-400">Join communities and connect with like-minded people</p>
          </div>
          {isAuthenticated() && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'public', 'private', 'my'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {tab === 'all' ? 'All Groups' : tab === 'my' ? 'My Groups' : tab === 'public' ? 'Public' : 'Private'}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups..."
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="members">Members</option>
                <option value="created">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden animate-pulse">
                <div className="h-32 bg-slate-700"></div>
                <div className="p-4">
                  <div className="h-6 bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h2 className="text-xl font-semibold text-white mb-2">No groups found</h2>
            <p className="text-slate-400 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Be the first to create a group!'}
            </p>
            {isAuthenticated() && !searchQuery && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Group
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
              >
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 relative">
                  {group.coverImage && (
                    <img src={group.coverImage} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {group.isPrivate && (
                      <span className="px-2 py-1 bg-black/50 rounded-full text-xs text-white flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    )}
                    {group.requiresApproval && (
                      <span className="px-2 py-1 bg-black/50 rounded-full text-xs text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Approval
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {/* Group Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                      {group.icon || '👥'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/groups/${group.slug}`}
                        className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                      >
                        {group.name}
                      </a>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        {group.owner.displayName}
                      </p>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-slate-400">
                      <Users className="w-4 h-4 inline mr-1" />
                      {group._count.members} members
                    </span>
                    <span className="text-slate-400">
                      {group._count.topics} topics
                    </span>
                  </div>

                  {/* Actions */}
                  {isAuthenticated() && (
                    <div className="flex gap-2">
                      {group.isMember ? (
                        <>
                          {group.membership?.status === 'APPROVED' ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              onClick={() => window.location.href = `/groups/${group.slug}`}
                            >
                              View Group
                            </Button>
                          ) : (
                            <Button variant="secondary" size="sm" className="flex-1" disabled>
                              <Clock className="w-4 h-4 mr-1" />
                              Pending
                            </Button>
                          )}
                          {group.membership?.role !== 'OWNER' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLeaveGroup(group.slug)}
                            >
                              Leave
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleJoinGroup(group.slug)}
                        >
                          {group.isPrivate ? 'Request to Join' : 'Join'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-600 w-full max-w-lg">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Create Group</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <Input
                label="Group Name"
                value={newGroup.name}
                onChange={(e) => {
                  setNewGroup({
                    ...newGroup,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  });
                }}
                placeholder="Enter group name"
                className="bg-slate-700/50 border-slate-600 text-white"
              />

              <Input
                label="URL Slug"
                value={newGroup.slug}
                onChange={(e) => setNewGroup({ ...newGroup, slug: e.target.value })}
                placeholder="group-url"
                className="bg-slate-700/50 border-slate-600 text-white"
              />

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What's this group about?"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newGroup.isPrivate}
                    onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                  />
                  <div>
                    <span className="text-white">Private Group</span>
                    <p className="text-xs text-slate-400">Only approved members can see content</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newGroup.requiresApproval}
                    onChange={(e) => setNewGroup({ ...newGroup, requiresApproval: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                  />
                  <div>
                    <span className="text-white">Require Approval</span>
                    <p className="text-xs text-slate-400">Members need to be approved to join</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={creating || !newGroup.name}>
                {creating ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
