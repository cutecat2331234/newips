import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: any;
  category: string;
}

@Injectable()
export class BadgeService {
  constructor(private prisma: PrismaService) {}

  // Define all 100+ badges organized by category
  private readonly badgeDefinitions: BadgeDefinition[] = [
    // === 入门成就 (Starter Badges) - 15个 ===
    { name: 'New Member', description: 'Joined the community', icon: '👋', color: '#4CAF50', criteria: { type: 'account_age', minDays: 0 }, category: 'starter' },
    { name: 'First Step', description: 'Created your first topic', icon: '🌟', color: '#FFC107', criteria: { type: 'topics_created', min: 1 }, category: 'starter' },
    { name: 'Social Butterfly', description: 'Posted your first reply', icon: '💬', color: '#2196F3', criteria: { type: 'replies_posted', min: 1 }, category: 'starter' },
    { name: 'Profile Complete', description: 'Added a profile photo', icon: '📸', color: '#9C27B0', criteria: { type: 'has_avatar' }, category: 'starter' },
    { name: 'Verified Email', description: 'Verified your email address', icon: '✉️', color: '#00BCD4', criteria: { type: 'email_verified' }, category: 'starter' },
    { name: 'Introduce Yourself', description: 'Created an introduction post', icon: '🙋', color: '#FF9800', criteria: { type: 'introduction_posted' }, category: 'starter' },
    { name: 'Getting Started', description: 'Read 10 topics', icon: '📖', color: '#795548', criteria: { type: 'topics_viewed', min: 10 }, category: 'starter' },
    { name: 'Curious Mind', description: 'Used search for the first time', icon: '🔍', color: '#607D8B', criteria: { type: 'searches_made', min: 1 }, category: 'starter' },
    { name: 'Bookmark Collector', description: 'Saved your first topic', icon: '🔖', color: '#E91E63', criteria: { type: 'bookmarks', min: 1 }, category: 'starter' },
    { name: 'Liker', description: 'Gave your first like', icon: '❤️', color: '#F44336', criteria: { type: 'likes_given', min: 1 }, category: 'starter' },
    { name: 'Popular', description: 'Received your first like', icon: '💖', color: '#E91E63', criteria: { type: 'likes_received', min: 1 }, category: 'starter' },
    { name: 'Follow Me', description: 'Got your first follower', icon: '👥', color: '#3F51B5', criteria: { type: 'followers', min: 1 }, category: 'starter' },
    { name: 'Networking', description: 'Followed your first user', icon: '🤝', color: '#009688', criteria: { type: 'following', min: 1 }, category: 'starter' },
    { name: 'Diverse Interests', description: 'Posted in 3 different categories', icon: '🎯', color: '#673AB7', criteria: { type: 'categories_posted', min: 3 }, category: 'starter' },
    { name: 'Early Bird', description: 'Joined in the first month', icon: '🐦', color: '#CDDC39', criteria: { type: 'early_member', month: 1 }, category: 'starter' },

    // === 创作成就 (Content Creator Badges) - 20个 ===
    { name: 'Prolific Writer', description: 'Created 10 topics', icon: '✍️', color: '#FF5722', criteria: { type: 'topics_created', min: 10 }, category: 'creator' },
    { name: 'Topic Machine', description: 'Created 50 topics', icon: '📝', color: '#FF9800', criteria: { type: 'topics_created', min: 50 }, category: 'creator' },
    { name: 'Content King', description: 'Created 100 topics', icon: '👑', color: '#FFD700', criteria: { type: 'topics_created', min: 100 }, category: 'creator' },
    { name: 'Topic Legend', description: 'Created 500 topics', icon: '🏆', color: '#FFA000', criteria: { type: 'topics_created', min: 500 }, category: 'creator' },
    { name: 'Superposter', description: 'Posted 50 replies', icon: '💭', color: '#03A9F4', criteria: { type: 'replies_posted', min: 50 }, category: 'creator' },
    { name: 'Reply Master', description: 'Posted 200 replies', icon: '🗣️', color: '#00BCD4', criteria: { type: 'replies_posted', min: 200 }, category: 'creator' },
    { name: 'Discussion Leader', description: 'Posted 500 replies', icon: '🎤', color: '#009688', criteria: { type: 'replies_posted', min: 500 }, category: 'creator' },
    { name: 'Reply Legend', description: 'Posted 1000 replies', icon: '🌟', color: '#8BC34A', criteria: { type: 'replies_posted', min: 1000 }, category: 'creator' },
    { name: 'Conversation Starter', description: 'Created 5 topics with 20+ replies', icon: '🔥', color: '#FF5722', criteria: { type: 'popular_topics', min: 5, replies: 20 }, category: 'creator' },
    { name: 'Trending Topic', description: 'Created 10 topics with 50+ replies', icon: '📈', color: '#E91E63', criteria: { type: 'popular_topics', min: 10, replies: 50 }, category: 'creator' },
    { name: 'Viral Content', description: 'Created a topic with 100+ replies', icon: '🦠', color: '#9C27B0', criteria: { type: 'single_topic_replies', min: 100 }, category: 'creator' },
    { name: 'Knowledge Base', description: 'Created 10 blog posts', icon: '📚', color: '#3F51B5', criteria: { type: 'blog_posts', min: 10 }, category: 'creator' },
    { name: 'Blogger Pro', description: 'Created 50 blog posts', icon: '✒️', color: '#673AB7', criteria: { type: 'blog_posts', min: 50 }, category: 'creator' },
    { name: 'Article Master', description: 'Created 100 blog posts', icon: '📰', color: '#2196F3', criteria: { type: 'blog_posts', min: 100 }, category: 'creator' },
    { name: 'Event Organizer', description: 'Created 5 events', icon: '📅', color: '#FF9800', criteria: { type: 'events_created', min: 5 }, category: 'creator' },
    { name: 'Community Builder', description: 'Created 10 events', icon: '🎉', color: '#FF5722', criteria: { type: 'events_created', min: 10 }, category: 'creator' },
    { name: 'Rich Content', description: 'Created 10 topics with images', icon: '🖼️', color: '#4CAF50', criteria: { type: 'topics_with_images', min: 10 }, category: 'creator' },
    { name: 'Media Master', description: 'Created 50 topics with images', icon: '📷', color: '#00BCD4', criteria: { type: 'topics_with_images', min: 50 }, category: 'creator' },
    { name: 'Poll Master', description: 'Created 10 polls', icon: '📊', color: '#9C27B0', criteria: { type: 'polls_created', min: 10 }, category: 'creator' },
    { name: 'Survey Says', description: 'Created 25 polls', icon: '📋', color: '#E91E63', criteria: { type: 'polls_created', min: 25 }, category: 'creator' },

    // === 互动成就 (Engagement Badges) - 20个 ===
    { name: 'Like Machine', description: 'Gave 100 likes', icon: '👍', color: '#F44336', criteria: { type: 'likes_given', min: 100 }, category: 'engagement' },
    { name: 'Generous', description: 'Gave 500 likes', icon: '🙏', color: '#E91E63', criteria: { type: 'likes_given', min: 500 }, category: 'engagement' },
    { name: 'Like Lord', description: 'Gave 1000 likes', icon: '💪', color: '#FF5722', criteria: { type: 'likes_given', min: 1000 }, category: 'engagement' },
    { name: 'Loved', description: 'Received 50 likes', icon: '🥰', color: '#FF4081', criteria: { type: 'likes_received', min: 50 }, category: 'engagement' },
    { name: 'Adored', description: 'Received 200 likes', icon: '😍', color: '#E91E63', criteria: { type: 'likes_received', min: 200 }, category: 'engagement' },
    { name: 'Cherished', description: 'Received 500 likes', icon: '💖', color: '#F06292', criteria: { type: 'likes_received', min: 500 }, category: 'engagement' },
    { name: 'Legendary', description: 'Received 1000 likes', icon: '💗', color: '#EC407A', criteria: { type: 'likes_received', min: 1000 }, category: 'engagement' },
    { name: 'Follower Fan', description: 'Got 10 followers', icon: '👨‍👩‍👧‍👦', color: '#9C27B0', criteria: { type: 'followers', min: 10 }, category: 'engagement' },
    { name: 'Popular Person', description: 'Got 50 followers', icon: '⭐', color: '#673AB7', criteria: { type: 'followers', min: 50 }, category: 'engagement' },
    { name: 'Influencer', description: 'Got 100 followers', icon: '🌟', color: '#3F51B5', criteria: { type: 'followers', min: 100 }, category: 'engagement' },
    { name: 'Social Star', description: 'Got 500 followers', icon: '✨', color: '#2196F3', criteria: { type: 'followers', min: 500 }, category: 'engagement' },
    { name: 'Celebrity', description: 'Got 1000 followers', icon: '🎭', color: '#00BCD4', criteria: { type: 'followers', min: 1000 }, category: 'engagement' },
    { name: 'Influencer Elite', description: 'Got 5000 followers', icon: '🌍', color: '#FF9800', criteria: { type: 'followers', min: 5000 }, category: 'engagement' },
    { name: 'Helpful', description: 'Best answer selected 5 times', icon: '🏅', color: '#FFD700', criteria: { type: 'best_answers', min: 5 }, category: 'engagement' },
    { name: 'Mentor', description: 'Best answer selected 20 times', icon: '🎓', color: '#FFA000', criteria: { type: 'best_answers', min: 20 }, category: 'engagement' },
    { name: 'Expert', description: 'Best answer selected 50 times', icon: '📜', color: '#FF8F00', criteria: { type: 'best_answers', min: 50 }, category: 'engagement' },
    { name: 'Guru', description: 'Best answer selected 100 times', icon: '🏆', color: '#FF6F00', criteria: { type: 'best_answers', min: 100 }, category: 'engagement' },
    { name: 'First Responder', description: 'Replied to 50 topics within 1 hour', icon: '⚡', color: '#FFEB3B', criteria: { type: 'quick_replies', min: 50 }, category: 'engagement' },
    { name: 'Night Owl', description: 'Posted between midnight and 6am 10 times', icon: '🦉', color: '#5C6BC0', criteria: { type: 'night_posts', min: 10 }, category: 'engagement' },
    { name: 'Early Bird', description: 'Posted between 5am and 8am 10 times', icon: '🐓', color: '#FFB300', criteria: { type: 'early_posts', min: 10 }, category: 'engagement' },

    // === 声望成就 (Reputation Badges) - 15个 ===
    { name: 'Rising Star', description: 'Reached 100 reputation', icon: '⭐', color: '#FFC107', criteria: { type: 'reputation', min: 100 }, category: 'reputation' },
    { name: 'Contributor', description: 'Reached 500 reputation', icon: '🌟', color: '#FFD700', criteria: { type: 'reputation', min: 500 }, category: 'reputation' },
    { name: 'Established', description: 'Reached 1000 reputation', icon: '💫', color: '#FFA000', criteria: { type: 'reputation', min: 1000 }, category: 'reputation' },
    { name: 'Veteran', description: 'Reached 5000 reputation', icon: '🎖️', color: '#FF8F00', criteria: { type: 'reputation', min: 5000 }, category: 'reputation' },
    { name: 'Elite', description: 'Reached 10000 reputation', icon: '🏅', color: '#FF6F00', criteria: { type: 'reputation', min: 10000 }, category: 'reputation' },
    { name: 'Champion', description: 'Reached 25000 reputation', icon: '🏆', color: '#FFD700', criteria: { type: 'reputation', min: 25000 }, category: 'reputation' },
    { name: 'Legend', description: 'Reached 50000 reputation', icon: '👑', color: '#FFC107', criteria: { type: 'reputation', min: 50000 }, category: 'reputation' },
    { name: 'Top 10%', description: 'Ranked in top 10% by reputation', icon: '🎯', color: '#E91E63', criteria: { type: 'reputation_rank', percent: 10 }, category: 'reputation' },
    { name: 'Top 5%', description: 'Ranked in top 5% by reputation', icon: '🎖️', color: '#9C27B0', criteria: { type: 'reputation_rank', percent: 5 }, category: 'reputation' },
    { name: 'Top 1%', description: 'Ranked in top 1% by reputation', icon: '🏆', color: '#673AB7', criteria: { type: 'reputation_rank', percent: 1 }, category: 'reputation' },
    { name: 'Leaderboard Top 100', description: 'Made it to the reputation leaderboard', icon: '📊', color: '#3F51B5', criteria: { type: 'on_leaderboard' }, category: 'reputation' },
    { name: 'Consistent', description: 'Earned 100 reputation for 6 consecutive months', icon: '📈', color: '#2196F3', criteria: { type: 'consistent_reputation', months: 6, monthlyRep: 100 }, category: 'reputation' },
    { name: 'Reliable', description: 'Maintained positive reputation for a year', icon: '💎', color: '#00BCD4', criteria: { type: 'year_positive_reputation' }, category: 'reputation' },
    { name: 'Top Contributor', description: 'Monthly reputation top 10 three times', icon: '🏅', color: '#FF9800', criteria: { type: 'monthly_top_10', times: 3 }, category: 'reputation' },
    { name: 'All-Star', description: 'Earned reputation in all categories', icon: '🌠', color: '#FF5722', criteria: { type: 'all_reputation_categories' }, category: 'reputation' },

    // === 社区成就 (Community Badges) - 15个 ===
    { name: 'Welcomer', description: 'Sent 10 welcome messages', icon: '👋', color: '#4CAF50', criteria: { type: 'welcome_messages', min: 10 }, category: 'community' },
    { name: 'Patrol', description: 'Reported 5 pieces of content', icon: '👮', color: '#2196F3', criteria: { type: 'reports_made', min: 5 }, category: 'community' },
    { name: 'Guardian', description: 'Reported 20 pieces of content', icon: '🛡️', color: '#3F51B5', criteria: { type: 'reports_made', min: 20 }, category: 'community' },
    { name: 'Quality Control', description: 'Had 10 reports validated', icon: '✅', color: '#009688', criteria: { type: 'valid_reports', min: 10 }, category: 'community' },
    { name: 'Diplomat', description: 'Successfully resolved 5 disputes', icon: '🕊️', color: '#00BCD4', criteria: { type: 'disputes_resolved', min: 5 }, category: 'community' },
    { name: 'Mediator', description: 'Successfully resolved 20 disputes', icon: '⚖️', color: '#2196F3', criteria: { type: 'disputes_resolved', min: 20 }, category: 'community' },
    { name: 'Friendly', description: 'Sent 50 private messages', icon: '💬', color: '#9C27B0', criteria: { type: 'messages_sent', min: 50 }, category: 'community' },
    { name: 'Social Hub', description: 'Sent 200 private messages', icon: '💭', color: '#673AB7', criteria: { type: 'messages_sent', min: 200 }, category: 'community' },
    { name: 'Networker', description: 'Started 20 conversations', icon: '🔗', color: '#E91E63', criteria: { type: 'conversations_started', min: 20 }, category: 'community' },
    { name: 'Organizer', description: 'Created 5 groups', icon: '👥', color: '#FF5722', criteria: { type: 'groups_created', min: 5 }, category: 'community' },
    { name: 'Group Leader', description: 'Created 10 groups with 50+ members each', icon: '📢', color: '#FF9800', criteria: { type: 'successful_groups', min: 10 }, category: 'community' },
    { name: 'Event Attendee', description: 'Attended 10 events', icon: '🎟️', color: '#FFB300', criteria: { type: 'events_attended', min: 10 }, category: 'community' },
    { name: 'Event Sponsor', description: 'Sponsored 5 events', icon: '🎁', color: '#E91E63', criteria: { type: 'events_sponsored', min: 5 }, category: 'community' },
    { name: 'Translator', description: 'Submitted 20 translations', icon: '🌍', color: '#009688', criteria: { type: 'translations', min: 20 }, category: 'community' },
    { name: 'Multilingual', description: 'Translated content to 5 languages', icon: '🗣️', color: '#00BCD4', criteria: { type: 'languages_translated', min: 5 }, category: 'community' },

    // === 特殊成就 (Special Badges) - 10个 ===
    { name: 'Anniversary 1 Year', description: 'Member for 1 year', icon: '🎂', color: '#FF5722', criteria: { type: 'membership_years', min: 1 }, category: 'special' },
    { name: 'Anniversary 2 Years', description: 'Member for 2 years', icon: '🎂', color: '#E91E63', criteria: { type: 'membership_years', min: 2 }, category: 'special' },
    { name: 'Anniversary 5 Years', description: 'Member for 5 years', icon: '🎂', color: '#9C27B0', criteria: { type: 'membership_years', min: 5 }, category: 'special' },
    { name: 'Anniversary 10 Years', description: 'Member for 10 years', icon: '🎂', color: '#673AB7', criteria: { type: 'membership_years', min: 10 }, category: 'special' },
    { name: 'Birthday', description: 'Happy birthday! (Birthday set)', icon: '🎈', color: '#FF4081', criteria: { type: 'birthday_set' }, category: 'special' },
    { name: 'Verified', description: 'Verified account', icon: '✓', color: '#2196F3', criteria: { type: 'verified' }, category: 'special' },
    { name: 'Staff', description: 'Forum staff member', icon: '⭐', color: '#FF5722', criteria: { type: 'staff_member' }, category: 'special' },
    { name: 'Moderator', description: 'Community moderator', icon: '🔧', color: '#4CAF50', criteria: { type: 'moderator' }, category: 'special' },
    { name: 'Administrator', description: 'Forum administrator', icon: '⚙️', color: '#F44336', criteria: { type: 'admin' }, category: 'special' },
    { name: 'Founder', description: 'Forum founder', icon: '🚀', color: '#FFD700', criteria: { type: 'founder' }, category: 'special' },

    // === 稀有成就 (Rare Badges) - 5个 ===
    { name: 'Easter Egg', description: 'Found a hidden easter egg', icon: '🥚', color: '#8BC34A', criteria: { type: 'easter_egg_found' }, category: 'rare' },
    { name: 'Bug Hunter', description: 'Reported 10 verified bugs', icon: '🐛', color: '#795548', criteria: { type: 'bugs_reported', min: 10 }, category: 'rare' },
    { name: 'Feature Finder', description: 'Requested 10 implemented features', icon: '💡', color: '#FFEB3B', criteria: { type: 'features_requested', min: 10 }, category: 'rare' },
    { name: 'Secret Santa', description: 'Participated in Secret Santa event', icon: '🎅', color: '#F44336', criteria: { type: 'secret_santa' }, category: 'rare' },
    { name: 'Spotlight', description: 'Featured in community spotlight', icon: '🎯', color: '#9C27B0', criteria: { type: 'spotlighted' }, category: 'rare' },

    // === 稀有/隐藏成就 (Epic/Hidden Badges) - 5个 ===
    { name: 'Perfect Score', description: 'Got 100% on a community quiz', icon: '💯', color: '#FF5722', criteria: { type: 'quiz_perfect_score' }, category: 'epic' },
    { name: 'Marathon', description: 'Posted every day for 30 consecutive days', icon: '🏃', color: '#FF9800', criteria: { type: 'streak_30' }, category: 'epic' },
    { name: 'Century', description: 'Posted 100 days in a row', icon: '💯', color: '#E91E63', criteria: { type: 'streak_100' }, category: 'epic' },
    { name: 'Philosopher', description: 'Created a topic with 1000 words', icon: '📜', color: '#673AB7', criteria: { type: 'long_topic', minWords: 1000 }, category: 'epic' },
    { name: 'Time Traveler', description: 'Posted at exactly midnight on new year', icon: '⏰', color: '#3F51B5', criteria: { type: 'new_year_post' }, category: 'epic' },
  ];

  async initializeBadges() {
    for (const badgeDef of this.badgeDefinitions) {
      const badge = await this.prisma.badge.upsert({
        where: { name: badgeDef.name },
        update: {
          description: badgeDef.description,
          icon: badgeDef.icon,
          color: badgeDef.color,
        },
        create: {
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          color: badgeDef.color,
        },
      });

      // Create badge rule
      await this.prisma.badgeRule.upsert({
        where: {
          id: badge.id,
        },
        update: {
          criteria: JSON.stringify(badgeDef.criteria),
          description: badgeDef.description,
        },
        create: {
          badgeId: badge.id,
          criteria: JSON.stringify(badgeDef.criteria),
          description: badgeDef.description,
        },
      });
    }
  }

  async getAllBadges() {
    return this.prisma.badge.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getUserBadges(userId: string) {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map(ub => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));
  }

  async awardBadge(userId: string, badgeName: string) {
    const badge = await this.prisma.badge.findUnique({
      where: { name: badgeName },
    });

    if (!badge) {
      throw new Error('Badge not found');
    }

    const existing = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) {
      return null; // Already has badge
    }

    return this.prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
      include: {
        badge: true,
      },
    });
  }

  async getBadgeStats() {
    const totalBadges = this.badgeDefinitions.length;
    const badgesByCategory = this.badgeDefinitions.reduce((acc, badge) => {
      acc[badge.category] = (acc[badge.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAwarded = await this.prisma.userBadge.count();
    const uniqueUsers = await this.prisma.userBadge.groupBy({
      by: ['userId'],
    });

    return {
      totalBadges,
      badgesByCategory,
      totalAwarded,
      usersWithBadges: uniqueUsers.length,
    };
  }

  async getCategoryBadges(category: string) {
    const badges = await this.prisma.badge.findMany();
    const categoryBadgeNames = this.badgeDefinitions
      .filter(b => b.category === category)
      .map(b => b.name);

    return badges.filter(b => categoryBadgeNames.includes(b.name));
  }
}
