import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';

@Module({
  controllers: [ReputationController],
  providers: [ReputationService, PrismaService],
  exports: [ReputationService],
})
export class ReputationModule {}
