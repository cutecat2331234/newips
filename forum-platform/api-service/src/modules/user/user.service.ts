import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        bio: true,
        location: true,
        website: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        bio: true,
        location: true,
        website: true,
        profileViews: true,
        topics: { select: { id: true, title: true, createdAt: true }, take: 10 },
        posts: { select: { id: true, createdAt: true }, take: 10 },
        badges: { select: { badge: { select: { name: true, icon: true, color: true } } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { profileViews: { increment: 1 } },
    });

    return user;
  }

  async update(id: string, data: Partial<{ displayName: string; bio: string; location: string; website: string; avatarUrl: string }>) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        bio: true,
        location: true,
        website: true,
      },
    });

    return user;
  }
}