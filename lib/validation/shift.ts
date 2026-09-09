import { z } from "zod";
import type { ClockInInput, ClockOutInput } from "@/types/shift";

export const clockInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  note: z.string().trim().min(1).optional(),
}) satisfies z.ZodType<ClockInInput>;

export const clockOutSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  note: z.string().trim().min(1).optional(),
}) satisfies z.ZodType<ClockOutInput>;
