import crypto from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "nihal_admin";

function getSecret() {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

export async function isAdminAuthenticated() {
  const secret = getSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature) return false;

  const expected = sign(value);
  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function setAdminCookie() {
  const value = "admin";
  const cookieStore = await cookies();
  cookieStore.set(cookieName, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/admin",
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/admin",
  });
}
