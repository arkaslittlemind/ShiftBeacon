import type { z } from "zod";
import { apiError } from "@/lib/api/response";

type ParseJsonBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: ReturnType<typeof apiError> };

export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema
): Promise<ParseJsonBodyResult<z.infer<Schema>>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { ok: false, response: apiError(400, "Invalid JSON body") };
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(", ");
    return { ok: false, response: apiError(400, message) };
  }

  return { ok: true, data: result.data };
}
