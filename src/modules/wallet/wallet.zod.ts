import z from "zod";

export const CreateWalletSchema = z.object({
  user: z.string({ message: "Wallet user is invalid!" }),
  email: z.email({ message: "Wallet email address is invalid!" }),
});
