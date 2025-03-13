'use server';

import { User } from "@/types/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  throw new Error("BACKEND_URL が設定されていません");
}

export const register = async (formData: FormData) => {
  try {
    const user = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      password_confirmation: formData.get("password_confirmation") as string,
    }

    if (!user.name || !user.email || !user.password || !user.password_confirmation) {
      throw new Error("必要な情報が不足しています");
    }

    const { xsrfToken, laravelSession } = await getCsrfTokenAndSession(backendUrl);

    if (!xsrfToken || !laravelSession) {
      throw new Error("CSRFトークンとセッションの取得に失敗しました");
    }

    const res = await fetch(`${backendUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
        Cookie: `laravel_session=${laravelSession}`,
        Accept: "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      throw new Error(`登録に失敗しました: ${res.status} ${res.statusText}`);
    }
    const setCookie = res.headers.get("set-cookie");

    if (!setCookie) {
      throw new Error("Cookie が設定されていません");
    }

    const sessionMatch = setCookie.match(/laravel_session=([^;]+)/);
    const xsrfTokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);

    if (!sessionMatch || !xsrfTokenMatch) {
      throw new Error("Cookie が不正です");
    }

    const cookieStore = await cookies();
    cookieStore.set("laravel_session", sessionMatch[1], { httpOnly: true });
    cookieStore.set("XSRF-TOKEN", xsrfTokenMatch[1], { httpOnly: true });
  } catch (error) {
    console.error("登録中にエラーが発生しました:", error);
  }

  redirect("/dashboard");
}

export const login = async (formData: FormData): Promise<void> => {
  try {
    const user = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    if (!user.email || !user.password) {
      throw new Error("必要な情報が不足しています"); 
    }

    // CSRFトークンとセッションを取得
    const { xsrfToken, laravelSession } = await getCsrfTokenAndSession(backendUrl);
    if (!xsrfToken || !laravelSession) {
      throw new Error("CSRFトークンまたは Laravel セッションの取得に失敗しました");
    }

    // console.log("送信するXSRF-TOKEN:", xsrfToken);
    // console.log("送信するCookie:", laravelSession);

    // ユーザー登録リクエスト
    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
        Cookie: `laravel_session=${laravelSession}`,
        Accept: "application/json",
      },
      body: JSON.stringify(user),
    });

    console.log("登録リクエスト結果:", res.status, res.statusText);
    // JSONレスポンスがあるかを確認
    const contentType = res.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      const responseJson = await res.json();
      console.log("レスポンス:", responseJson);
    } else if (res.status !== 204) {
      console.warn("予期しないレスポンス:", await res.text());
    }
    const setCookie = res.headers.get("set-cookie");
    // console.log("setCookie:", setCookie);
  if (setCookie) {
    const sessionMatch = setCookie.match(/laravel_session=([^;]+)/);
    const xsrfTokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (sessionMatch && xsrfTokenMatch) {
      const cookieStore = await cookies();
      cookieStore.set("XSRF-TOKEN", xsrfTokenMatch[1], { httpOnly: true });
      cookieStore.set("laravel_session", sessionMatch[1], { httpOnly: true });
    }
  }
  } catch (error) {
    console.error(error);
  }

  redirect('/dashboard');
}

export const logout = async (): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const xsrfToken = cookieStore.get("XSRF-TOKEN");
    const laravelSession = cookieStore.get("laravel_session");

    if (!xsrfToken || !laravelSession) {
      return redirect("/login");
    }

    const res = await fetch(`${backendUrl}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(xsrfToken.value),
        Cookie: `laravel_session=${laravelSession.value}`,
        Accept: "application/json",
      },
    });

    if (res.status === 204) {
      cookieStore.delete("XSRF-TOKEN");
      cookieStore.delete("laravel_session");
    }

    console.log(res.status, res.statusText);
    console.log("レスポンスボディ:", await res.text());
  } catch (error) {
    console.error(error);
  }

  redirect("/login");
}

export const getCsrfTokenAndSession = async (backendUrl: string) => {
  try {
    const csrfResponse = await fetch(`${backendUrl}/sanctum/csrf-cookie`, { method: "GET" });

    if (!csrfResponse.ok) {
      throw new Error(`CSRF取得エラー: ${csrfResponse.status} ${csrfResponse.statusText}`);
    }

    const setCookieHeader = csrfResponse.headers.get("set-cookie");
    if (!setCookieHeader) {
      throw new Error("CSRF Cookie が取得できませんでした");
    }

    // Cookie 解析処理
    const parseCookie = (name: string) =>
      setCookieHeader
        .split(",")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.split(";")[0]
        ?.split("=")[1];

    const xsrfToken = parseCookie("XSRF-TOKEN");
    const laravelSession = parseCookie("laravel_session");

    if (!xsrfToken || !laravelSession) {
      throw new Error("必要なCookie情報が不足しています");
    }

    return { xsrfToken, laravelSession };
  } catch (error) {
    console.error("CSRFトークンとセッションの取得中にエラー:", error);
    return { xsrfToken: null, laravelSession: null };
  }
};

export const checkAuth = cache(async (): Promise<User> => {
  const cookieStore = await cookies();
  const laravelSession = cookieStore.get('laravel_session');
  const xsrfToken = cookieStore.get('XSRF-TOKEN');

  if (!laravelSession || !xsrfToken) {
    // 未ログインの場合は「/login」へリダイレクト
    redirect('/login');
  }

  // Laravelの認証状態を確認するエンドポイント（例：/api/userなど）で認証状態を確認する

  const res = await fetch(`${backendUrl}/user`, {
    method: "GET",
    headers: {
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken.value),
      Cookie: `laravel_session=${laravelSession.value}`,
      Accept: "application/json",
    },
    cache: 'no-store' // 必ず最新の情報を取得
  });

  const data: User = await res.json();

  if (res.status === 401) {
    // 未認証の場合は「/login」へリダイレクト
    redirect('/login');
  }

  return data; // 認証されていればtrue
});