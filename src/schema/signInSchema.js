import {z} from 'zod';

export const signInSchema = z.object({
    email: z.string().email({message: 'Please fill a valid email address'}),
    password: z.string().min(7, 'Password must be at least 7 characters long'),
    username: z.string().min(3, 'Username must be at least 3 characters long').regex(/^[a-zA-Z0-9_]*$/, 'Username must only contain letters, numbers, and underscores')
})