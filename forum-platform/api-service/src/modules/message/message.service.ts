import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createConversation(userIds: string[]) {
    // Check if conversation already exists between these users
    const uniqueUserIds = [...new Set(userIds)];
    
    if (uniqueUserIds.length < 2) {
      throw new ForbiddenException('Conversation requires at least 2 users');
    }

    // Find existing conversation
    const participants = await this.prisma.conversationParticipant.findMany({
      where: {
        userId: { in: uniqueUserIds },
      },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    // Group by conversation
    const conversationGroups = participants.reduce((acc, p) => {
      if (!acc[p.conversationId]) {
        acc[p.conversationId] = [];
      }
      acc[p.conversationId].push(p.userId);
      return acc;
    }, {} as Record<string, string[]>);

    // Find conversation with exact same participants
    for (const [convId, members] of Object.entries(conversationGroups)) {
      if (
        members.length === uniqueUserIds.length &&
        members.every(id => uniqueUserIds.includes(id))
      ) {
        return this.prisma.conversation.findUnique({
          where: { id: convId },
          include: {
            participants: {
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
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });
      }
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: uniqueUserIds.map(userId => ({
            userId,
          })),
        },
      },
      include: {
        participants: {
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
        },
      },
    });

    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      p => p.userId === senderId
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const message = await this.prisma.directMessage.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        conversation: {
          include: {
            participants: {
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
            },
          },
        },
      },
    });

    // Update conversation last message time
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async getUserConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
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
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            conversation: {
              include: {
                participants: {
                  where: { userId: { not: userId } },
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
                        displayName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: limit,
    });

    // Mark as read
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId: { in: conversations.map(c => c.id) },
        userId,
      },
      data: { lastReadAt: new Date() },
    });

    return conversations.map(conv => ({
      ...conv,
      otherParticipant: conv.participants.find(p => p.userId !== userId)?.user,
      unreadCount: 0,
    }));
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50
  ) {
    const skip = (page - 1) * limit;

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
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
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      p => p.userId === userId
    );

    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const [messages, total] = await Promise.all([
      this.prisma.directMessage.findMany({
        where: { conversationId },
        include: {
          conversation: {
            include: {
              participants: {
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
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.directMessage.count({
        where: { conversationId },
      }),
    ]);

    // Mark as read
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: { lastReadAt: new Date() },
    });

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            messages: {
              where: {
                senderId: { not: userId },
                createdAt: { gt: new Date() },
              },
            },
          },
        },
      },
    });

    let unreadCount = 0;
    for (const conv of conversations) {
      for (const msg of conv.conversation.messages) {
        if (msg.createdAt > (conv.lastReadAt || new Date(0))) {
          unreadCount++;
        }
      }
    }

    return { unreadCount };
  }

  async markAsRead(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: { lastReadAt: new Date() },
    });
  }

  async addParticipant(conversationId: string, userId: string, addedBy: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      p => p.userId === addedBy
    );

    if (!isParticipant) {
      throw new ForbiddenException('You cannot add participants');
    }

    const existingParticipant = conversation.participants.find(
      p => p.userId === userId
    );

    if (existingParticipant) {
      throw new ForbiddenException('User is already a participant');
    }

    return this.prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId,
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
    });
  }
}
