import crypto from "node:crypto";
import { purgeCache } from "@netlify/functions";

const SESSION_COOKIE = "ph_cache_admin";
const SESSION_LIFETIME_MS = 30 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT = 6;
const attempts = new Map();

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

const response = (statusCode, payload, extraHeaders = {}) => ({
  statusCode,
  headers: { ...headers, ...extraHeaders },
  body: JSON.stringify(payload)
});

const getConfig = () => ({
  password: process.env.ADMIN_CACHE_PASSWORD || "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET || ""
});

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const parseCookies = (cookieHeader = "") => Object.fromEntries(
  cookieHeader.split(";").map(part => part.trim()).filter(Boolean).map(part => {
    const separator = part.indexOf("=");
    if (separator < 0) return [part, ""];
    return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
  })
);

const sign = (value, secret) => crypto.createHmac("sha256", secret).update(value).digest("base64url");

const createSession = secret => {
  const payload = Buffer.from(JSON.stringify({ expiresAt: Date.now() + SESSION_LIFETIME_MS })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
};

const verifySession = (token, secret) => {
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(data.expiresAt) > Date.now();
  } catch {
    return false;
  }
};

const sameOrigin = event => {
  const origin = event.headers.origin;
  const host = event.headers.host;
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; }
  catch { return false; }
};

const getClientIp = event => event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"]?.split(",")[0] || "unknown";

const isRateLimited = ip => {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || now - current.startedAt > LOGIN_WINDOW_MS) {
    attempts.set(ip, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > LOGIN_LIMIT;
};

const clearAttempts = ip => attempts.delete(ip);

export const handler = async (event, context) => {
  const config = getConfig();
  const configured = config.password.length >= 12 && config.sessionSecret.length >= 32;
  const cookies = parseCookies(event.headers.cookie);
  const authenticated = verifySession(cookies[SESSION_COOKIE], config.sessionSecret);

  if (event.httpMethod === "GET") {
    return response(200, { configured, authenticated });
  }

  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, message: "Phương thức không được hỗ trợ." }, { Allow: "GET, POST" });
  }

  if (!sameOrigin(event)) return response(403, { ok: false, message: "Yêu cầu không cùng nguồn." });

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return response(400, { ok: false, message: "Dữ liệu gửi lên không hợp lệ." }); }

  if (body.action === "logout") {
    return response(200, { ok: true }, {
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
    });
  }

  if (!configured) {
    return response(503, { ok: false, message: "Admin cache chưa được cấu hình biến môi trường trên Netlify." });
  }

  if (body.action === "login") {
    const ip = getClientIp(event);
    if (isRateLimited(ip)) return response(429, { ok: false, message: "Đăng nhập sai quá nhiều lần. Hãy thử lại sau 15 phút." });
    if (!safeEqual(body.password || "", config.password)) {
      return response(401, { ok: false, message: "Mật khẩu không chính xác." });
    }
    clearAttempts(ip);
    const session = createSession(config.sessionSecret);
    return response(200, { ok: true, authenticated: true }, {
      "Set-Cookie": `${SESSION_COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_LIFETIME_MS / 1000}`
    });
  }

  if (!authenticated) return response(401, { ok: false, message: "Phiên đăng nhập đã hết hạn." });
  if (body.action !== "purge") return response(400, { ok: false, message: "Hành động không hợp lệ." });

  try {
    const purgeToken = context?.clientContext?.custom?.purge_api_token;
    if (!purgeToken) return response(503, { ok: false, message: "Netlify chưa cấp purge token cho Function. Hãy deploy lại website." });
    await purgeCache({ token: purgeToken });
    return response(200, { ok: true, purgedAt: new Date().toISOString(), message: "Đã yêu cầu Netlify xóa CDN cache." });
  } catch (error) {
    console.error("Netlify cache purge error", error);
    return response(502, { ok: false, message: "Không thể kết nối Netlify Purge API." });
  }
};
