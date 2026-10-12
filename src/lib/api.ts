/**
 * API client — interface moja kwa mawasiliano na backend (`/api/*`).
 * Kila hitilafu huonekana kama `ApiError` yenye ujumbe wa Kiswahili.
 */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Options = RequestInit & { timeoutMs?: number };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { timeoutMs = 20_000, headers, ...rest } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(path, {
      credentials: "same-origin",
      cache: "no-store",
      ...rest,
    headers: {
      Accept: "application/json",
      // JSON body pekee — FormData ina SURD yake ya mipaka (multipart).
      ...(typeof rest.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...(headers ?? {}),
    },
      signal: controller.signal,
    });
  } catch {
    clearTimeout(timer);
    throw new ApiError(
      "Imeshindikana kuunganisha na seva. Hakikisha una mtandao.",
      0,
    );
  }
  clearTimeout(timer);

  let data: (T & { ok?: boolean; error?: string }) | null = null;
  try {
    data = (await res.json()) as T & { ok?: boolean; error?: string };
  } catch {
    data = null;
  }

  if (!res.ok || data?.ok === false) {
    throw new ApiError(
      data?.error ?? `Hitilafu ya seva (${res.status}). Jaribu tena.`,
      res.status,
    );
  }

  return data as T;
}

export function apiGet<T>(path: string, options?: Options): Promise<T> {
  return request<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: Options,
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: Options,
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
}

export function apiDelete<T>(path: string, options?: Options): Promise<T> {
  return request<T>(path, { ...options, method: "DELETE" });
}

/** Pilisha faili (multipart) — mfano: picha ya bidhaa. */
export function apiForm<T>(
  path: string,
  formData: FormData,
  options?: Options,
): Promise<T> {
  return request<T>(path, { ...options, method: "POST", body: formData });
}

/** Ujumbe wa hitilafu unaonyesha kwenye fomu (daima wa Kiswahili). */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Hitilafu imetokea. Jaribu tena.";
}
