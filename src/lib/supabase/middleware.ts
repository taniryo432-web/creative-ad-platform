import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ユーザーステータス/ロールのキャッシュ Cookie
// 毎リクエストで Supabase DB を叩くのを防ぐ
const STATUS_KEY = "ff-sc"; // ff status cache
const ROLE_KEY   = "ff-rc"; // ff role cache

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

  // ⚠️ getUser() はトークン検証 + 期限切れなら自動リフレッシュ
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
  const isStatusCheckSkip =
    pathname.startsWith("/pending") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  if (user && !isStatusCheckSkip) {
    // ── キャッシュ Cookie から読み取り（DB クエリを省略） ──
    const cachedStatus = request.cookies.get(STATUS_KEY)?.value;
    const cachedRole   = request.cookies.get(ROLE_KEY)?.value;

    let status = cachedStatus;
    let role   = cachedRole;

    if (!cachedStatus || !cachedRole) {
      // キャッシュミス → DB から取得
      const { data: profile } = await supabase
        .from("users")
        .select("role, status")
        .eq("id", user.id)
        .single();

      status = profile?.status;
      role   = profile?.role;

      if (status && role) {
        // approved: 5分キャッシュ / pending: 20秒（承認後に素早く反映）
        const ttl = status === "approved" ? 300 : 20;
        const cookieOpts = { maxAge: ttl, path: "/", sameSite: "lax" as const };
        supabaseResponse.cookies.set(STATUS_KEY, status, cookieOpts);
        supabaseResponse.cookies.set(ROLE_KEY,   role,   cookieOpts);
      }
    }

    if (status === "pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending";
      return withCookies(NextResponse.redirect(url), supabaseResponse);
    }

    if (status === "banned") {
      await supabase.auth.signOut();
      // キャッシュ Cookie を削除
      supabaseResponse.cookies.set(STATUS_KEY, "", { maxAge: 0, path: "/" });
      supabaseResponse.cookies.set(ROLE_KEY,   "", { maxAge: 0, path: "/" });
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("error", "banned");
      return withCookies(NextResponse.redirect(url), supabaseResponse);
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return withCookies(NextResponse.redirect(url), supabaseResponse);
    }
  }

  return supabaseResponse;
}

/**
 * リダイレクトレスポンスに、supabaseResponse で更新されたセッション Cookie をコピーする。
 * トークンリフレッシュ後のリダイレクト時に Cookie が消えるのを防ぐ。
 */
function withCookies(redirect: NextResponse, supabaseResponse: NextResponse): NextResponse {
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirect.cookies.set(name, value, options);
  });
  return redirect;
}
