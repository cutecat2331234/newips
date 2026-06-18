import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('conversations')
  async getConversations(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messageService.getUserConversations(
      req.user.id,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );
  }

  @Get('conversations/:conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messageService.getConversationMessages(
      conversationId,
      req.user.id,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );
  }

  @Post('conversations')
  async createConversation(
    @Body() body: { userIds: string[] },
    @Request() req: any,
  ) {
    const userIds = [...body.userIds, req.user.id];
    return this.messageService.createConversation(userIds);
  }

  @Post('conversations/:conversationId')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.messageService.sendMessage(
      conversationId,
      req.user.id,
      body.content
    );
  }

  @Patch('conversations/:conversationId/read')
  async markAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ) {
    return this.messageService.markAsRead(conversationId, req.user.id);
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req: any) {
    return this.messageService.getUnreadCount(req.user.id);
  }

  @Post('conversations/:conversationId/participants')
  async addParticipant(
    @Param('conversationId') conversationId: string,
    @Body() body: { userId: string },
    @Request() req: any,
  ) {
    return this.messageService.addParticipant(
      conversationId,
      body.userId,
      req.user.id
    );
  }
}
