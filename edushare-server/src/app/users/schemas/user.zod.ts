import { z } from 'zod'
import { UserRole } from '../entities/user.entity'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
  identityNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  dateOfBirth: z.string().datetime({ offset: true }).nullable().optional(),
  address: z.string().nullable().optional(),
  displayName: z.string().optional(),
  avatar: z.string().nullable().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  trustScore: z.number().min(0).max(5).optional(),
  membershipStartedAt: z.string().datetime({ offset: true }).nullable().optional(),
  membershipExpiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  isSubscriptionActive: z.boolean().optional(),
  lastPaymentAt: z.string().datetime({ offset: true }).nullable().optional(),
  resetPasswordToken: z.string().nullable().optional(),
  resetPasswordOtp: z.string().nullable().optional(),
  resetPasswordExpiresAt: z.string().datetime({ offset: true }).nullable().optional(),
  _destroy: z.boolean().optional(),
})

export type UserSchemaType = z.infer<typeof UserSchema>
