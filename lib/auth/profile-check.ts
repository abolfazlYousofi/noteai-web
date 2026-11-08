import prisma from '@/lib/prisma';

export async function isProfileComplete(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, major: true, university: true }
  });

  if (!user) return false;
  return !!(user.name && user.major && user.university);
}