'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Flag,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  Ban,
  Award,
} from 'lucide-react';
import { isAuthenticated, getUser } from '@/lib/auth';

type AdminTab = 'overview' | 'users' | 'topics' | 'reports' | 'settings' | 'analytics';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTopics: number;
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  isAdmin: boolean;
  reputation: number;
}

interface Report {
  id: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
  reporter: { username: string };
  post?: { id: string; content: string };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user?.isAdmin) {
        fetchData();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
        case 'analytics':
          const statsRes = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
          break;
        case 'users':
          const usersRes = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            setUsers(usersData.users);
          }
          break;
        case 'reports':
          const reportsRes = await fetch('/api/admin/reports', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          });
          if (reportsRes.ok) {
            const reportsData = await reportsRes.json();
            setReports(reportsData.reports);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const handleReportAction = async (reportId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'topics', label: 'Topics', icon: FileText },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const user = getUser();
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access Required</h1>
          <p className="text-slate-400">This area is restricted to administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-500" />
            Admin Dashboard
          </h1>
          <p className="text-slate-400">Manage your community from one place</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-blue-500" />
                      <span className="text-green-400 text-sm">+12%</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
                    <div className="text-slate-400">Total Users</div>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="w-8 h-8 text-green-500" />
                      <span className="text-green-400 text-sm">+8%</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalTopics}</div>
                    <div className="text-slate-400">Total Topics</div>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <MessageSquare className="w-8 h-8 text-purple-500" />
                      <span className="text-green-400 text-sm">+15%</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalPosts}</div>
                    <div className="text-slate-400">Total Posts</div>
                  </div>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Flag className="w-8 h-8 text-red-500" />
                      <span className="text-red-400 text-sm">{stats.pendingReports}</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stats.totalReports}</div>
                    <div className="text-slate-400">Total Reports</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {['New user registered', 'Topic approved', 'Report resolved', 'Badge awarded'].map((activity, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-slate-300">{activity}</span>
                          <span className="text-slate-500 text-sm ml-auto">{i + 1}h ago</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="secondary" className="justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                      <Button variant="secondary" className="justify-start">
                        <Flag className="w-4 h-4 mr-2" />
                        Review Reports
                      </Button>
                      <Button variant="secondary" className="justify-start">
                        <Award className="w-4 h-4 mr-2" />
                        Award Badges
                      </Button>
                      <Button variant="secondary" className="justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <div className="w-64">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="bg-slate-700"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">User</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Reputation</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Joined</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-700/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                {user.displayName?.charAt(0) || '?'}
                              </div>
                              <span className="text-white">{user.displayName || user.username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400">{user.email}</td>
                          <td className="px-4 py-3 text-yellow-400">{user.reputation}</td>
                          <td className="px-4 py-3 text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.isActive
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {user.isActive ? 'Active' : 'Banned'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-slate-400 hover:text-blue-400" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-green-400" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUserAction(user.id, user.isActive ? 'ban' : 'unban')}
                                className="p-2 text-slate-400 hover:text-red-400"
                                title={user.isActive ? 'Ban' : 'Unban'}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-white">Content Reports</h3>
                </div>

                <div className="divide-y divide-slate-700">
                  {reports.length === 0 ? (
                    <div className="p-8 text-center">
                      <Flag className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                      <p className="text-slate-400">No pending reports</p>
                    </div>
                  ) : (
                    reports.map((report) => (
                      <div key={report.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                              {report.reason}
                            </span>
                            <p className="text-sm text-slate-400 mt-2">
                              Reported by {report.reporter.username} • {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleReportAction(report.id, 'dismiss')}>
                              <X className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleReportAction(report.id, 'resolve')}>
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {report.post && (
                          <div className="p-3 bg-slate-700/50 rounded-lg">
                            <p className="text-slate-300 text-sm">{report.post.content.slice(0, 200)}...</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">System Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">General Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Forum Name</p>
                          <p className="text-sm text-slate-400">The name of your forum</p>
                        </div>
                        <Input defaultValue="ForumHub" className="w-64" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Require Email Verification</p>
                          <p className="text-sm text-slate-400">Users must verify their email</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                      {[65, 45, 78, 52, 90, 70, 85].map((value, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-500/20 rounded-t"
                          style={{ height: `${value}%` }}
                        >
                          <div
                            className="bg-blue-500 rounded-t w-full"
                            style={{ height: `${value}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Engagement</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Topics Created</span>
                          <span className="text-white">{stats.totalTopics}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '70%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Posts Created</span>
                          <span className="text-white">{stats.totalPosts}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Active Users</span>
                          <span className="text-white">{stats.activeUsers}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
