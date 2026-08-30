import { NextResponse } from "next/server";

// Conventions for every /api/* route:
//   200 ok, 401 unauthenticated, 403 forbidden (role/org mismatch),
//   404 not found, 500 server error.
// Success responses are `{ data }`; errors are `{ error: { message } }`.

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function apiError(status: number, message: string) {
  return NextResponse.json({ error: { message } }, { status });
}
