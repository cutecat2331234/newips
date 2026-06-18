import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async addBookmark(userId: string, topicId: string, note?: string) {
    // Check if topic exists
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Check if already bookmarked
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Topic already bookmarked');
    }

    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        topicId,
        note,
      },
      include: {
        topic: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                username: true,
              },
            },
            category: true,
          },
        },
      },
    });

    return bookmark;
  }

  async removeBookmark(userId: string, topicId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    return { success: true };
  }

  async getUserBookmarks(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      categoryId?: string;
    }
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (options?.categoryId) {
      where.topic = { categoryId: options.categoryId };
    }

    const [bookmarks, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where,
        include: {
          topic: {
            include: {
              author: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                },
              },
              category: true,
              tags: {
                include: { tag: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.bookmark.count({ where }),
    ]);

    return {
      bookmarks: bookmarks.map(b => ({
        ...b,
        topic: {
          ...b.topic,
          tags: b.topic.tags.map(t => t.tag),
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBookmarkNote(userId: string, topicId: string, note: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    return this.prisma.bookmark.update({
      where: { id: bookmark.id },
      data: { note },
    });
  }

  async isBookmarked(userId: string, topicId: string) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    return !!bookmark;
  }

  async getBookmarkCount(userId: string) {
    return this.prisma.bookmark.count({
      where: { userId },
    });
  }
}
