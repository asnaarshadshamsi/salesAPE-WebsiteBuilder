"use server";

import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  setAuthCookie,
  removeAuthCookie,
  getCurrentUser,
} from "@/lib/auth";
import { redirect } from "next/navigation";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      },
    });

    // Set auth cookie
    await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { success: true };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: "Failed to sign in" };
  }
}

export async function signOut(): Promise<void> {
  await removeAuthCookie();
  redirect("/");
}

export async function getSession() {
  return getCurrentUser();
}
