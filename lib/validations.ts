import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["author", "reviewer"]).default("author"),
    affiliation: z.string().optional(),
    orcid: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const articleSubmissionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  abstract: z.string().min(100, "Abstract must be at least 100 characters"),
  keywords: z.array(z.string()).min(3, "At least 3 keywords required"),
  category: z.string().min(1, "Category is required"),
  coAuthors: z
    .array(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        affiliation: z.string(),
      }),
    )
    .optional(),
  funding: z.string().optional(),
  conflicts: z.string().optional(),
})

export const reviewSchema = z.object({
  recommendation: z.enum(["accept", "minor_revision", "major_revision", "reject"]),
  comments: z.string().min(50, "Comments must be at least 50 characters"),
  confidentialComments: z.string().optional(),
  rating: z.number().min(1).max(5),
})
