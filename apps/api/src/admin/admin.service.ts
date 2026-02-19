import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** Look up user by email: first in our Profile table, then in Clerk. Returns { clerkId, email } or null. */
  async lookupByEmail(email: string): Promise<{ clerkId: string; email: string } | null> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return null;

    const profile = await this.prisma.profile.findFirst({ where: { email: trimmed } });
    if (profile) return { clerkId: profile.clerkId, email: profile.email };

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) return null;

    try {
      const clerk = createClerkClient({ secretKey });
      const res = await clerk.users.getUserList({ emailAddress: [trimmed], limit: 1 });
      const user = res.data[0];
      if (!user?.id) return null;
      const primaryEmail = user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress;
      return primaryEmail ? { clerkId: user.id, email: primaryEmail } : { clerkId: user.id, email: trimmed };
    } catch {
      return null;
    }
  }

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
    let profile = await this.prisma.profile.findUnique({ where: { clerkId } });
    if (!profile) {
      // Create profile on-the-fly so admins can be added for users who haven't signed in yet
      profile = await this.prisma.profile.upsert({
        where: { clerkId },
        create: { clerkId, email: email.trim() },
        update: { email: email.trim() },
      });
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
