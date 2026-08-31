import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });
const permissions = ['student.view','student.view_sensitive','student.create','student.update','student.promote','student.transfer','student.mark_alumni'];

async function main() {
  await Promise.all(permissions.map((code) => prisma.permission.upsert({ where: { code }, update: {}, create: { code } })));
  const rolePermissions: Record<UserRole, string[]> = {
    SUPER_ADMIN: permissions,
    ADMIN: permissions,
    ACADEMIC: ['student.view','student.update','student.promote','student.transfer'],
    OPERATOR: ['student.view','student.create','student.update'],
    TEACHER: ['student.view'],
    VIEWER: ['student.view'],
  };
  for (const [name, codes] of Object.entries(rolePermissions) as [UserRole, string[]][]) {
    const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
    for (const code of codes) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { code } });
      await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
    }
  }
  console.log('RBAC seed completed');
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

