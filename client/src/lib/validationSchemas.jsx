import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  phone:    z.string().optional(),
  gender:   z.enum(['male', 'female', 'other', '']).optional(),
  dob:      z.string().optional(),
});
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
  export const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(50),
});

export const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(50),
  description: z.string().max(300).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

export const inviteSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(['admin', 'member', 'viewer']),
});