"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const clerkId = process.argv[2];
    const email = process.argv[3];
    const role = process.argv[4];
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
//# sourceMappingURL=add-admin.js.map