import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthService } from '../../services/auth.service'
import { useAuth } from '../../contexts/AuthContext'
import { PaymentService } from '../../services/payment.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const roleRoutes: Record<string, string> = {
    admin: '/admin',
    member: '/dashboard',
    guest: '/'
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isLogin) {
      if (!displayName.trim()) {
        return toast.error('Vui lòng nhập họ và tên')
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email.match(emailRegex)) {
        return toast.error('Email không đúng định dạng')
      }
      if (password.length < 6) {
        return toast.error('Mật khẩu phải từ 6 ký tự trở lên')
      }
      if (password !== confirmPassword) {
        return toast.error('Mật khẩu xác nhận không khớp')
      }

      setIsLoading(true)
      try {
        await AuthService.signUp({ email, password, displayName })
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
        setIsLogin(true)
        setPassword('')
        setConfirmPassword('')
        setShowPassword(false)
        setShowConfirmPassword(false)
      } catch (error: any) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    try {
      const data = await AuthService.signIn({ email, password })
      const decodedUser = login(data.accessToken, data.refreshToken)
      
      if (decodedUser?.role) {
        toast.success('Đăng nhập thành công')
        
        // Handle pending cancel order if present
        const pendingCancelOrderCode = localStorage.getItem('pendingCancelOrderCode')
        if (pendingCancelOrderCode) {
          const codeNum = Number(pendingCancelOrderCode)
          if (codeNum) {
            PaymentService.cancelDeposit(codeNum)
              .then(() => {
                toast.warning('Lệnh nạp tiền đã bị hủy')
              })
              .catch((err) => {
                console.error('Failed to cancel deposit after login:', err)
              })
              .finally(() => {
                localStorage.removeItem('pendingCancelOrderCode')
              })
          }
        }

        const redirectUrl = localStorage.getItem('redirectUrl')
        if (redirectUrl) {
          localStorage.removeItem('redirectUrl')
          navigate(redirectUrl)
        } else {
          navigate(roleRoutes[decodedUser.role] ?? '/')
        }
      } else {
        toast.error('Token không hợp lệ')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen from-white via-slate-50 to-indigo-50/40 flex flex-col justify-center py-4 sm:px-6 lg:px-8'>
      {/* Logo */}
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <Link to='/' className='flex items-center justify-center gap-3 group'>
          <img
            src='/images/logo.jpg'
            alt='EduShare logo'
            className='size-14 rounded-2xl object-cover shadow-lg ring-1 ring-black/5 transition-transform group-hover:scale-[1.02]'
          />

          <div className='text-left'>
            <h1 className='text-2xl font-bold tracking-tight'>EduShare</h1>
            <p className='text-xs font-medium text-primary'>An toàn, thân thiện, dành cho sinh viên</p>
          </div>
        </Link>
        <h2 className='mt-8 text-center text-3xl font-extrabold'>
          {isLogin ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
        </h2>
        
      </div>

      {/* Card */}
      <Card className='mt-8 sm:mx-auto sm:w-full sm:max-w-md shadow-xs border border-border/80 sm:rounded-2xl bg-card text-card-foreground'>
        <CardContent className='py-8 px-6'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* Register only: Display Name */}
            {!isLogin && (
              <div className='space-y-1.5'>
                <Label className='text-sm font-medium text-foreground'>Họ và tên</Label>
                <Input
                  type='text'
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder='Nguyễn Văn A'
                  className='w-full bg-background border-input'
                />
              </div>
            )}

            {/* Email */}
            <div className='space-y-1.5'>
              <Label className='text-sm font-medium text-foreground'>Email</Label>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full bg-background border-input'
              />
            </div>

            {/* Password */}
            <div className='space-y-1.5'>
              <Label className='text-sm font-medium text-foreground'>Mật khẩu</Label>
              <div className='relative'>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className='w-full bg-background border-input pr-9'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0'
                >
                  {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                </button>
              </div>
            </div>

            {/* Register only: Confirm Password */}
            {!isLogin && (
              <div className='space-y-1.5'>
                <Label className='text-sm font-medium text-foreground'>Xác nhận mật khẩu</Label>
                <div className='relative'>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='••••••••'
                    className='w-full bg-background border-input pr-9'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0'
                  >
                    {showConfirmPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember & Forgot Password (Login only) */}
            {isLogin && (
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                 
                
                </div>

                <div className='text-sm'>
                  <Link to='/forgot-password' className='font-medium text-primary hover:text-primary/80 transition-colors'>
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>
            )}

            {/* Button */}
            <div>
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full py-2.5 h-10'
              >
                {isLoading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </Button>
            </div>
          </form>

          {/* Switch */}
          <div className='mt-6 text-center'>
            <button
              type='button'
              onClick={() => {
                setIsLogin(!isLogin)
                setConfirmPassword('')
                setShowPassword(false)
                setShowConfirmPassword(false)
              }}
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0'
            >
              {isLogin ? (
                <>
                  Chưa có tài khoản?{' '}
                  <span className='text-primary hover:text-primary/80 underline ml-1 font-semibold'>
                    Đăng ký
                  </span>
                </>
              ) : (
                <>
                  Đã có tài khoản?{' '}
                  <span className='text-primary hover:text-primary/80 underline ml-1 font-semibold'>
                    Đăng nhập
                  </span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

