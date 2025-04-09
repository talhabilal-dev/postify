import { z } from "zod";

export const messageSchema = z.object({
  message: z
    .string()
    .min(10, "Message must be at least 10 character long")
    .max(400, "Message must be at most 400 characters long"),
});
