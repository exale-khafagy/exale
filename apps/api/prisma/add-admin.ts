/**
 * Add an admin to the Admin collection.
 * Run: npx ts-node prisma/add-admin.ts <clerkId> <email>
 *
 * Get your Clerk user ID from: dashboard.clerk.com → Users → click user → User ID
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clerkId = process.argv[2];
  const email = process.argv[3];
  const role = process.argv[4] as 'EDITOR' | 'ADMIN' | undefined;
  if (!clerkId || !email) {
    console.error('Usage: npx ts-node prisma/add-admin.ts <clerkId> <email> [EDITOR|ADMIN]');
    process.exit(1);
  }
  const roleVal = role === 'EDITOR' ? 'EDITOR' : 'ADMIN';
  const admin = await prisma.admin.upsert({
    where: { clerkId },
    create: { clerkId, email, role: roleVal },
    update: { email, role: roleVal },
  });
  console.log(roleVal === 'ADMIN' ? 'Admin added:' : 'Editor added:', admin.email, '(' + admin.clerkId + ')');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
