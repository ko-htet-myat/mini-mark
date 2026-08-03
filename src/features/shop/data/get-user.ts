import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";

export const getUserByEmail = cache(async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) notFound();
  return user;
});
