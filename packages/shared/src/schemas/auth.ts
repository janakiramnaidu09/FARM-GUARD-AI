import { z } from 'zod';

export const PreferredLanguageSchema = z.enum(['en', 'te']);
export type PreferredLanguage = z.infer<typeof PreferredLanguageSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(2).max(100),
  preferredLanguage: PreferredLanguageSchema.default('en'),
  emailVerifiedAt: z.string().datetime().nullable().optional(),
  disabledAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type User = z.infer<typeof UserSchema>;

export const SignupRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  displayName: z.string().min(2, 'Name must be at least 2 characters').trim(),
  preferredLanguage: PreferredLanguageSchema.default('en')
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const PasswordResetRequestSchema = z.object({
  email: z.string().email().trim().toLowerCase()
});

export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetCompleteSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export type PasswordResetComplete = z.infer<typeof PasswordResetCompleteSchema>;

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  preferredLanguage: PreferredLanguageSchema.optional()
});

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;

