import { z } from "zod";

export const accountSchema = z.object({
    name: z.string().min(1, "Name must be at least of 1 characters"),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.coerce.number().min(1, "Initial balance is required"),
    isDefault: z.boolean().default(false),

})