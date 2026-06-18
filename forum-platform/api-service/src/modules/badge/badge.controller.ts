import { Controller, Get, Param, Query } from '@nestjs/common';
import { BadgeService } from './badge.service';

@Controller('badges')
export class BadgeController {
  constructor(private badgeService: BadgeService) {}

  @Get()
  async getAllBadges() {
    return this.badgeService.getAllBadges();
  }

  @Get('stats')
  async getBadgeStats() {
    return this.badgeService.getBadgeStats();
  }

  @Get('category/:category')
  async getCategoryBadges(@Param('category') category: string) {
    return this.badgeService.getCategoryBadges(category);
  }

  @Get('user/:userId')
  async getUserBadges(@Param('userId') userId: string) {
    return this.badgeService.getUserBadges(userId);
  }
}
