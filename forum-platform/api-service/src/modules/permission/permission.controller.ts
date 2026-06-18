import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PermissionService, PERMISSIONS } from './permission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsAdminGuard } from '../auth/guards/is-admin.guard';

@Controller('permissions')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get('all')
  async getAllPermissions() {
    return PERMISSIONS;
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getRoles() {
    return this.permissionService.getRoles();
  }

  @Get('roles/:name')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getRole(@Param('name') name: string) {
    return this.permissionService.getRoleByName(name);
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getMyPermissions(@Request() req: any) {
    const permissions = await this.permissionService.getUserPermissions(req.user.id);
    return { permissions };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getUserPermissions(@Param('userId') userId: string) {
    const permissions = await this.permissionService.getUserPermissions(userId);
    return { permissions };
  }

  @Get('user/:userId/roles')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async getUserRoles(@Param('userId') userId: string) {
    return this.permissionService.getUserRoles(userId);
  }

  @Post('user/:userId/roles/:roleName')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async assignRole(
    @Param('userId') userId: string,
    @Param('roleName') roleName: string,
  ) {
    return this.permissionService.assignRole(userId, roleName);
  }

  @Delete('user/:userId/roles/:roleName')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleName') roleName: string,
  ) {
    return this.permissionService.removeRole(userId, roleName);
  }

  @Patch('roles/:name/permissions')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async updateRolePermissions(
    @Param('name') name: string,
    @Body() body: { permissions: string[] },
  ) {
    return this.permissionService.updateRolePermissions(name, body.permissions);
  }

  @Post('roles')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async createCustomRole(
    @Body() body: { name: string; permissions: string[]; description?: string },
  ) {
    return this.permissionService.createCustomRole(
      body.name,
      body.permissions,
      body.description
    );
  }

  @Delete('roles/:roleId')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async deleteCustomRole(@Param('roleId') roleId: string) {
    return this.permissionService.deleteCustomRole(roleId);
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  async initializeRoles() {
    await this.permissionService.initializeRoles();
    return { success: true };
  }
}
