import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PrismaService],
  exports: [PermissionService],
})
export class PermissionModule {}
