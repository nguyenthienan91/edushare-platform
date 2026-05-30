import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthService } from '../../services/auth.service'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      return toast.error('Mã xác thực không hợp lệ hoặc đã hết hạn.')
    }

    if (newPassword.length < 6) {
      return toast.error('Mật khẩu phải từ 6 ký tự trở lên')
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp.')
    }

    setIsLoading(true)
    try {
      const response = await AuthService.resetPassword(token, { newPassword })
      toast.success(response.message || 'Mật khẩu đã được đặt lại thành công')
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
          Đặt lại mật khẩu
        </h2>
        <p className='mt-2 text-center text-sm'>
          Vui lòng nhập mật khẩu mới của bạn bên dưới
        </p>
      </div>

      {/* Card */}
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='py-8 px-6 shadow-sm border border-slate-100 sm:rounded-2xl'>
          {!token ? (
            <div className='text-center'>
              <p className='text-sm text-red-500 font-medium mb-4'>Đường dẫn không hợp lệ vì thiếu token.</p>
              <Link to='/login' className='text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors'>Quay lại Đăng nhập</Link>
            </div>
          ) : (
            <form className='space-y-6' onSubmit={handleSubmit}>
              {/* New Password */}
              <div>
                <label className='block text-sm font-medium'>Mật khẩu mới</label>
                <div className='mt-1'>
                  <input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='••••••••'
                    className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className='block text-sm font-medium'>Nhập lại mật khẩu mới</label>
                <div className='mt-1'>
                  <input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='••••••••'
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
                  {isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
