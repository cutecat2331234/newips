import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getFeed(req.user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('user/:userId')
  async getUserActivities(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getUserActivities(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('user/:userId/stats')
  async getActivityStats(@Param('userId') userId: string) {
    return this.activityService.getActivityStats(userId);
  }

  @Get('stats/me')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req: any) {
    return this.activityService.getActivityStats(req.user.id);
  }
}
