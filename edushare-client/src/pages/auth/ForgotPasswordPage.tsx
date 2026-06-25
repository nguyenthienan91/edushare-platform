import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthService } from '../../services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.match(emailRegex)) {
      return toast.error('Email không đúng định dạng')
    }

    setIsLoading(true)
    try {
      const redirectTo = window.location.origin + '/reset-password'
      const response = await AuthService.forgotPassword({ email, redirectTo })
      
      toast.success(response.message || 'Vui lòng kiểm tra email của bạn')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen from-white via-slate-50 to-indigo-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
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
          Quên mật khẩu?
        </h2>
        <p className='mt-2 text-center text-sm text-muted-foreground'>
          Đừng lo, chúng tôi sẽ gửi liên kết khôi phục qua email cho bạn
        </p>
      </div>

      {/* Card */}
      <Card className='mt-8 sm:mx-auto sm:w-full sm:max-w-md shadow-xs border border-border/80 sm:rounded-2xl bg-card text-card-foreground'>
        <CardContent className='py-8 px-6'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* Email */}
            <div className='space-y-1.5'>
              <Label className='text-sm font-medium text-foreground'>Email của bạn</Label>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                className='w-full bg-background border-input'
              />
            </div>

            {/* Button */}
            <div>
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full py-2.5 h-10'
              >
                {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
              </Button>
            </div>
          </form>

          {/* Switch */}
          <div className='mt-6 text-center'>
            <Link
              to='/login'
              className='text-sm font-medium text-primary hover:text-primary/80 transition-colors underline font-semibold'
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

