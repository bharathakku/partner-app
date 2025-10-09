export const api = {
  async get(path, init) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${base}${path}`, {
      credentials: "include",
      ...(init || {}),
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `GET ${path} failed`);
    }
    return res.json();
  },
  async post(path, body, init) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      credentials: "include",
      ...(init || {}),
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `POST ${path} failed`);
    }
    return res.json();
  },
};


