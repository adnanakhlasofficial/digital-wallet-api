import z from "zod";

export const AgentRequestZodSchema = z.object({
  email: z.email(),
  message: z.string().min(10, "Message cannot be empty"),
});
