import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';

@Module({
  controllers: [BookmarkController],
  providers: [BookmarkService, PrismaService],
  exports: [BookmarkService],
})
export class BookmarkModule {}
