import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.admin.findUnique({ where: { clerkId } });
  }

  async findByEmail(email: string) {
    return this.prisma.admin.findFirst({ where: { email } });
  }

  async create(clerkId: string, email: string, role?: 'EDITOR' | 'ADMIN') {
    const profile = await this.prisma.profile.findUnique({ where: { clerkId } });
    if (!profile) {
      throw new BadRequestException('Profile must exist before adding as admin. User must sign in first.');
    }

    const roleVal = role ?? 'ADMIN';
    return this.prisma.admin.upsert({
      where: { clerkId },
      create: { clerkId, email, role: roleVal },
      update: { email, role: roleVal },
    });
  }

  async remove(clerkId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { clerkId } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return this.prisma.admin.delete({ where: { clerkId } });
  }
}
