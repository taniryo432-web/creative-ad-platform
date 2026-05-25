import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingUser) {
        await supabase.from("users").insert({
          id: data.user.id,
          name: data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "ユーザー",
          icon_url: data.user.user_metadata?.avatar_url ?? null,
          email: data.user.email ?? null,
          role: "member",
          status: "pending",
        });
        // 新規ユーザーは承認待ち画面へ
        return NextResponse.redirect(`${origin}/pending`);
      }

      // 既存ユーザーのステータスを確認
      const { data: profile } = await supabase
        .from("users")
        .select("status")
        .eq("id", data.user.id)
        .single();

      if (profile?.status === "pending") {
        return NextResponse.redirect(`${origin}/pending`);
      }
      if (profile?.status === "banned") {
        return NextResponse.redirect(`${origin}/auth/login?error=banned`);
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
