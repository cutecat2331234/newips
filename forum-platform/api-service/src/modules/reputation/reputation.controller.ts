import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reputation')
export class ReputationController {
  constructor(private reputationService: ReputationService) {}

  @Get('user/:userId')
  async getUserReputation(@Param('userId') userId: string) {
    return this.reputationService.getUserReputation(userId);
  }

  @Get('user/:userId/history')
  async getReputationHistory(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reputationService.getReputationHistory(
      userId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );
  }

  @Get('user/:userId/rank')
  async getUserRank(@Param('userId') userId: string) {
    return this.reputationService.getRank(userId);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.reputationService.getLeaderboard(
      limit ? parseInt(limit) : undefined
    );
  }

  @Post('user/:userId/check-badges')
  @UseGuards(JwtAuthGuard)
  async checkBadges(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    // Only allow users to check their own badges
    if (req.user.id !== userId) {
      return { error: 'Unauthorized' };
    }
    return this.reputationService.checkAndAwardBadges(userId);
  }

  @Get('rules')
  async getReputationRules() {
    return this.prisma.reputationRule.findMany();
  }
}
