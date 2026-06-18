import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';

@Module({
  controllers: [GroupController],
  providers: [GroupService, PrismaService],
  exports: [GroupService],
})
export class GroupModule {}
