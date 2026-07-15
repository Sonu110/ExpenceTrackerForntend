const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";


type FetchOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, string>;
  body?: any; 
};

export async function fetchClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers, body, ...rest } = options;

  // 1. Build Query Parameters safely
  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isFormData = body instanceof FormData;


  // 2. Format request headers cleanly
  const requestHeaders: Record<string, string> = {
    ...headers,
  } as Record<string, string>;

  // Only apply JSON Content-Type if it is NOT a file-based form data stream
  if (body && !isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 3. Process the actual payload structure safely
  let processedBody: any = undefined;
  if (body) {
    processedBody = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${url}${query}`, {
    headers: requestHeaders,
    body: processedBody, // Maps the processed data safely
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw error;
  }

  return res.json();
}
