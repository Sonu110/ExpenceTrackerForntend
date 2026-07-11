const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

console.log(BASE_URL);

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function fetchClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {

  const { params, headers, ...rest } = options;

  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";


  const token = localStorage.getItem("token");


  const res = await fetch(`${BASE_URL}${url}${query}`, {

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`
      }),

      ...headers,
    },

    ...rest,

  });


  if (!res.ok) {

    const error = await res.json().catch(() => ({}));

    throw error;

  }


  return res.json();

}