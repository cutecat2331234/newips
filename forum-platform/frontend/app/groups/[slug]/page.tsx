'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Users,
  MessageSquare,
  Settings,
  Lock,
  Globe,
  Check,
  Clock,
  Crown,
  Shield,
  Plus,
  ArrowLeft,
  MoreVertical,
  UserPlus,
  UserMinus,
  Edit,
} from 'lucide-react';
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
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
  }>;
  moderators: any[];
  _count: {
    members: number;
    topics: number;
  };
  isMember: boolean;
  membership?: any;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  replyCount: number;
  viewCount: number;
}

export default function GroupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'topics' | 'members' | 'settings'>('topics');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchGroup();
    fetchTopics();
  }, [slug]);

  const fetchGroup = async () => {
    try {
      let headers: any = {};
      if (isAuthenticated()) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }
      const response = await fetch(`/api/groups/${slug}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setGroup(data);
      }
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    if (!group) return;
    try {
      const response = await fetch(`/api/groups/${slug}/topics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchPendingMembers = async () => {
    if (!group) return;
    try {
      const response = await fetch(`/api/groups/${slug}/members/pending`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch pending members:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${slug}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchGroup();
      }
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${slug}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchGroup();
      }
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopic.title || !newTopic.content) return;

    setCreating(true);
    try {
      const response = await fetch(`/api/groups/${slug}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newTopic),
      });
      if (response.ok) {
        setShowNewTopicModal(false);
        setNewTopic({ title: '', content: '' });
        fetchTopics();
      }
    } catch (error) {
      console.error('Failed to create topic:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleApproveMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/groups/${slug}/members/${userId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchPendingMembers();
        fetchGroup();
      }
    } catch (error) {
      console.error('Failed to approve member:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'MODERATOR':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-slate-800 rounded-xl mb-6"></div>
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Group not found</h1>
          <Button onClick={() => router.push('/groups')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  const currentUser = getUser();
  const isOwner = currentUser?.id === group.owner.id;
  const isModerator = group.membership?.role === 'MODERATOR' || isOwner;
  const canManage = isOwner || isModerator;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600 relative">
        {group.coverImage && (
          <img src={group.coverImage} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="max-w-6xl mx-auto px-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/groups')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 -mt-16">
        {/* Group Header */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-24 h-24 bg-slate-700 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 border-4 border-slate-800">
              {group.icon || '👥'}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                {group.isPrivate ? (
                  <Lock className="w-5 h-5 text-slate-400" />
                ) : (
                  <Globe className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <p className="text-slate-400 mb-4">
                Created by <span className="text-white">{group.owner.displayName}</span>
              </p>

              {group.description && (
                <p className="text-slate-300 mb-4">{group.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group._count.members} members
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {group._count.topics} topics
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isAuthenticated() && (
                <>
                  {group.isMember ? (
                    <>
                      {canManage && (
                        <Button variant="secondary" onClick={() => setActiveTab('settings')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      )}
                      {group.membership?.status === 'APPROVED' && (
                        <Button onClick={() => setShowNewTopicModal(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          New Topic
                        </Button>
                      )}
                      {!isOwner && (
                        <Button variant="ghost" onClick={handleLeaveGroup}>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Leave Group
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button onClick={handleJoinGroup}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {group.isPrivate ? 'Request to Join' : 'Join Group'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
          {['topics', 'members', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab === 'topics' && 'Topics'}
              {tab === 'members' && `Members (${group._count.members})`}
              {tab === 'settings' && 'Settings'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'topics' && (
          <div className="space-y-4">
            {!group.isMember || group.membership?.status === 'PENDING' ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
                <Lock className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {group.membership?.status === 'PENDING' ? 'Request Pending' : 'Join to View Topics'}
                </h3>
                <p className="text-slate-400">
                  {group.membership?.status === 'PENDING'
                    ? 'Your request to join this group is pending approval.'
                    : 'You need to join this group to see and participate in topics.'}
                </p>
              </div>
            ) : topics.length === 0 ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-white mb-2">No topics yet</h3>
                <p className="text-slate-400 mb-4">Be the first to start a discussion!</p>
                <Button onClick={() => setShowNewTopicModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Topic
                </Button>
              </div>
            ) : (
              topics.map((topic) => (
                <div key={topic.id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors">
                  <a href={`/groups/${slug}/topics/${topic.slug}`} className="block">
                    <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors mb-2">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>by {topic.author.displayName}</span>
                      <span>•</span>
                      <span>{formatDate(topic.createdAt)}</span>
                      <span>•</span>
                      <span>{topic.replyCount} replies</span>
                      <span>•</span>
                      <span>{topic.viewCount} views</span>
                    </div>
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Pending Members */}
            {canManage && (
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Requests
                </h3>
                {pendingMembers.length === 0 ? (
                  <p className="text-slate-400">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.user.displayName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white">{member.user.displayName}</p>
                            <p className="text-sm text-slate-400">@{member.user.username}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleApproveMember(member.user.id)}>
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Members List */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {member.user.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <a href={`/users/${member.user.id}`} className="text-white hover:text-blue-400">
                            {member.user.displayName}
                          </a>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-slate-400">@{member.user.username}</p>
                      </div>
                    </div>
                    {canManage && member.role !== 'OWNER' && (
                      <button className="p-2 text-slate-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && canManage && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Group Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Group Name</label>
                <Input defaultValue={group.name} className="bg-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <Textarea defaultValue={group.description || ''} className="bg-slate-700" rows={3} />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white">Private Group</p>
                  <p className="text-sm text-slate-400">Only approved members can see content</p>
                </div>
                <input type="checkbox" defaultChecked={group.isPrivate} className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white">Require Approval</p>
                  <p className="text-sm text-slate-400">Members need to be approved to join</p>
                </div>
                <input type="checkbox" defaultChecked={group.requiresApproval} className="w-5 h-5" />
              </div>
              <div className="pt-4">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Topic Modal */}
      {showNewTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-600 w-full max-w-lg">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Create Topic</h2>
              <button onClick={() => setShowNewTopicModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <Input
                label="Title"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                placeholder="Topic title"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <Textarea
                label="Content"
                value={newTopic.content}
                onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                placeholder="Write your message..."
                rows={6}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowNewTopicModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTopic} disabled={creating || !newTopic.title || !newTopic.content}>
                {creating ? 'Creating...' : 'Create Topic'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
