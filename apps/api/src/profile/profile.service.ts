import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SocialChannel {
  platform: string;
  url: string;
}

export interface UpdateProfileDto {
  avatarUrl?: string;
  phone?: string;
  companyName?: string;
  title?: string;
  socialChannels?: SocialChannel[];
}

export interface SyncProfileDto {
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClerkId(clerkId: string) {
    return this.prisma.profile.findUnique({ where: { clerkId } });
  }

  private readonly FOUNDER_EMAIL = 'khafagy.ahmedibrahim@gmail.com';

  async sync(clerkId: string, dto: SyncProfileDto) {
    const profile = await this.prisma.profile.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      update: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    // Founder email gets Admin access (hub, CMS)
    if (dto.email?.toLowerCase() === this.FOUNDER_EMAIL) {
      await this.prisma.admin.upsert({
        where: { clerkId },
        create: { clerkId, email: dto.email },
        update: { email: dto.email },
      });
    }

    return profile;
  }

  async update(clerkId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { clerkId },
      data: {
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.socialChannels !== undefined && { socialChannels: dto.socialChannels as object }),
      },
    });
  }

  async findAll() {
    return this.prisma.profile.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async findByEmail(email: string) {
    return this.prisma.profile.findFirst({ where: { email } });
  }
}
