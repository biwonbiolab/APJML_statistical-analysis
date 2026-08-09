import { NextRequest } from "next/server";

// Constant-time-ish comparison of the admin key.
export function isAdmin(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const provided =
    req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key") ?? "";
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return diff === 0;
}
