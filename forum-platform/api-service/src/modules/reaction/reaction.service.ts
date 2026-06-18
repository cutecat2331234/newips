import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export const REACTION_TYPES = [
  { type: 'like', icon: '👍', label: 'Like', color: '#3b82f6' },
  { type: 'love', icon: '❤️', label: 'Love', color: '#ef4444' },
  { type: 'laugh', icon: '😂', label: 'Haha', color: '#f59e0b' },
  { type: 'wow', icon: '😮', label: 'Wow', color: '#8b5cf6' },
  { type: 'sad', icon: '😢', label: 'Sad', color: '#06b6d4' },
  { type: 'angry', icon: '😠', label: 'Angry', color: '#f97316' },
];

@Injectable()
export class ReactionService {
  constructor(private prisma: PrismaService) {}

  async addReaction(userId: string, targetType: string, targetId: string, reactionType: string) {
    // Validate target type and existence
    let target: any;
    switch (targetType) {
      case 'topic':
        target = await this.prisma.topic.findUnique({ where: { id: targetId } });
        break;
      case 'post':
        target = await this.prisma.post.findUnique({ where: { id: targetId } });
        break;
      default:
        throw new NotFoundException('Invalid target type');
    }

    if (!target) {
      throw new NotFoundException('Target not found');
    }

    // Check existing reaction
    const existing = await this.prisma.reaction.findFirst({
      where: {
        userId,
        targetType,
        targetId,
      },
    });

    if (existing) {
      // Update existing reaction
      if (existing.reactionType === reactionType) {
        // Remove reaction if same type
        await this.prisma.reaction.delete({ where: { id: existing.id } });
      } else {
        // Update reaction type
        await this.prisma.reaction.update({
          where: { id: existing.id },
          data: { reactionType },
        });
      }
    } else {
      // Create new reaction
      await this.prisma.reaction.create({
        data: {
          userId,
          targetType,
          targetId,
          reactionType,
        },
      });
    }

    // Get updated reactions
    return this.getReactions(targetType, targetId);
  }

  async getReactions(targetType: string, targetId: string) {
    const reactions = await this.prisma.reaction.groupBy({
      by: ['reactionType'],
      where: {
        targetType,
        targetId,
      },
      _count: true,
    });

    const totalCount = reactions.reduce((sum, r) => sum + r._count, 0);

    const reactionSummary = REACTION_TYPES.map(r => {
      const found = reactions.find(re => re.reactionType === r.type);
      return {
        type: r.type,
        icon: r.icon,
        label: r.label,
        color: r.color,
        count: found?._count || 0,
      };
    }).filter(r => r.count > 0);

    return {
      totalCount,
      reactions: reactionSummary,
    };
  }

  async getUserReaction(userId: string, targetType: string, targetId: string) {
    const reaction = await this.prisma.reaction.findFirst({
      where: {
        userId,
        targetType,
        targetId,
      },
    });

    return {
      reactionType: reaction?.reactionType || null,
    };
  }

  async getTopReactedTopics(limit = 10) {
    const topics = await this.prisma.topic.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        reactions: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    return topics
      .map(topic => ({
        ...topic,
        reactionCount: topic.reactions.length,
        reactions: this.summarizeReactions(topic.reactions.map(r => r.reactionType)),
      }))
      .sort((a, b) => b.reactionCount - a.reactionCount)
      .slice(0, limit);
  }

  private summarizeReactions(reactionTypes: string[]) {
    return REACTION_TYPES.map(r => ({
      type: r.type,
      icon: r.icon,
      count: reactionTypes.filter(t => t === r.type).length,
    })).filter(r => r.count > 0);
  }
}
