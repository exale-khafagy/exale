import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRole } from '@prisma/client';

const FOUNDER_EMAIL = 'khafagy.ahmedibrahim@gmail.com';

@Injectable()
export class EditorGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      throw new UnauthorizedException('Clerk not configured');
    }

    try {
      const payload = await verifyToken(token, { secretKey });
      const clerkId = payload.sub;
      if (!clerkId) {
        throw new UnauthorizedException('Invalid token');
      }

      let admin = await this.prisma.admin.findUnique({
        where: { clerkId },
      });

      if (!admin) {
        const profile = await this.prisma.profile.findUnique({
          where: { clerkId },
        });
        if (profile?.email?.toLowerCase() === FOUNDER_EMAIL) {
          admin = await this.prisma.admin.upsert({
            where: { clerkId },
            create: { clerkId, email: profile.email, role: AdminRole.ADMIN },
            update: { email: profile.email, role: AdminRole.ADMIN },
          });
        }
      }

      if (!admin) {
        throw new UnauthorizedException('User is not an editor or admin');
      }

      // Both EDITOR and ADMIN can access editor routes
      const role = admin.role ?? AdminRole.ADMIN; // backward compat: missing role = admin
      if (role !== AdminRole.EDITOR && role !== AdminRole.ADMIN) {
        throw new UnauthorizedException('Insufficient permissions');
      }

      (request as Request & { clerkId: string; role: AdminRole }).clerkId = clerkId;
      (request as Request & { clerkId: string; role: AdminRole }).role = role;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
