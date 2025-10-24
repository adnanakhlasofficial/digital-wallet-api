import z from "zod";

export const transactionPayloadSchema = z.object({
  amount: z.number().positive(),
  receiver: z.string().regex(/^01[3-9]\d{8}$/, {
    message:
      "Phone number must be a valid Bangladeshi local format (e.g., 017XXXXXXXX)",
  }),
});
