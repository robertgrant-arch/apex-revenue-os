export interface ApiResponse<T = unknown> { data: T; message?: string; }

export interface ApiErrorResponse {
  error: string; message: string; statusCode: number;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: Record<string, string[]>;
  constructor(message: string, statusCode: number, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean | null | undefined>;
  timeout?: number;
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | null | undefined>): string {
  const base = getBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`, typeof window !== "undefined" ? window.location.origin : undefined);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function buildHeaders(init?: HeadersInit, hasBody = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (init) {
    const existing = new Headers(init);
    existing.forEach((value, key) => { headers[key] = value; });
  }
  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let body: Partial<ApiErrorResponse> = {};
  try {
    const text = await response.text();
    if (text) body = JSON.parse(text);
  } catch { /* not JSON */ }
  const message = body.message ?? body.error ?? response.statusText ?? `Request failed with status ${response.status}`;
  return new ApiError(message, response.status, body.details);
}

async function request<T = unknown>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string, body?: unknown, options: RequestOptions = {}
): Promise<T> {
  const { params, timeout = 30_000, headers: initHeaders, ...rest } = options;
  const url = buildUrl(path, params);
  const hasBody = body !== undefined;
  const headers = buildHeaders(initHeaders, hasBody);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let response: Response;
  try {
    response = await fetch(url, {
      method, headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal, ...rest,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(`Request timed out after ${timeout}ms`, 408);
    }
    throw new ApiError(err instanceof Error ? err.message : "Network request failed", 0);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return {} as T;
  if (!response.ok) throw await parseErrorResponse(response);

  try {
    const json = await response.json();
    return json as T;
  } catch {
    throw new ApiError("Failed to parse server response as JSON", 500);
  }
}

export const apiClient = {
  get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("GET", path, undefined, options);
  },
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("POST", path, body, options);
  },
  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", path, body, options);
  },
  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", path, body, options);
  },
  del<T = void>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", path, undefined, options);
  },
};

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getFieldErrors(error: unknown): Record<string, string> | null {
  if (!isApiError(error) || !error.details) return null;
  return Object.fromEntries(
    Object.entries(error.details).map(([field, messages]) => [field, messages[0] ?? "Invalid value"])
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred. Please try again.";
}

export default apiClient;
