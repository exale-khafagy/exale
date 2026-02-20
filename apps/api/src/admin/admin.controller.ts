import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { ClerkGuard } from '../auth/clerk.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('check')
  @UseGuards(ClerkGuard)
  async checkMe(@Req() req: Request & { clerkId: string }) {
    const admin = await this.admin.findAdminOrFounder(req.clerkId);
    const isAdmin = !!admin;
    const role = admin?.role ?? (isAdmin ? 'ADMIN' : null);
    return { isAdmin, role };
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.admin.findAll();
  }

  @Get('lookup/:email')
  @UseGuards(AdminGuard)
  async lookupByEmail(@Param('email') email: string) {
    return this.admin.lookupByEmail(decodeURIComponent(email));
  }

  @Post()
  @UseGuards(AdminGuard)
  async create(
    @Body() body: { clerkId: string; email: string; role?: 'EDITOR' | 'ADMIN' },
    @Req() req: Request & { clerkId: string },
  ) {
    return this.admin.create(body.clerkId, body.email, body.role);
  }

  @Delete(':clerkId')
  @UseGuards(AdminGuard)
  async remove(@Param('clerkId') clerkId: string) {
    return this.admin.remove(clerkId);
  }
}
