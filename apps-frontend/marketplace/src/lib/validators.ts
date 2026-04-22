import { z } from 'zod';

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const emailSchema = z.string().email('Enter a valid email address');

export const gstinSchema = z
  .string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid GSTIN');

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().optional(),
});

export const enquirySchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters'),
  quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
  targetPrice: z.number().optional(),
  phone: phoneSchema.optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, 'Title required'),
  body: z.string().min(10, 'Review must be at least 10 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
