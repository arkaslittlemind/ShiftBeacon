import { z } from "zod";

export const updateOrganizationSchema = z
  .object({
    name: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    clockInRadiusMeters: z.number().int().positive(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
