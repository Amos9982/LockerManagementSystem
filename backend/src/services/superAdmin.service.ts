import { prisma } from '../models/prisma/client';
import bcrypt from 'bcryptjs';

export async function loginSuperAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.password || '');
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  // Return minimal user info
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
