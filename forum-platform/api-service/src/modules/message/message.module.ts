import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
  exports: [MessageService],
})
export class MessageModule {}
