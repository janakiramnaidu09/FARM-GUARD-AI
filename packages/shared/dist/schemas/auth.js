import { z } from 'zod';
export const PreferredLanguageSchema = z.enum(['en', 'te']);
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
export const SignupRequestSchema = z.object({
    email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    displayName: z.string().min(2, 'Name must be at least 2 characters').trim(),
    preferredLanguage: PreferredLanguageSchema.default('en')
});
export const LoginRequestSchema = z.object({
    email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required')
});
export const PasswordResetRequestSchema = z.object({
    email: z.string().email().trim().toLowerCase()
});
export const PasswordResetCompleteSchema = z.object({
    token: z.string().min(10),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
});
export const UpdateProfileSchema = z.object({
    displayName: z.string().min(2).max(100).optional(),
    preferredLanguage: PreferredLanguageSchema.optional()
});
//# sourceMappingURL=auth.js.map