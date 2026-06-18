import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface ActivityData {
  userId: string;
  type: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(data: ActivityData) {
    const activity = await this.prisma.activity.create({
      data: {
        userId: data.userId,
        type: data.type,
        targetType: data.targetType,
        targetId: data.targetId,
        metadata: data.metadata,
      },
    });

    return activity;
  }

  async logTopicCreated(userId: string, topic: any) {
    return this.logActivity({
      userId,
      type: 'TOPIC_CREATED',
      targetType: 'topic',
      targetId: topic.id,
      metadata: {
        title: topic.title,
        slug: topic.slug,
        categoryName: topic.category?.name,
      },
    });
  }

  async logReplyCreated(userId: string, post: any, topic: any) {
    return this.logActivity({
      userId,
      type: 'REPLY_CREATED',
      targetType: 'post',
      targetId: post.id,
      metadata: {
        topicTitle: topic.title,
        topicSlug: topic.slug,
      },
    });
  }

  async logFollow(userId: string, followingId: string) {
    return this.logActivity({
      userId,
      type: 'FOLLOWED_USER',
      targetType: 'user',
      targetId: followingId,
    });
  }

  async logBadgeEarned(userId: string, badge: any) {
    return this.logActivity({
      userId,
      type: 'BADGE_EARNED',
      targetType: 'badge',
      targetId: badge.id,
      metadata: {
        badgeName: badge.name,
        badgeIcon: badge.icon,
      },
    });
  }

  async logGroupJoined(userId: string, group: any) {
    return this.logActivity({
      userId,
      type: 'GROUP_JOINED',
      targetType: 'group',
      targetId: group.id,
      metadata: {
        groupName: group.name,
        groupSlug: group.slug,
      },
    });
  }

  async logReaction(userId: string, targetType: string, targetId: string, reactionType: string) {
    return this.logActivity({
      userId,
      type: `REACTION_${reactionType.toUpperCase()}`,
      targetType,
      targetId,
      metadata: { reactionType },
    });
  }

  async getFeed(userId: string, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    // Get users the current user follows
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    // Get activities from followed users
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          userId: { in: followingIds },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({
        where: { userId: { in: followingIds } },
      }),
    ]);

    // Enrich activities with target details
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        let target = null;

        if (activity.targetType === 'topic' && activity.targetId) {
          target = await this.prisma.topic.findUnique({
            where: { id: activity.targetId },
            include: {
              category: true,
              _count: { select: { posts: true } },
            },
          });
        } else if (activity.targetType === 'user' && activity.targetId) {
          target = await this.prisma.user.findUnique({
            where: { id: activity.targetId },
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          });
        } else if (activity.targetType === 'badge' && activity.targetId) {
          target = await this.prisma.badge.findUnique({
            where: { id: activity.targetId },
          });
        } else if (activity.targetType === 'group' && activity.targetId) {
          target = await this.prisma.group.findUnique({
            where: { id: activity.targetId },
          });
        }

        return {
          ...activity,
          target,
        };
      })
    );

    return {
      activities: enrichedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserActivities(userId: string, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({ where: { userId } }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActivityStats(userId: string) {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      select: { type: true, createdAt: true },
    });

    const byType = activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Activity by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = activities.filter(
      a => new Date(a.createdAt) >= thirtyDaysAgo
    );

    const byDay = recentActivities.reduce((acc, a) => {
      const day = new Date(a.createdAt).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: activities.length,
      byType,
      byDay,
      mostActiveDay: Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    };
  }
}
