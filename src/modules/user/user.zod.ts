import z from "zod";
import { UserRole } from "./user.interface";

export const UserRoleEnum = z.enum(Object.values(UserRole));

export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string().regex(/^01[3-9]\d{8}$/, {
    message:
      "Phone number must be a valid Bangladeshi local format (e.g., 017XXXXXXXX)",
  }),
  password: z
    .string()
    .length(5, { message: "PIN must be exactly 5 digits" })
    .regex(/^\d+$/, { message: "PIN must contain only numbers" }),
  role: UserRoleEnum,
  profilePicture: z.string().optional().nullish().default(null),
  nid: z.string().length(10, { message: "NID must be exactly 10 digits long" }),
  address: z.string().optional(),
  dateOfBirth: z.iso.date(),
});
