import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { ClerkGuard } from '../auth/clerk.guard';
import { WorkforceGuard } from '../auth/workforce.guard';
import { AdminService } from './admin.service';
import { AdminRole } from '@prisma/client';

type WorkforceRole = Exclude<AdminRole, typeof AdminRole.FOUNDER>;

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('check')
  @UseGuards(ClerkGuard)
  async checkMe(@Req() req: Request & { clerkId: string }) {
    const isUser = !!req.clerkId;
    const admin = await this.admin.findAdminOrFounder(req.clerkId);
    const isAdmin = !!admin;
    const role = admin?.role ?? (isAdmin ? 'ADMIN' : null);
    return { isUser, isAdmin, role };
  }

  @Get()
  @UseGuards(WorkforceGuard)
  findAll() {
    return this.admin.findAll();
  }

  @Get('lookup/:email')
  @UseGuards(WorkforceGuard)
  async lookupByEmail(@Param('email') email: string) {
    return this.admin.lookupByEmail(decodeURIComponent(email));
  }

  @Post()
  @UseGuards(WorkforceGuard)
  async create(
    @Body() body: { clerkId: string; email: string; role?: WorkforceRole },
    @Req() req: Request & { clerkId: string },
  ) {
    return this.admin.create(body.clerkId, body.email, body.role);
  }

  @Patch(':clerkId/role')
  @UseGuards(WorkforceGuard)
  async updateRole(
    @Param('clerkId') clerkId: string,
    @Body() body: { role?: WorkforceRole },
  ) {
    return this.admin.updateRole(clerkId, body.role ?? AdminRole.ADMIN);
  }

  @Delete(':clerkId')
  @UseGuards(WorkforceGuard)
  async remove(
    @Param('clerkId') clerkId: string,
    @Req() req: Request & { clerkId: string },
  ) {
    return this.admin.remove(clerkId, req.clerkId);
  }
}
