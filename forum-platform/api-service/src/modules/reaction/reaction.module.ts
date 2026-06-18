import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';

@Module({
  controllers: [ReactionController],
  providers: [ReactionService, PrismaService],
  exports: [ReactionService],
})
export class ReactionModule {}
