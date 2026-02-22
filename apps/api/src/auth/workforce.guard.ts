import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRole } from '@prisma/client';
import { FOUNDER_EMAIL, hasWorkforceAccess } from './constants';

@Injectable()
export class WorkforceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) throw new UnauthorizedException('Clerk not configured');

    try {
      const payload = await verifyToken(token, { secretKey });
      const clerkId = payload.sub;
      if (!clerkId) throw new UnauthorizedException('Invalid token');

      let admin = await this.prisma.admin.findUnique({ where: { clerkId } });

      if (!admin) {
        const profile = await this.prisma.profile.findUnique({
          where: { clerkId },
        });
        if (profile?.email?.toLowerCase() === FOUNDER_EMAIL) {
          admin = await this.prisma.admin.upsert({
            where: { clerkId },
            create: { clerkId, email: profile.email, role: AdminRole.FOUNDER },
            update: { email: profile.email, role: AdminRole.FOUNDER },
          });
        }
      }

      if (!admin && secretKey) {
        try {
          const clerk = createClerkClient({ secretKey });
          const user = await clerk.users.getUser(clerkId);
          const primaryEmail =
            user.emailAddresses?.find(
              (e) => e.id === user.primaryEmailAddressId,
            )?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress;
          if (primaryEmail?.toLowerCase() === FOUNDER_EMAIL) {
            admin = await this.prisma.admin.upsert({
              where: { clerkId },
              create: {
                clerkId,
                email: primaryEmail,
                role: AdminRole.FOUNDER,
              },
              update: { email: primaryEmail, role: AdminRole.FOUNDER },
            });
          }
        } catch {
          // ignore
        }
      }

      if (!admin) throw new UnauthorizedException('User is not an admin');

      // Ensure founder email always has FOUNDER role (migrate existing rows)
      if (admin.email?.toLowerCase() === FOUNDER_EMAIL && admin.role !== AdminRole.FOUNDER) {
        admin = await this.prisma.admin.update({
          where: { clerkId },
          data: { role: AdminRole.FOUNDER },
        });
      }

      const role = admin.role ?? AdminRole.ADMIN;
      if (!hasWorkforceAccess(role)) {
        throw new UnauthorizedException(
          'Workforce access is restricted to Founder and Tier 2 Admin',
        );
      }

      (request as Request & { clerkId: string; role: AdminRole }).clerkId =
        clerkId;
      (request as Request & { clerkId: string; role: AdminRole }).role = role;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
