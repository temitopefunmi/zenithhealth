import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function requireRole(role) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== role) {
    throw new Error("FORBIDDEN");
  }

  return session;
}