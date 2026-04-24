import * as z from 'zod';

export const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters.')
      .max(100, 'First name must be at most 100 characters.'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters.')
      .max(100, 'Last name must be at most 100 characters.'),
    email: z.email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Include at least one uppercase letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address.'),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
