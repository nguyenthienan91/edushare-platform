import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, Check, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { AuthService } from '../../services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      return toast.error('Mã xác thực không hợp lệ hoặc đã hết hạn.')
    }

    if (newPassword.length < 6) {
      return toast.error('Mật khẩu phải từ 6 ký tự trở lên.')
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp với mật khẩu mới.')
    }

    setIsLoading(true)
    try {
      await AuthService.resetPassword(token, { newPassword })
      setIsSuccess(true)
      toast.success('Đặt lại mật khẩu thành công!')
      
      // Chuyển hướng sau 2.5 giây
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (error: any) {
      console.error('Lỗi đặt lại mật khẩu:', error)
      const errorMsg = Array.isArray(error.message) 
        ? error.message.join(', ') 
        : error.message
      toast.error(errorMsg || 'Mã xác thực đã hết hạn hoặc không hợp lệ.')
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-950/50">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden w-full shadow-2xl rounded-3xl border border-border/60 bg-background/60 backdrop-blur-2xl p-8 sm:p-10">
          {/* Decorative Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-white/0 pointer-events-none" />

          {/* Logo & Header */}
          <CardContent className="p-0 flex flex-col items-center text-center mb-8 relative z-10">
            <Link to="/" className="flex items-center gap-3 group mb-6">
              <img
                src="/images/logo.jpg"
                alt="EduShare logo"
                className="size-12 rounded-2xl object-cover shadow-md ring-1 ring-black/5 transition-transform group-hover:scale-[1.02]"
              />
              <div className="text-left">
                <h1 className="text-xl font-bold tracking-tight">EduShare</h1>
                <p className="text-[10px] font-medium text-primary">An toàn, thân thiện, dành cho sinh viên</p>
              </div>
            </Link>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary mb-4 shadow-xs">
              <KeyRound className="h-8 w-8" />
            </div>
            
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              Đặt lại mật khẩu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground px-4">
              Vui lòng thiết lập mật khẩu mới để bảo vệ tài khoản của bạn.
            </p>
          </CardContent>

          {/* Form Content */}
          <div className="relative z-10">
            {!token ? (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-destructive">
                  Đường dẫn khôi phục mật khẩu không hợp lệ (thiếu mã token xác thực).
                </p>
                <div className="pt-2">
                  <Button asChild variant="outline" className="rounded-xl w-full">
                    <Link to="/login">Quay lại Đăng nhập</Link>
                  </Button>
                </div>
              </div>
            ) : isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Mật khẩu đã đặt lại thành công!</h3>
                <p className="text-sm text-muted-foreground">
                  Hệ thống đang chuyển hướng bạn về trang Đăng nhập sau giây lát...
                </p>
                <div className="pt-4 flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              </motion.div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* New Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground/90">Mật khẩu mới</Label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-background border-input"
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-foreground/90">Xác nhận mật khẩu mới</Label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-background border-input"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-base font-semibold rounded-xl flex items-center justify-center gap-2 group transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Đang đặt lại...
                      </>
                    ) : (
                      <>
                        Cập nhật mật khẩu
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

