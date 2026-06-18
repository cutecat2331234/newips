import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';

@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService, PrismaService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
