import { z } from "zod";

export const verifySchema = z.object({
  code: z
    .number()
    .min(6, "Verificatio Code must be at least 6 digits long"),
});
