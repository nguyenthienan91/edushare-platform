import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { GroupService } from '@/services/group.service'
import ForbiddenPage from '@/pages/error/ForbiddenPage'
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react'

type Category = 'All' | 'Productivity' | 'Design' | 'AI Tools' | 'Entertainment' | string
type SortOption = 'Uy tín cao nhất' | 'Giá thấp nhất' | 'Phổ biến nhất'

const categories: Category[] = ['All', 'Productivity', 'Design', 'AI Tools', 'Entertainment']
const sortOptions: SortOption[] = ['Uy tín cao nhất', 'Giá thấp nhất', 'Phổ biến nhất']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}

function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'emerald' | 'indigo' | 'sky' }) {
  const tones = {
    slate: 'bg-slate-100 ring-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  }

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}>{children}</span>
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [sortBy, setSortBy] = useState<SortOption>('Uy tín cao nhất')
  const [search, setSearch] = useState('')
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra quyền (Roles Guard)
  const isAllowedRole = isAuthenticated && user && ['admin', 'owner'].includes(user?.role?.toLowerCase() || '')

  useEffect(() => {
    if (isAllowedRole) {
      fetchGroups()
    } else {
      setIsLoading(false)
    }
  }, [isAllowedRole])

  const fetchGroups = async () => {
    setIsLoading(true)
    try {
      const res: any = await GroupService.getGroups({ page: 1, itemPerPage: 100 })
      if (res?.data) {
        setGroups(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch groups', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGroups = useMemo(() => {
    const filtered = groups.filter((group) => {
      const gCategory = group.category || 'Productivity'
      const matchesCategory = selectedCategory === 'All' || gCategory === selectedCategory || (selectedCategory === 'Productivity' && !categories.includes(gCategory))
      const name = group.name || group.platform || ''
      const matchesSearch = `${name} ${gCategory}`.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })

    return [...filtered].sort((a, b) => {
      const trustA = a.ownerId?.trustScore || 0;
      const trustB = b.ownerId?.trustScore || 0;
      if (sortBy === 'Uy tín cao nhất') return trustB - trustA
      if (sortBy === 'Giá thấp nhất') return (a.price || 0) - (b.price || 0)
      return (b.popularity || 0) - (a.popularity || 0)
    })
  }, [groups, search, selectedCategory, sortBy])

  const handleManageClick = () => {
    if (user?.role?.toLowerCase() === 'admin') {
      navigate('/admin/groups');
    } else if (user?.role?.toLowerCase() === 'owner') {
      navigate('/owner/groups');
    }
  }

  // Nếu không được phép, hiển thị ForbiddenPage
  if (!isLoading && !isAllowedRole) {
    return <ForbiddenPage />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <Badge tone="indigo">Quản lý nâng cao</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Danh sách nhóm tổng quan
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Trang này hiển thị toàn bộ các nhóm trên hệ thống. Truy cập giới hạn dành riêng cho Ban quản trị viên và Chủ nhóm quản lý tài khoản.
          </p>
        </div>

        <section className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Tìm kiếm nhanh</h2>
              <p className="mt-1 text-sm text-slate-500">Tra cứu các nhóm chia sẻ tài nguyên</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên nhóm..."
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-300 sm:w-80"
                />
              </div>
              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none rounded-2xl border border-slate-200 py-3 pl-11 pr-10 text-sm bg-white outline-none transition focus:border-indigo-300"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, index) => {
                const isFull = group.occupiedSlots >= group.totalSlots;
                return (
                  <motion.article
                    key={group._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="overflow-hidden bg-white rounded-[28px] border border-slate-200 shadow-sm transition-shadow hover:shadow-xl"
                  >
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-950 truncate max-w-[180px]">{group.name || group.platform || 'Chưa cập nhật'}</h3>
                            <p className="mt-1 text-sm text-slate-500">{group.category || 'Productivity'} • {group.status}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge tone={isFull ? 'slate' : 'emerald'}>{isFull ? 'Đã đầy' : 'Đang mở'}</Badge>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600 line-clamp-2 min-h-[48px]">
                        {group.description || 'Không có mô tả'}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-400">Giá tham gia</div>
                          <div className="mt-1 font-semibold text-lg text-slate-950">{formatCurrency(group.price || 0)}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-400">Tham gia</div>
                          <div className="mt-1 font-semibold text-lg text-slate-950">{group.occupiedSlots || 0}/{group.totalSlots || 0}</div>
                        </div>
                      </div>

                      <button
                        onClick={handleManageClick}
                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition bg-slate-950 hover:bg-indigo-700`}
                      >
                        Đến trang quản lý <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.article>
                )
              })
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-3xl">🔎</div>
                  <h3 className="mt-4 text-xl font-bold text-slate-950">Không tìm thấy nhóm phù hợp</h3>
                  <p className="mt-2 text-sm text-slate-500">Hãy thử từ khóa khác hoặc đổi danh mục để khám phá thêm.</p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
