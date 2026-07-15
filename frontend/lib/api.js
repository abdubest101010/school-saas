const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Wraps fetch with the Authorization header already attached. Use this for
// any call to a protected backend route once you're building the
// admin/teacher/student creation forms.
export async function authFetch(accessToken, path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}
