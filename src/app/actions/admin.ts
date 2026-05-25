"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return supabase;
}

export async function approveUser(userId: string) {
  const supabase = await requireAdmin();
  await supabase.from("users").update({ status: "approved" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function banUser(userId: string) {
  const supabase = await requireAdmin();
  await supabase.from("users").update({ status: "banned" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function updateUserName(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) throw new Error("Invalid name");
  const supabase = await requireAdmin();
  await supabase.from("users").update({ name: trimmed }).eq("id", userId);
  revalidatePath("/admin");
}

export async function updateUserRole(userId: string, role: "admin" | "member") {
  const supabase = await requireAdmin();
  await supabase.from("users").update({ role }).eq("id", userId);
  revalidatePath("/admin");
}
