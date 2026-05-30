import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthService } from '../../services/auth.service'

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
            <p className='text-xs font-medium text-sky-600'>An toàn, thân thiện, dành cho sinh viên</p>
          </div>
        </Link>
        <h2 className='mt-8 text-center text-3xl font-extrabold'>
          Quên mật khẩu?
        </h2>
        <p className='mt-2 text-center text-sm'>
          Đừng lo, chúng tôi sẽ gửi liên kết khôi phục qua email cho bạn
        </p>
      </div>

      {/* Card */}
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='py-8 px-6 shadow-sm border border-slate-100 sm:rounded-2xl'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className='block text-sm font-medium'>Email của bạn</label>
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

            {/* Button */}
            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
              </button>
            </div>
          </form>

          {/* Switch */}
          <div className='mt-6 text-center'>
            <Link
              to='/login'
              className='text-sm font-medium hover:text-indigo-500 transition-colors'
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
