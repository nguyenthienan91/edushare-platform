import {
  User,
  Lock,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Shield,
} from 'lucide-react'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { AuthService } from '@/services/auth.service'
import { fetchClient } from '@/utils/fetchClient'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminProfile {
  _id: string
  email: string
  displayName: string
  avatar: string | null
  phoneNumber: string | null
  gender: 'male' | 'female' | 'other' | null
  dateOfBirth: string | null
  address: string | null
  role: string
  isActive: boolean
  isVerified: boolean
  trustScore: number
  createdAt: string
  updatedAt: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Editable form fields
  const [displayName, setDisplayName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState<string>('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')

  // ── Security state ─────────────────────────────────────────────────────────
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // ── Fetch profile ──────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    setLoadingProfile(true)
    try {
      const res = await fetchClient('/users/me')
      setProfile(res)
      setDisplayName(res.displayName || '')
      setPhoneNumber(res.phoneNumber || '')
      setGender(res.gender || '')
      setDateOfBirth(res.dateOfBirth ? res.dateOfBirth.split('T')[0] : '')
      setAddress(res.address || '')
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Không thể tải thông tin tài khoản.')
    } finally {
      setLoadingProfile(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const body: Record<string, any> = { displayName, phoneNumber, address }
      if (gender) body.gender = gender
      if (dateOfBirth) body.dateOfBirth = new Date(dateOfBirth).toISOString()

      const res = await fetchClient('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setProfile((prev) => (prev ? { ...prev, ...res } : prev))
      toast.success('Cập nhật hồ sơ thành công!')
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật hồ sơ.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCancelProfile = () => {
    if (!profile) return
    setDisplayName(profile.displayName || '')
    setPhoneNumber(profile.phoneNumber || '')
    setGender(profile.gender || '')
    setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '')
    setAddress(profile.address || '')
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setUploadingAvatar(true)
    const toastId = toast.loading('Đang tải ảnh đại diện lên...')
    try {
      const res = await fetchClient('/users/me/avatar', {
        method: 'PATCH',
        body: formData,
      })
      setProfile((prev) => (prev ? { ...prev, avatar: res.avatar } : prev))
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId })
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải ảnh đại diện lên.', { id: toastId })
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('Vui lòng điền đầy đủ thông tin mật khẩu.')
    }
    if (newPassword.length < 6) {
      return toast.error('Mật khẩu mới phải từ 6 ký tự trở lên.')
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp.')
    }

    setIsChangingPassword(true)
    try {
      const response = await AuthService.changePassword({ oldPassword, newPassword })
      toast.success(response.message || 'Mật khẩu đã được cập nhật thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đổi mật khẩu.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const initials = (displayName || 'A')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Cài đặt tài khoản</h1>
        <p className="mt-2 text-muted-foreground">Quản lý thông tin cá nhân và bảo mật quản trị viên</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex w-full h-auto p-1 justify-start gap-1 lg:grid lg:grid-cols-2">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        {/* ── TAB: PROFILE ─────────────────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-6">Thông tin cá nhân</h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 border-b pb-6 mb-6">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                <Avatar className="size-20 border text-2xl group-hover:opacity-80 transition-opacity">
                  {profile?.avatar && <AvatarImage src={profile.avatar} alt={displayName} />}
                  <AvatarFallback className="bg-indigo-500/10 text-indigo-500 font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full border flex items-center justify-center bg-background hover:bg-accent transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleAvatarClick() }}
                  disabled={uploadingAvatar}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{profile?.displayName || 'Chưa đặt tên'}</h3>
                  <Badge className="rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
                    <Shield className="size-3 mr-1" />
                    Admin
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{profile?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tham gia: {formatDate(profile?.createdAt ?? null)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar && <Loader2 className="size-4 mr-2 animate-spin" />}
                  Đổi ảnh đại diện
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label>Tên hiển thị</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên hiển thị"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input value={profile?.email || ''} disabled className="bg-muted" />
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+84 xxx xxx xxx"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Giới tính</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Địa chỉ</Label>
                <Textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCancelProfile}>
                  Hủy
                </Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="size-4 mr-2 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── TAB: SECURITY ─────────────────────────────────────────────────── */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change password */}
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-6">Đổi mật khẩu</h2>

              <div className="space-y-4">
                {/* Current */}
                <div>
                  <Label>Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu hiện tại"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div>
                  <Label>Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <Label>Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4">
                  <p className="text-sm text-blue-600">Mật khẩu cần ít nhất 6 ký tự.</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                    {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Account info */}
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-4">Thông tin tài khoản</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Vai trò</span>
                  <Badge className="rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
                    <Shield className="size-3 mr-1" />
                    Quản trị viên
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <Badge
                    className={`rounded-full border-0 ${
                      profile?.isActive
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {profile?.isActive ? 'Đang hoạt động' : 'Bị khóa'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Trust Score</span>
                  <span className="font-semibold">{profile?.trustScore?.toFixed(1) ?? '5.0'}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Ngày tạo tài khoản</span>
                  <span className="font-semibold">{formatDate(profile?.createdAt ?? null)}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
