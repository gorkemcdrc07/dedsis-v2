import { api } from "../../lib/api";

export type AuthUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
};

export type AuthRole = {
  code: string;
  name: string;
};

export type CurrentSession = {
  user: AuthUser;
  roles: AuthRole[];
  permissions: string[];
};

type LoginResponse = {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt?: number;
  };
  user: AuthUser;
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = await api<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  sessionStorage.setItem(
    "access_token",
    data.session.accessToken,
  );

  sessionStorage.setItem(
    "refresh_token",
    data.session.refreshToken,
  );

  return data;
}

export async function getCurrentSession(): Promise<CurrentSession> {
  return api<CurrentSession>("/api/v1/auth/me");
}

export async function logout(): Promise<void> {
  try {
    await api("/api/v1/auth/logout", {
      method: "POST",
    });
  } finally {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    window.location.href = "/login";
  }
}

export function isAuthenticated(): boolean {
  return Boolean(sessionStorage.getItem("access_token"));
}
