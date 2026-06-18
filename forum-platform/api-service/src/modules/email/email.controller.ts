import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async sendTestEmail(
    @Body() body: { template: string; email: string },
    @Request() req: any,
  ) {
    if (!req.user.isAdmin) {
      return { error: 'Admin only' };
    }

    return this.emailService.sendEmail({
      to: body.email,
      subject: 'Test Email',
      template: body.template,
      data: {
        userId: req.user.id,
        forumName: 'ForumHub',
        forumUrl: 'http://localhost:3000',
        displayName: 'Test User',
      },
    });
  }

  @Post('welcome')
  async sendWelcome(
    @Body() body: { userId: string; email: string; displayName: string },
  ) {
    return this.emailService.sendWelcomeEmail(body.userId, body.email, body.displayName);
  }

  @Post('password-reset')
  async sendPasswordReset(
    @Body() body: { userId: string; email: string; displayName: string; token: string },
  ) {
    return this.emailService.sendPasswordResetEmail(
      body.userId,
      body.email,
      body.displayName,
      body.token
    );
  }
}
