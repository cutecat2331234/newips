import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';

@Module({
  controllers: [PollController],
  providers: [PollService, PrismaService],
  exports: [PollService],
})
export class PollModule {}
