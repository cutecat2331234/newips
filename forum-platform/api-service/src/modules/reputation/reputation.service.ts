import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReputationService {
  constructor(private prisma: PrismaService) {}

  // Default reputation rules
  private readonly defaultRules = [
    { action: 'topic_created', points: 5, description: 'Creating a topic', dailyLimit: 50 },
    { action: 'reply_created', points: 2, description: 'Posting a reply', dailyLimit: 100 },
    { action: 'reply_liked', points: 10, description: 'Getting a like on your reply', dailyLimit: 500 },
    { action: 'topic_liked', points: 10, description: 'Getting a like on your topic', dailyLimit: 500 },
    { action: 'best_answer', points: 25, description: 'Having your answer marked as best', dailyLimit: 100 },
    { action: 'helpful_answer', points: 15, description: 'Receiving a helpful vote', dailyLimit: 200 },
    { action: 'topic_viewed', points: 0, description: 'Topic viewed by others', dailyLimit: 1000 },
    { action: 'profile_viewed', points: 1, description: 'Profile viewed', dailyLimit: 50 },
    { action: 'follower_gained', points: 5, description: 'Gaining a follower', dailyLimit: 50 },
    { action: 'badge_earned', points: 10, description: 'Earning a badge', dailyLimit: null },
  ];

  async initializeRules() {
    for (const rule of this.defaultRules) {
      await this.prisma.reputationRule.upsert({
        where: { action: rule.action },
        update: rule,
        create: {
          action: rule.action,
          points: rule.points,
          description: rule.description,
          dailyLimit: rule.dailyLimit,
        },
      });
    }
  }

  async addReputation(userId: string, action: string, reason?: string) {
    const rule = await this.prisma.reputationRule.findUnique({
      where: { action },
    });

    if (!rule || rule.points === 0) {
      return null;
    }

    // Check daily limit
    if (rule.dailyLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = await this.prisma.reputation.count({
        where: {
          userId,
          reason: action,
          createdAt: { gte: today },
        },
      });

      if (todayCount >= rule.dailyLimit) {
        return null;
      }
    }

    // Add reputation
    const reputation = await this.prisma.reputation.create({
      data: {
        userId,
        amount: rule.points,
        reason: reason || rule.description,
      },
    });

    return reputation;
  }

  async getUserReputation(userId: string) {
    const aggregations = await this.prisma.reputation.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: true,
    });

    return {
      total: aggregations._sum.amount || 0,
      count: aggregations._count,
    };
  }

  async getReputationHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.reputation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reputation.count({ where: { userId } }),
    ]);

    return {
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReputationLeaderboard(limit = 10) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      include: {
        reputation: {
          select: { amount: true },
        },
      },
    });

    const leaderboard = users
      .map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        reputation: user.reputation.reduce((sum, r) => sum + r.amount, 0),
      }))
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, limit);

    return leaderboard;
  }

  async getRank(userId: string) {
    const userRep = await this.getUserReputation(userId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) return null;

    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      include: {
        reputation: {
          select: { amount: true },
        },
      },
    });

    const sortedUsers = users
      .map(u => ({
        id: u.id,
        reputation: u.reputation.reduce((sum, r) => sum + r.amount, 0),
      }))
      .sort((a, b) => b.reputation - a.reputation);

    const rank = sortedUsers.findIndex(u => u.id === userId) + 1;
    const total = sortedUsers.length;

    return {
      rank,
      total,
      reputation: userRep.total,
    };
  }

  async checkAndAwardBadges(userId: string) {
    const userRep = await this.getUserReputation(userId);
    const earnedBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
    });

    const earnedBadgeIds = earnedBadges.map(ub => ub.badgeId);

    const badges = await this.prisma.badgeRule.findMany({
      where: {
        badgeId: { notIn: earnedBadgeIds },
      },
      include: { badge: true },
    });

    const awarded = [];

    for (const badgeRule of badges) {
      const criteria = JSON.parse(badgeRule.criteria);

      let shouldAward = false;

      // Check reputation threshold
      if (criteria.minReputation && userRep.total >= criteria.minReputation) {
        shouldAward = true;
      }

      // Check topic count
      if (criteria.minTopics) {
        const topicCount = await this.prisma.topic.count({
          where: { authorId: userId },
        });
        if (topicCount < criteria.minTopics) {
          shouldAward = false;
        }
      }

      // Check reply count
      if (criteria.minReplies) {
        const replyCount = await this.prisma.post.count({
          where: { authorId: userId },
        });
        if (replyCount < criteria.minReplies) {
          shouldAward = false;
        }
      }

      // Check follower count
      if (criteria.minFollowers) {
        const followerCount = await this.prisma.follow.count({
          where: { followingId: userId },
        });
        if (followerCount < criteria.minFollowers) {
          shouldAward = false;
        }
      }

      if (shouldAward) {
        await this.prisma.userBadge.create({
          data: {
            userId,
            badgeId: badgeRule.badgeId,
          },
        });
        awarded.push(badgeRule.badge);
      }
    }

    return awarded;
  }
}
