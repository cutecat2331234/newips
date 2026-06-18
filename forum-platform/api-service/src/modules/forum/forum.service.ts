import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class ForumService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        icon: true,
        sortOrder: true,
        parentId: true,
        topics: { select: { id: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        topics: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            replyCount: true,
            viewCount: true,
            isPinned: true,
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 50,
        },
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createTopic(createTopicDto: CreateTopicDto, authorId: string) {
    const { title, content, categoryId, tags } = createTopicDto;

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const topic = await this.prisma.topic.create({
      data: {
        title,
        content,
        categoryId,
        authorId,
        status: 'APPROVED',
        tags: tags?.length
          ? {
              create: tags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, color: true } } },
      },
    });

    await this.prisma.reputation.create({
      data: {
        userId: authorId,
        amount: 5,
        reason: 'topic_created',
      },
    });

    return topic;
  }

  async getTopicById(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, color: true } } },
        posts: {
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            parent: { select: { id: true, content: true, author: { select: { username: true } } } },
            replies: { select: { id: true, content: true, author: { select: { username: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    await this.prisma.topic.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return topic;
  }

  async createPost(createPostDto: CreatePostDto, authorId: string) {
    const { content, topicId, parentId } = createPostDto;

    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const post = await this.prisma.post.create({
      data: {
        content,
        topicId,
        authorId,
        parentId,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        parent: { select: { id: true, content: true, author: { select: { username: true } } } },
      },
    });

    await this.prisma.topic.update({
      where: { id: topicId },
      data: { replyCount: { increment: 1 }, lastReplyAt: new Date() },
    });

    await this.prisma.reputation.create({
      data: {
        userId: authorId,
        amount: 2,
        reason: 'post_created',
      },
    });

    return post;
  }

  async getTags() {
    return this.prisma.tag.findMany({
      select: { id: true, name: true, color: true },
      orderBy: { name: 'asc' },
    });
  }
}