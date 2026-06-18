import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reactions')
export class ReactionController {
  constructor(private reactionService: ReactionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addReaction(
    @Body() body: { targetType: string; targetId: string; reactionType: string },
    @Request() req: any,
  ) {
    return this.reactionService.addReaction(
      req.user.id,
      body.targetType,
      body.targetId,
      body.reactionType
    );
  }

  @Get(':targetType/:targetId')
  async getReactions(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.reactionService.getReactions(targetType, targetId);
  }

  @Get(':targetType/:targetId/user')
  @UseGuards(JwtAuthGuard)
  async getUserReaction(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Request() req: any,
  ) {
    return this.reactionService.getUserReaction(req.user.id, targetType, targetId);
  }

  @Get('topics/trending')
  async getTrendingTopics(
    @Param('limit') limit?: string,
  ) {
    return this.reactionService.getTopReactedTopics(limit ? parseInt(limit) : 10);
  }
}
