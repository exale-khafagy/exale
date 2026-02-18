import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateSettingsDto {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  notifyEmail?: string;
  googleAnalyticsId?: string;
  timezone?: string;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.settings.findFirst();

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {},
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const existing = await this.prisma.settings.findFirst();

    if (!existing) {
      return this.prisma.settings.create({
        data: dto,
      });
    }

    return this.prisma.settings.update({
      where: { id: existing.id },
      data: dto,
    });
  }
}
