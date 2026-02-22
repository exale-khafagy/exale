import { AdminRole } from '@prisma/client';

export const FOUNDER_EMAIL = 'khafagy.ahmedibrahim@gmail.com';

/** Roles that can access the dashboard (any section they're allowed to see). */
export const DASHBOARD_ROLES: AdminRole[] = [
  AdminRole.FOUNDER,
  AdminRole.TIER2_ADMIN,
  AdminRole.ADMIN,
  AdminRole.MODERATOR,
  AdminRole.CONTENT_WRITER,
  AdminRole.SEO,
  AdminRole.EDITOR, // deprecated, treated as MODERATOR
];

/** Roles that can access the Workforce tab and manage workforce (add/remove/change roles). Only Founder can remove founder. */
export const WORKFORCE_ROLES: AdminRole[] = [AdminRole.FOUNDER, AdminRole.TIER2_ADMIN];

export function hasDashboardAccess(role: AdminRole | null): boolean {
  if (!role) return false;
  return DASHBOARD_ROLES.includes(role);
}

export function hasWorkforceAccess(role: AdminRole | null): boolean {
  if (!role) return false;
  return WORKFORCE_ROLES.includes(role);
}

export function isFounderRoleOrEmail(role: AdminRole | null, email: string | null): boolean {
  if (role === AdminRole.FOUNDER) return true;
  if (email?.toLowerCase() === FOUNDER_EMAIL) return true;
  return false;
}
