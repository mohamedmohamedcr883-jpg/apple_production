import { z } from "zod";
import { safeString } from "../../utils/common/validation";

const productInfoSchema = z.object({
  quantity: z.number().int().positive("Quantity must be positive integer"),
  size: z.string().optional(),
});

// Transaction schema
export const createTransactionSchema = z.object({
  name: safeString(3),
  email: z.string().email("Invalid email address"),
  phoneNumber: safeString(11),
  city: safeString(2),
  address: safeString(10),
  paymentMethod: z.enum(["cash"]),
  totalPrice: z.number().positive("Total price must be positive"),
  products: z
    .record(z.string(), productInfoSchema)
    .refine((val) => Object.keys(val).length > 0, {
      message: "Products cannot be empty",
    }),
  status: z.boolean().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
