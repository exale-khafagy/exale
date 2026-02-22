import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { AdminRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FOUNDER_EMAIL, isFounderRoleOrEmail } from '../auth/constants';

const WORKFORCE_ASSIGNABLE_ROLES: AdminRole[] = [
  AdminRole.TIER2_ADMIN,
  AdminRole.ADMIN,
  AdminRole.MODERATOR,
  AdminRole.CONTENT_WRITER,
  AdminRole.SEO,
  AdminRole.EDITOR,
];

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns admin by clerkId, or if not in DB, creates admin for founder email (from Profile or Clerk lookup) and returns it. */
  async findAdminOrFounder(clerkId: string) {
    let admin = await this.prisma.admin.findUnique({ where: { clerkId } });
    if (admin) return admin;
    let email: string | null = null;
    const profile = await this.prisma.profile.findUnique({ where: { clerkId } });
    if (profile?.email?.toLowerCase() === FOUNDER_EMAIL) {
      email = profile.email;
    }
    if (!email) {
      const founder = await this.lookupByEmail(FOUNDER_EMAIL);
      if (founder?.clerkId === clerkId) email = founder.email;
    }
    if (email) {
      admin = await this.prisma.admin.upsert({
        where: { clerkId },
        create: { clerkId, email, role: AdminRole.FOUNDER },
        update: { email, role: AdminRole.FOUNDER },
      });
      return admin;
    }
    return null;
  }

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

  async create(
    clerkId: string,
    email: string,
    role?: AdminRole | keyof typeof AdminRole,
  ) {
    const roleVal = role
      ? (WORKFORCE_ASSIGNABLE_ROLES.includes(role as AdminRole)
          ? (role as AdminRole)
          : AdminRole.ADMIN)
      : AdminRole.ADMIN;
    if (roleVal === AdminRole.FOUNDER) {
      throw new ForbiddenException('Cannot assign Founder role via Workforce');
    }

    let profile = await this.prisma.profile.findUnique({ where: { clerkId } });
    if (!profile) {
      profile = await this.prisma.profile.upsert({
        where: { clerkId },
        create: { clerkId, email: email.trim() },
        update: { email: email.trim() },
      });
    }

    return this.prisma.admin.upsert({
      where: { clerkId },
      create: { clerkId, email: email.trim(), role: roleVal },
      update: { email: email.trim(), role: roleVal },
    });
  }

  async updateRole(
    clerkId: string,
    role: AdminRole | keyof typeof AdminRole,
  ) {
    const r =
      role && WORKFORCE_ASSIGNABLE_ROLES.includes(role as AdminRole)
        ? (role as AdminRole)
        : AdminRole.ADMIN;
    if (r === AdminRole.FOUNDER) {
      throw new ForbiddenException('Cannot assign Founder role via Workforce');
    }
    const admin = await this.prisma.admin.findUnique({ where: { clerkId } });
    if (!admin) throw new NotFoundException('Admin not found');
    return this.prisma.admin.update({
      where: { clerkId },
      data: { role: r },
    });
  }

  async remove(clerkIdToRemove: string, requestUserClerkId: string) {
    const target = await this.prisma.admin.findUnique({
      where: { clerkId: clerkIdToRemove },
    });
    if (!target) throw new NotFoundException('Admin not found');

    if (isFounderRoleOrEmail(target.role, target.email)) {
      const requester = await this.prisma.admin.findUnique({
        where: { clerkId: requestUserClerkId },
      });
      if (
        !requester ||
        !isFounderRoleOrEmail(requester.role, requester.email)
      ) {
        throw new ForbiddenException(
          'Only the Founder can remove the Founder from the workforce',
        );
      }
    }

    return this.prisma.admin.delete({ where: { clerkId: clerkIdToRemove } });
  }
}
