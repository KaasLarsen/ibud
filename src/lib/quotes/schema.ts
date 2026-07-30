import { z } from "zod";

export const quoteRequestSchema = z.object({
  modelId: z.string().min(1),
  storageGb: z.number().int().positive(),
  condition: z.object({
    worksNormally: z.boolean(),
    screenIntact: z.boolean(),
    cosmetic: z.enum(["fine", "scratches", "damaged"]),
    battery: z.enum(["ok", "poor"]),
  }),
});
