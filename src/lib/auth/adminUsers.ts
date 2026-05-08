import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredAdminUser = {
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAdminUserInput = {
  username: string;
  password: string;
  passwordConfirm: string;
};

export type RegisterAdminUserResult =
  | {
      ok: true;
      username: string;
    }
  | {
      ok: false;
      error: string;
    };

const dataDirectory = path.join(process.cwd(), ".data");
const usersFilePath = path.join(dataDirectory, "admin-users.json");

const usernamePattern = /^[a-zA-Z0-9_-]{3,32}$/;
const minimumPasswordLength = 10;

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function isStoredAdminUser(value: unknown): value is StoredAdminUser {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<StoredAdminUser>;

  return (
    typeof candidate.username === "string" &&
    typeof candidate.passwordHash === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

async function readAdminUsers(): Promise<StoredAdminUser[]> {
  try {
    const raw = await readFile(usersFilePath, "utf8");
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Admin users file must contain an array.");
    }

    return parsed.filter(isStoredAdminUser);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeAdminUsers(users: StoredAdminUser[]): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  const temporaryPath = `${usersFilePath}.${randomUUID()}.tmp`;
  const serialized = `${JSON.stringify(users, null, 2)}\n`;

  await writeFile(temporaryPath, serialized, {
    encoding: "utf8",
    mode: 0o600,
  });

  await rename(temporaryPath, usersFilePath);
}

export async function getRegisteredAdminUsers(): Promise<StoredAdminUser[]> {
  return readAdminUsers();
}

export async function countRegisteredAdminUsers(): Promise<number> {
  const users = await readAdminUsers();
  return users.length;
}

export async function findRegisteredAdminUser(
  username: string,
): Promise<StoredAdminUser | null> {
  const normalizedUsername = normalizeUsername(username);
  const users = await readAdminUsers();

  return users.find((user) => user.username === normalizedUsername) ?? null;
}

export async function isAdminRegistrationOpen(): Promise<boolean> {
  const users = await readAdminUsers();

  if (users.length === 0) {
    return true;
  }

  return process.env.ADMIN_REGISTRATION_ENABLED === "true";
}

export async function registerAdminUser(
  input: RegisterAdminUserInput,
): Promise<RegisterAdminUserResult> {
  const username = normalizeUsername(input.username);
  const password = input.password;
  const passwordConfirm = input.passwordConfirm;

  if (!usernamePattern.test(username)) {
    return {
      ok: false,
      error:
        "Username must be 3-32 characters and can only use letters, numbers, underscore, or dash.",
    };
  }

  if (password.length < minimumPasswordLength) {
    return {
      ok: false,
      error: `Password must be at least ${minimumPasswordLength} characters.`,
    };
  }

  if (password !== passwordConfirm) {
    return {
      ok: false,
      error: "Password confirmation does not match.",
    };
  }

  const users = await readAdminUsers();
  const registrationOpen =
    users.length === 0 || process.env.ADMIN_REGISTRATION_ENABLED === "true";

  if (!registrationOpen) {
    return {
      ok: false,
      error:
        "Registration is closed. Set ADMIN_REGISTRATION_ENABLED=true to allow more admin users.",
    };
  }

  const usernameAlreadyExists = users.some(
    (user) => user.username === username,
  );

  if (usernameAlreadyExists) {
    return {
      ok: false,
      error: "This username is already registered.",
    };
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 12);

  const nextUsers: StoredAdminUser[] = [
    ...users,
    {
      username,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await writeAdminUsers(nextUsers);

  return {
    ok: true,
    username,
  };
}
