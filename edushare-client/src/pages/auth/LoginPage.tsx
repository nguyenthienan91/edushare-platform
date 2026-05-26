import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState('member')
  const navigate = useNavigate()

  const roleRoutes: Record<string, string> = {
    admin: '/admin',
    owner: '/owner',
    member: '/dashboard',
    public: '/'
  }

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault()

    if (!isLogin) {
      setIsLogin(true)
      return
    }

    navigate(roleRoutes[role] ?? '/')
  }

  return (
    <div className='min-h-screen  from-white via-slate-50 to-indigo-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
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

        <h2 className='mt-8 text-center text-3xl font-extrabold '>
          {isLogin ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
        </h2>

        <p className='mt-2 text-center text-sm '>
          {isLogin ? 'Chào mừng bạn quay trở lại' : 'Bắt đầu hành trình của bạn'}
        </p>
      </div>

      {/* Card */}
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className=' py-8 px-6 shadow-sm border border-slate-100 sm:rounded-2xl'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            {/* Register only */}
            {!isLogin && (
              <div>
                <label className='block text-sm font-medium '>Họ và tên</label>

                <div className='mt-1'>
                  <input
                    type='text'
                    placeholder='Nguyễn Văn A'
                    className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  />
                </div>
              </div>
            )}

            {/* Role */}
            <div>
              <label className='block text-sm font-medium '>Vai trò</label>

              <div className='mt-1'>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                >
                  <option value='member'>Member</option>
                  <option value='owner'>Owner</option>
                  <option value='admin'>Admin</option>
                  <option value='public'>Public</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium '>Email</label>

              <div className='mt-1'>
                <input
                  type='email'
                  placeholder='you@example.com'
                  className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium '>Mật khẩu</label>

              <div className='mt-1'>
                <input
                  type='password'
                  placeholder='••••••••'
                  className='appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                />
              </div>
            </div>

            {/* Remember */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  type='checkbox'
                  className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded'
                />

                <label htmlFor='remember-me' className='ml-2 block text-sm '>
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className='text-sm'>
                <button type='button' className='font-medium text-emerald-600 hover:text-emerald-500'>
                  Quên mật khẩu?
                </button>
              </div>
            </div>

            {/* Button */}
            <div>
              <button
                type='submit'
                className='w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              >
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </div>
          </form>

          {/* Switch */}
          <div className='mt-6 text-center'>
            <button
              type='button'
              onClick={() => setIsLogin(!isLogin)}
              className='text-sm font-medium  hover:'
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
