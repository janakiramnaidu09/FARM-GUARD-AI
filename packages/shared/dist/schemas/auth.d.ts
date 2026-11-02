import { z } from 'zod';
export declare const PreferredLanguageSchema: z.ZodEnum<["en", "te"]>;
export type PreferredLanguage = z.infer<typeof PreferredLanguageSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    displayName: z.ZodString;
    preferredLanguage: z.ZodDefault<z.ZodEnum<["en", "te"]>>;
    emailVerifiedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    disabledAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    displayName: string;
    preferredLanguage: "en" | "te";
    createdAt: string;
    updatedAt: string;
    emailVerifiedAt?: string | null | undefined;
    disabledAt?: string | null | undefined;
}, {
    id: string;
    email: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
    preferredLanguage?: "en" | "te" | undefined;
    emailVerifiedAt?: string | null | undefined;
    disabledAt?: string | null | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const SignupRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    displayName: z.ZodString;
    preferredLanguage: z.ZodDefault<z.ZodEnum<["en", "te"]>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    displayName: string;
    preferredLanguage: "en" | "te";
    password: string;
}, {
    email: string;
    displayName: string;
    password: string;
    preferredLanguage?: "en" | "te" | undefined;
}>;
export type SignupRequest = z.infer<typeof SignupRequestSchema>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export declare const PasswordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export declare const PasswordResetCompleteSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export type PasswordResetComplete = z.infer<typeof PasswordResetCompleteSchema>;
export declare const UpdateProfileSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    preferredLanguage: z.ZodOptional<z.ZodEnum<["en", "te"]>>;
}, "strip", z.ZodTypeAny, {
    displayName?: string | undefined;
    preferredLanguage?: "en" | "te" | undefined;
}, {
    displayName?: string | undefined;
    preferredLanguage?: "en" | "te" | undefined;
}>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
//# sourceMappingURL=auth.d.ts.map