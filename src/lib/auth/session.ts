import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { findRegisteredAdminUser } from "@/lib/auth/adminUsers";

const cookieName = "hideout_admin";

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;

  if (!value) {
    throw new Error("AUTH_SECRET is required for admin sessions.");
  }

  return new TextEncoder().encode(value);
}

export async function isLocalhostRequest(): Promise<boolean> {
  const host = (await headers()).get("host") ?? "";

  return (
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host === "localhost"
  );
}

export async function assertLocalAdminAllowed(): Promise<void> {
  if (
    process.env.LOCAL_ADMIN_ONLY !== "false" &&
    !(await isLocalhostRequest())
  ) {
    throw new Error("Admin is localhost-only in v1.");
  }
}

export async function verifyAdminPassword(
  username: string,
  password: string,
): Promise<boolean> {
  const registeredUser = await findRegisteredAdminUser(username);

  if (registeredUser) {
    return bcrypt.compare(password, registeredUser.passwordHash);
  }

  const expectedUser = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUser || !passwordHash) {
    return false;
  }

  if (username !== expectedUser) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}

export async function createAdminSession(username: string): Promise<void> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete(cookieName);
}

export async function getAdminUser(): Promise<{ username: string } | null> {
  const token = (await cookies()).get(cookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const result = await jwtVerify(token, secret());
    const username = result.payload.username;

    return typeof username === "string" ? { username } : null;
  } catch {
    return null;
  }
}
