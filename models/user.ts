import { PrismaClient, type User } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export interface NewUser {
  email: string;
  password: string;
}

export type UserRow = User;

export async function findByEmail(email: string): Promise<UserRow | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  return user ?? null;
}

export async function createUser(data: NewUser): Promise<UserRow> {
  const created = await prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
    },
  });
  if (!created) {
    throw new Error('Failed to create user');
  }
  return created;
}
