import { BadRequestException, Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { ClerkGuard } from '../auth/clerk.guard';
import { EditorGuard } from '../auth/editor.guard';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.profile.findAll();
  }

  @Get('by-email/:email')
  @UseGuards(EditorGuard)
  findByEmail(@Param('email') email: string) {
    return this.profile.findByEmail(decodeURIComponent(email));
  }

  @Get('me')
  @UseGuards(ClerkGuard)
  async getMe(@Req() req: Request & { clerkId: string }) {
    const profile = await this.profile.findByClerkId(req.clerkId);
    if (!profile) return null;
    return profile;
  }

  @Post('sync')
  @UseGuards(ClerkGuard)
  async sync(
    @Body() body: { email?: string; firstName?: string; lastName?: string },
    @Req() req: Request & { clerkId: string },
  ) {
    const email = body?.email?.trim();
    if (!email) {
      throw new BadRequestException('Email is required for profile sync');
    }
    return this.profile.sync(req.clerkId, {
      email,
      firstName: body.firstName,
      lastName: body.lastName,
    });
  }

  @Put('me')
  @UseGuards(ClerkGuard)
  async update(
    @Body()
    body: {
      avatarUrl?: string;
      phone?: string;
      companyName?: string;
      title?: string;
      socialChannels?: Array<{ platform: string; url: string }>;
    },
    @Req() req: Request & { clerkId: string },
  ) {
    const existing = await this.profile.findByClerkId(req.clerkId);
    if (!existing) {
      throw new Error('Profile not found. Call POST /profile/sync first.');
    }
    return this.profile.update(req.clerkId, body);
  }
}
