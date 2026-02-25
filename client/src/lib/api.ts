// Custom fetch wrapper to handle JWT auth
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("learnai_token");
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Auto-set JSON content type if not FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("learnai_token");
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // Ignore parse error
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (res.status === 204) return null;
  
  return res.json();
}
