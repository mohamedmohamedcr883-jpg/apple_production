import { z } from "zod";
// List of suspicious SQL keywords or characters
const forbiddenWords = ["select", "insert", "update", "delete", "drop", "truncate", "alter", "--", ";", "*"];

// Generic string validator to block SQL injections
export const safeString = (minLength = 1) =>
  z
    .string()
    .trim()
    .min(minLength, `Must be at least ${minLength} characters`)
    .refine((val) => {
      const lower = val.toLowerCase();
      return !forbiddenWords.some(word => lower.includes(word));
    }, { message: "Input contains forbidden characters or SQL keywords" });