import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(
    creatorId: string,
    data: {
      name: string;
      slug: string;
      description?: string;
      coverImage?: string;
      icon?: string;
      isPrivate?: boolean;
      requiresApproval?: boolean;
    }
  ) {
    // Check if slug exists
    const existing = await this.prisma.group.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('Group slug already exists');
    }

    const group = await this.prisma.group.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        coverImage: data.coverImage,
        icon: data.icon,
        isPrivate: data.isPrivate ?? false,
        requiresApproval: data.requiresApproval ?? false,
        ownerId: creatorId,
        members: {
          create: {
            userId: creatorId,
            role: 'OWNER',
            status: 'APPROVED',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { members: true, topics: true },
        },
      },
    });

    return group;
  }

  async getGroups(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'name' | 'members' | 'created';
    type?: 'all' | 'public' | 'private' | 'my';
    userId?: string;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.type === 'public') {
      where.isPrivate = false;
    } else if (options?.type === 'private') {
      where.isPrivate = true;
    } else if (options?.type === 'my' && options?.userId) {
      where.members = {
        some: {
          userId: options.userId,
          status: 'APPROVED',
        },
      };
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    switch (options?.sort) {
      case 'members':
        orderBy.members = { _count: 'desc' };
        break;
      case 'created':
        orderBy.createdAt = 'desc';
        break;
      default:
        orderBy.name = 'asc';
    }

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { members: true, topics: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGroupBySlug(slug: string, userId?: string) {
    const group = await this.prisma.group.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        members: {
          where: { status: 'APPROVED' },
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
          orderBy: { joinedAt: 'desc' },
          take: 20,
        },
        moderators: {
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
        _count: {
          select: { members: true, topics: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if current user is member
    let membership = null;
    if (userId) {
      membership = await this.prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId,
          },
        },
      });
    }

    return {
      ...group,
      isMember: !!membership,
      membership,
    };
  }

  async joinGroup(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check existing membership
    const existing = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'APPROVED') {
        throw new ConflictException('Already a member');
      }
      if (existing.status === 'PENDING') {
        throw new ConflictException('Join request pending');
      }
    }

    const status = group.requiresApproval ? 'PENDING' : 'APPROVED';

    return this.prisma.groupMember.create({
      data: {
        groupId,
        userId,
        status,
        role: 'MEMBER',
      },
    });
  }

  async leaveGroup(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Not a member');
    }

    if (membership.role === 'OWNER') {
      throw new ForbiddenException('Owner cannot leave the group');
    }

    return this.prisma.groupMember.delete({
      where: { id: membership.id },
    });
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    targetUserId: string,
    newRole: 'MODERATOR' | 'MEMBER'
  ) {
    // Check if requester is owner or moderator
    const requesterMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!requesterMembership || requesterMembership.role === 'MEMBER') {
      throw new ForbiddenException('Insufficient permissions');
    }

    const targetMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (!targetMembership) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.groupMember.update({
      where: { id: targetMembership.id },
      data: { role: newRole },
    });
  }

  async approveMember(groupId: string, userId: string, targetUserId: string) {
    const requesterMembership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!requesterMembership || !['OWNER', 'MODERATOR'].includes(requesterMembership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: targetUserId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { status: 'APPROVED' },
    });
  }

  async getGroupTopics(
    groupId: string,
    userId: string,
    options?: { page?: number; limit?: number }
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    // Check membership
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    const group = await this.prisma.group.findUnique({ where: { id: groupId } });

    if (group?.isPrivate && (!membership || membership.status !== 'APPROVED')) {
      throw new ForbiddenException('Not a member of this private group');
    }

    const [topics, total] = await Promise.all([
      this.prisma.topic.findMany({
        where: { groupId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.topic.count({ where: { groupId } }),
    ]);

    return {
      topics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingMembers(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership || !['OWNER', 'MODERATOR'].includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.prisma.groupMember.findMany({
      where: {
        groupId,
        status: 'PENDING',
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
      orderBy: { joinedAt: 'desc' },
    });
  }

  async updateGroup(groupId: string, userId: string, data: {
    name?: string;
    description?: string;
    coverImage?: string;
    icon?: string;
    isPrivate?: boolean;
    requiresApproval?: boolean;
  }) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException('Only owner can update group');
    }

    return this.prisma.group.update({
      where: { id: groupId },
      data,
    });
  }

  async deleteGroup(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException('Only owner can delete group');
    }

    return this.prisma.group.delete({
      where: { id: groupId },
    });
  }
}
