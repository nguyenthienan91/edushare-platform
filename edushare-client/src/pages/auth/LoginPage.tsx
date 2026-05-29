import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthService } from '../../services/auth.service'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

      setIsLoading(true)
      try {
        await AuthService.signUp({ email, password, displayName })
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
        setIsLogin(true)
        setPassword('')
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
        navigate(roleRoutes[decodedUser.role] ?? '/')
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
            <p className='text-xs font-medium text-sky-600'>An toàn, thân thiện, dành cho sinh viên</p>
          </div>
        </Link>
        <h2 className='mt-8 text-center text-3xl font-extrabold'>
          {isLogin ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
        </h2>
        <p className='mt-2 text-center text-sm'>
          {isLogin ? 'Chào mừng bạn quay trở lại' : 'Bắt đầu hành trình của bạn'}
        </p>
      </div>

      {/* Card */}
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className=' py-8 px-6 shadow-sm border border-slate-100 sm:rounded-2xl'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* Register only: Display Name */}
            {!isLogin && (
              <div>
                <label className='block text-sm font-medium'>Họ và tên</label>
                <div className='mt-1'>
                  <input
                    type='text'
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder='Nguyễn Văn A'
                    className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
            )}



            {/* Email */}
            <div>
              <label className='block text-sm font-medium'>Email</label>
              <div className='mt-1'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='you@example.com'
                  className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium'>Mật khẩu</label>
              <div className='mt-1'>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                />
              </div>
            </div>

            {/* Remember & Forgot Password (Login only) */}
            {isLogin && (
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <input
                    id='remember-me'
                    type='checkbox'
                    className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded'
                  />
                  <label htmlFor='remember-me' className='ml-2 block text-sm'>
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className='text-sm'>
                  <button type='button' className='font-medium text-emerald-600 hover:text-emerald-500'>
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
            )}

            {/* Button */}
            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </div>
          </form>

          {/* Switch */}
          <div className='mt-6 text-center'>
            <button
              type='button'
              onClick={() => setIsLogin(!isLogin)}
              className='text-sm font-medium hover:text-indigo-500 transition-colors'
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
