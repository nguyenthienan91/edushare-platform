import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { GroupService } from '@/services/group.service'

import {
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Inbox
} from 'lucide-react'

// Shadcn UI components
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Category = 'All' | 'Productivity' | 'Design' | 'AI Tools' | 'Entertainment' | string
type SortOption = 'Uy tín cao' | 'Giá thấp' | 'Phổ biến'

const categories: Category[] = ['All', 'Productivity', 'Design', 'AI Tools', 'Entertainment']
const sortOptions: SortOption[] = ['Uy tín cao', 'Giá thấp', 'Phổ biến']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [sortBy, setSortBy] = useState<SortOption>('Uy tín cao')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemPerPage = 9
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups(currentPage)
  }, [currentPage])

  const fetchGroups = async (page: number) => {
    setIsLoading(true)
    try {
      const res: any = await GroupService.getGroups({ page, itemPerPage })
      const groupsData = res?.list || res?.data;
      if (groupsData) {
        setGroups(groupsData)
      }
      if (res?.totalPages) {
        setTotalPages(res.totalPages)
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
      if (sortBy === 'Uy tín cao') return trustB - trustA
      if (sortBy === 'Giá thấp') return (a.price || 0) - (b.price || 0)
      return (b.popularity || 0) - (a.popularity || 0)
    })
  }, [groups, search, selectedCategory, sortBy])

  const handleManageClick = () => {
    if (user?.role?.toLowerCase() === 'admin') {
      navigate('/admin/groups');
    } else if (user?.role?.toLowerCase() === 'owner') {
      navigate('/owner/groups');
    } else {
      navigate('/dashboard/participant');
    }
  }

  // Cho phép khách truy cập xem danh sách nhóm công khai

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="px-4 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">Cộng đồng chia sẻ</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Thị trường nhóm
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Khám phá và tham gia các nhóm chia sẻ tài nguyên chất lượng trên EduShare.
          </p>
        </div>

        <Card className="mb-8 rounded-3xl border-border/60 shadow-sm bg-card overflow-visible hidden md:block">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Bộ lọc & Tìm kiếm</h2>
                <p className="mt-1 text-sm text-muted-foreground">Tra cứu các nhóm chia sẻ tài nguyên nhanh chóng</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative w-full sm:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm tên nhóm, mô tả..."
                    className="pl-9 h-11 w-full rounded-2xl"
                  />
                </div>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="h-11 w-full sm:w-48 rounded-2xl">
                    <div className="flex items-center gap-2">
                       <Filter className="h-4 w-4 text-muted-foreground" />
                       <SelectValue placeholder="Sắp xếp" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'secondary'}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full px-5"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bố cục dọc cho mobile */}
        <div className="block md:hidden space-y-4 mb-8">
           <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên nhóm..."
                className="pl-9 h-11 rounded-2xl"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-11 w-full rounded-2xl">
                <div className="flex items-center gap-2">
                   <Filter className="h-4 w-4 text-muted-foreground" />
                   <SelectValue placeholder="Sắp xếp" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex overflow-x-auto gap-2 pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'secondary'}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, index) => {
                const isFull = group.occupiedSlots >= group.totalSlots;
                return (
                  <motion.article
                    key={group._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
                      <div className="h-2 bg-gradient-to-r from-primary to-blue-500" />
                      <CardHeader className="pb-4">
                        <div className="flex flex-row items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
                              <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold truncate max-w-[180px]">{group.name || group.platform || 'Chưa cập nhật'}</CardTitle>
                              <CardDescription className="mt-1 font-medium">{group.category || 'Productivity'} • {group.status}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={isFull ? "secondary" : "default"} className={`rounded-full px-3 py-1 ${!isFull && 'bg-emerald-500 hover:bg-emerald-600'}`}>{isFull ? 'Đã đầy' : 'Đang mở'}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 pb-4">
                        <p className="text-sm leading-6 text-muted-foreground line-clamp-2 min-h-[48px]">
                          {group.description || 'Không có mô tả cho nhóm này.'}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-3">
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Giá tham gia</div>
                            <div className="mt-1 font-bold text-base text-foreground">{formatCurrency(group.price || 0)}</div>
                          </div>
                          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-3">
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Thành viên</div>
                            <div className="mt-1 font-bold text-base text-foreground">{group.occupiedSlots || 0} / {group.totalSlots || 0}</div>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0 mt-auto">
                        <Button
                          onClick={handleManageClick}
                          className="w-full rounded-2xl h-12 font-semibold"
                        >
                          {['admin', 'owner'].includes(user?.role?.toLowerCase() || '') ? (
                            <>Tới trang quản lý <ArrowRight className="ml-2 h-4 w-4" /></>
                          ) : (
                            <>Tham gia / Xem chi tiết <ArrowRight className="ml-2 h-4 w-4" /></>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.article>
                )
              })
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <Card className="rounded-[28px] border-dashed shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-primary">
                      <Inbox className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-foreground">Không tìm thấy nhóm phù hợp</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Rất tiếc chưa có nhóm nào khớp với bộ lọc của bạn. Hãy thử từ khóa khác.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        )}
        
        {/* Phân trang */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="rounded-full"
            >
              Trang trước
            </Button>
            <div className="flex items-center px-4 font-medium">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="rounded-full"
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
