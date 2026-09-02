import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error('Usage: npm run admin:super-admin -- email@example.com');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Supabase admin environment is incomplete');
const supabase = createClient(url, key, { auth: { persistSession: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });
try {
  const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw listed.error;
  const user = listed.data.users.find((item) => item.email?.toLowerCase() === email);
  if (!user) throw new Error(`Supabase Auth user not found: ${email}`);
  const role = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (!role) throw new Error('SUPER_ADMIN role not found; run prisma db seed first');
  const profile = await prisma.userProfile.upsert({ where: { authId: user.id }, update: { email: user.email ?? email, isActive: true }, create: { authId: user.id, email: user.email ?? email, isActive: true } });
  await prisma.userRoleAssignment.upsert({ where: { userId_roleId: { userId: profile.id, roleId: role.id } }, update: {}, create: { userId: profile.id, roleId: role.id } });
  console.log(`SUPER_ADMIN assigned successfully to ${email}`);
} finally { await prisma.$disconnect(); }
