import z from 'zod'
import { createZodDto } from 'nestjs-zod'
import { UserSchema } from '../../users/schemas/user.zod'

const forgotPasswordSchema = z.object({
  email: UserSchema.shape.email.optional(),
  phoneNumber: UserSchema.shape.phoneNumber,
  redirectTo: z.string().url().optional(),
})

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}

const resetPasswordSchema = z.object({
  password: UserSchema.shape.password,
})

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
