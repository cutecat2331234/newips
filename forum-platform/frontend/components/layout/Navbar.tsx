'use client';

import { useState } from 'react';
import { logout, getUser, isAuthenticated } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Search, Bell, User, Menu, X, MessageCircle } from 'lucide-react';
import { User as UserType } from '@/lib/api';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = getUser();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">ForumHub</span>
            </a>

            <div className="hidden md:flex items-center gap-1">
              <a href="/" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                Home
              </a>
              <a href="/forums/categories/general" className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                Forums
              </a>
              <a href="/blogs" className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                Blogs
              </a>
              <a href="/events" className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                Events
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search forums..."
                className="w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {authenticated && (
              <>
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                    <span className="text-sm text-slate-300 hidden sm:block">{user?.displayName}</span>
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      <a href={`/users/${user?.id}`} className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        Profile
                      </a>
                      <a href="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        Settings
                      </a>
                      <hr className="my-2 border-slate-600" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors">
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!authenticated && (
              <div className="flex items-center gap-2">
                <a href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                  Sign In
                </a>
                <Button size="sm">Sign Up</Button>
              </div>
            )}

            <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <div className="flex flex-col gap-2">
              <a href="/" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                Home
              </a>
              <a href="/forums/categories/general" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                Forums
              </a>
              <a href="/blogs" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                Blogs
              </a>
              <a href="/events" className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                Events
              </a>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search forums..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}