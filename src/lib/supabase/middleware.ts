import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ⚠️ getUser() はトークン検証 + 期限切れなら自動リフレッシュを行う。
  //    リフレッシュされた新しいトークンは supabaseResponse の Cookie に格納される。
  //    その後にリダイレクトする場合は必ず withCookies() を使うこと。
  //    使わないと、ローテーション済み refresh_token がブラウザに届かず
  //    次回アクセスで認証失敗 → ログアウトが発生する。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // --- 未ログインユーザーの保護ルート ---
  const protectedPaths = ["/posts/new", "/profile", "/admin"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return withCookies(NextResponse.redirect(url), supabaseResponse);
  }

  // --- ログイン済みユーザーのステータスチェック ---
  // /pending・/auth/* はスキップ（無限ループ防止）
  const isStatusCheckSkip =
    pathname.startsWith("/pending") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  if (user && !isStatusCheckSkip) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending";
      return withCookies(NextResponse.redirect(url), supabaseResponse);
    }

    if (profile?.status === "banned") {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("error", "banned");
      return withCookies(NextResponse.redirect(url), supabaseResponse);
    }

    // /admin は admin ロールのみ
    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return withCookies(NextResponse.redirect(url), supabaseResponse);
    }
  }

  return supabaseResponse;
}

/**
 * リダイレクトレスポンスに、supabaseResponse で更新されたセッション Cookie をコピーして返す。
 *
 * Supabase はリフレッシュトークンをローテーションするため、
 * getUser() 後にリダイレクトする場合、更新済み Cookie を
 * リダイレクトレスポンスに含めなければ次回リクエストで認証が壊れる。
 */
function withCookies(redirect: NextResponse, supabaseResponse: NextResponse): NextResponse {
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirect.cookies.set(name, value, options);
  });
  return redirect;
}
