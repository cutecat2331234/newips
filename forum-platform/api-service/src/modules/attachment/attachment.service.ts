import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'video/ogg',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class AttachmentService {
  constructor(private prisma: PrismaService) {}

  async upload(file: Express.Multer.File, userId: string) {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large (max 10MB)');
    }

    // Generate unique filename
    const ext = file.originalname.split('.').pop();
    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    const uploadPath = join(process.cwd(), 'uploads', filename);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const writeStream = createWriteStream(uploadPath);
    writeStream.write(file.buffer);
    writeStream.end();

    // Create database record
    const attachment = await this.prisma.attachment.create({
      data: {
        filename: file.originalname,
        storedFilename: filename,
        mimeType: file.mimetype,
        size: file.size,
        userId,
      },
    });

    return {
      id: attachment.id,
      filename: attachment.filename,
      url: `/uploads/${filename}`,
      mimeType: attachment.mimeType,
      size: attachment.size,
    };
  }

  async uploadMultiple(files: Express.Multer.File[], userId: string) {
    const results = [];
    for (const file of files) {
      try {
        const result = await this.upload(file, userId);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    return results;
  }

  async getAttachment(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async getAttachments(targetType: string, targetId: string) {
    const where: any = { targetType };

    if (targetType === 'topic') {
      where.topicId = targetId;
    } else if (targetType === 'post') {
      where.postId = targetId;
    } else if (targetType === 'message') {
      where.messageId = targetId;
    }

    const attachments = await this.prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return attachments.map(a => ({
      id: a.id,
      filename: a.filename,
      url: `/uploads/${a.storedFilename}`,
      thumbnailUrl: a.thumbnailFilename ? `/uploads/${a.thumbnailFilename}` : null,
      mimeType: a.mimeType,
      size: a.size,
      isImage: a.mimeType.startsWith('image/'),
    }));
  }

  async attachToTopic(attachmentId: string, topicId: string, userId: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Topic not found');
    if (topic.authorId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.attachment.update({
      where: { id: attachmentId },
      data: { topicId },
    });
  }

  async attachToPost(attachmentId: string, postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not authorized');

    return this.prisma.attachment.update({
      where: { id: attachmentId },
      data: { postId },
    });
  }

  async delete(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this attachment');
    }

    // Delete file
    const filePath = join(process.cwd(), 'uploads', attachment.storedFilename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    if (attachment.thumbnailFilename) {
      const thumbPath = join(process.cwd(), 'uploads', attachment.thumbnailFilename);
      if (existsSync(thumbPath)) {
        unlinkSync(thumbPath);
      }
    }

    // Delete database record
    await this.prisma.attachment.delete({ where: { id } });

    return { success: true };
  }

  async getUserAttachments(userId: string, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [attachments, total] = await Promise.all([
      this.prisma.attachment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.attachment.count({ where: { userId } }),
    ]);

    return {
      attachments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(userId: string) {
    const [totalAttachments, totalSize, byType] = await Promise.all([
      this.prisma.attachment.count({ where: { userId } }),
      this.prisma.attachment.aggregate({
        where: { userId },
        _sum: { size: true },
      }),
      this.prisma.attachment.groupBy({
        by: ['mimeType'],
        where: { userId },
        _count: true,
        _sum: { size: true },
      }),
    ]);

    return {
      totalAttachments,
      totalSize: totalSize._sum.size || 0,
      byType: byType.map(t => ({
        type: t.mimeType,
        count: t._count,
        size: t._sum.size || 0,
      })),
    };
  }
}
