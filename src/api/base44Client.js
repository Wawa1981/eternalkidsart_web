// Client "Base44-like" qui parle à ton backend Express.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

const TOKEN_KEY = "auth_token";

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function http(path, { method = "GET", headers = {}, body } = {}) {
  const token = getToken();

  const finalHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      data && (data.error || data.message) ? (data.error || data.message) : res.statusText;
    throw new Error(`${method} ${path} -> ${res.status} ${msg}`);
  }
  return data;
}

function qs(obj = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

function makeEntity(name) {
  return {
    async list(sort = null, limit = null) {
      const query = {};
      if (sort) query.sort = sort;
      if (limit) query.limit = limit;
      return http(`/api/entities/${name}${qs(query)}`);
    },

    async filter(where = {}, sort = null, limit = null) {
      const query = { ...where };
      if (sort) query.sort = sort;
      if (limit) query.limit = limit;
      return http(`/api/entities/${name}${qs(query)}`);
    },

    async create(payload) {
      return http(`/api/entities/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      });
    },

    async update(id, patch) {
      return http(`/api/entities/${name}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch ?? {}),
      });
    },

    async delete(id) {
      return http(`/api/entities/${name}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}

export const base44 = {
  auth: {
    // ✅ maintenant envoie Authorization automatiquement via http()
    async me() {
      return http("/api/auth/me");
    },

    // ✅ stocke le token, et renvoie seulement le user (comme avant)
    async login({ email, password }) {
      const out = await http("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // backend JWT: { user, token }
      if (out?.token) setToken(out.token);
      return out?.user ?? out; // compat
    },

    // ✅ pareil pour register
    async register({ full_name, email, password }) {
      const out = await http("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password }),
      });

      if (out?.token) setToken(out.token);
      return out?.user ?? out;
    },

    // ✅ logout = supprimer token côté client
    async logout() {
      clearToken();
      // optionnel: appeler le backend (pas nécessaire mais ok)
      try {
        await http("/api/auth/logout", { method: "POST" });
      } catch {}
      return { ok: true };
    },

    redirectToLogin(tab = "login") {
      window.dispatchEvent(new CustomEvent("auth:open", { detail: { tab } }));
    },

    // utilitaires si besoin ailleurs
    getToken,
    clearToken,
  },

  entities: {
    Drawing: makeEntity("drawing"),
    Album: makeEntity("album"),
    Child: makeEntity("child"),
    Post: makeEntity("post"),
    Like: makeEntity("like"),
    PostComment: makeEntity("postComment"),
    Message: makeEntity("message"),
    User: makeEntity("user"),
  },

  integrations: {
    Core: {
      async UploadFile({ file }) {
        const fd = new FormData();
        fd.append("file", file);

        const out = await http("/api/integrations/core/upload-file", {
          method: "POST",
          body: fd,
          // ne pas forcer Content-Type avec FormData
        });

        if (out?.file_url && out.file_url.startsWith("/")) {
          return { file_url: `${API_BASE}${out.file_url}` };
        }
        return out;
      },

      async GenerateImage(payload) {
        return http("/api/integrations/core/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload ?? {}),
        });
      },
    },
  },
};
