import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BadgeService } from './badge.service';
import { BadgeController } from './badge.controller';

@Module({
  controllers: [BadgeController],
  providers: [BadgeService, PrismaService],
  exports: [BadgeService],
})
export class BadgeModule {}
