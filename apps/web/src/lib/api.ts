const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type ApiErrorBody = {
  success?: false;
  error?: {
    code?: string;
    message?: string;
  };
};

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(typeof init.body === "string"
        ? { "content-type": "application/json" }
        : {}),
      ...(token
        ? {
            authorization: `Bearer ${token}`,
          }
        : {}),
      ...init.headers,
    },
  });

  let body: ApiErrorBody & {
    success?: boolean;
    data?: T;
  };

  try {
    body = await response.json();
  } catch {
    throw new Error("Sunucudan geçersiz yanıt alındı.");
  }

  if (!response.ok || body.success === false) {
    if (response.status === 401) {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
    }

    throw new Error(
      body.error?.message ?? "İstek gerçekleştirilemedi.",
    );
  }

  return body.data as T;
}
