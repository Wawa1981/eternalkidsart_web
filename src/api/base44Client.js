// Client "Base44-like" qui parle à ton backend Express (server/server.js).
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

async function http(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
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
    // list(sort, limit) => GET /api/entities/:name?sort=-created_date&limit=50
    async list(sort = null, limit = null) {
      const query = {};
      if (sort) query.sort = sort;
      if (limit) query.limit = limit;
      return http(`/api/entities/${name}${qs(query)}`);
    },

    // filter(where, sort, limit) => GET /api/entities/:name?field=value&sort=...&limit=...
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

    // nécessaire pour Like.delete(...) / etc
    async delete(id) {
      return http(`/api/entities/${name}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}

export const base44 = {
  auth: {
    async me() {
      return http("/api/auth/me");
    },
    async login({ email, password }) {
      return http("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    },
    async register({ full_name, email, password }) {
      return http("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password }),
      });
    },
    async logout() {
      return http("/api/auth/logout", { method: "POST" });
    },
    redirectToLogin(tab = "login") {
      window.dispatchEvent(new CustomEvent("auth:open", { detail: { tab } }));
    },
  },

  entities: {
    // ✅ déjà OK
    Drawing: makeEntity("drawing"),
    Album: makeEntity("album"),
    Child: makeEntity("child"),

    // ✅ Community (doivent aussi exister côté serveur /api/entities)
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
        });

        // server renvoie { file_url: "/uploads/xxx" } => URL absolue
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
