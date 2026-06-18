'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, MapPin, Users, ArrowRight, CalendarDays } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: {
    id: string;
    displayName: string;
  };
  participantCount: number;
  maxParticipants: number;
  isOnline: boolean;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Monthly Tech Meetup',
    description: 'Join us for our monthly tech meetup where developers gather to share knowledge and network with peers.',
    date: '2024-02-15',
    time: '18:00 - 21:00',
    location: 'Tech Hub Center, San Francisco',
    organizer: { id: '1', displayName: 'Tech Community' },
    participantCount: 45,
    maxParticipants: 100,
    isOnline: false,
  },
  {
    id: '2',
    title: 'Web Development Workshop',
    description: 'Learn the latest trends in web development including React 19 features and Next.js best practices.',
    date: '2024-02-20',
    time: '10:00 - 14:00',
    location: 'Online via Zoom',
    organizer: { id: '2', displayName: 'Dev Academy' },
    participantCount: 89,
    maxParticipants: 150,
    isOnline: true,
  },
  {
    id: '3',
    title: 'AI and Machine Learning Conference',
    description: 'Explore cutting-edge AI technologies and network with industry experts.',
    date: '2024-03-01',
    time: '09:00 - 17:00',
    location: 'Convention Center, Los Angeles',
    organizer: { id: '3', displayName: 'AI Innovators' },
    participantCount: 200,
    maxParticipants: 500,
    isOnline: false,
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDayOfMonth = (dateString: string) => {
    return new Date(dateString).getDate();
  };

  const getMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short' });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upcoming Events</h1>
          <p className="text-slate-400">Discover and join community events</p>
        </div>

        {loading ? (
          <div className="animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
                <div className="flex gap-6">
                  <div className="w-16 h-20 bg-slate-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      {[1, 2].map((j) => (
                        <div key={j} className="h-4 bg-slate-700 rounded"></div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <article
                key={event.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors"
              >
                <div className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white">
                        <span className="text-2xl font-bold">{getDayOfMonth(event.date)}</span>
                        <span className="text-sm">{getMonth(event.date)}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
                          {event.title}
                        </h2>
                        {event.isOnline && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Online
                          </span>
                        )}
                      </div>

                      <p className="text-slate-400 mb-4">{event.description}</p>

                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-2 text-slate-400">
                          <Users className="w-4 h-4" />
                          {event.participantCount}/{event.maxParticipants}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-slate-500">
                          Organized by <span className="text-slate-300">{event.organizer.displayName}</span>
                        </p>
                        <Button variant="ghost" size="sm">
                          Join Event
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button variant="ghost">
            View All Events
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}