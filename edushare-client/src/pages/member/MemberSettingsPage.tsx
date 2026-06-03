import {
  User,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Crown,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';
import { fetchClient } from '@/utils/fetchClient';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { Separator } from '@/components/ui/separator';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface UserProfile {
  _id: string
  email: string
  displayName: string
  avatar: string | null
  phoneNumber: string | null
  identityNumber: string | null
  gender: 'male' | 'female' | 'other' | null
  dateOfBirth: string | null
  address: string | null
  role: string
  isActive: boolean
  isVerified: boolean
  trustScore: number
  membershipStartedAt: string | null
  membershipExpiresAt: string | null
  isSubscriptionActive: boolean
  lastPaymentAt: string | null
  balance: number
  createdAt: string
  updatedAt: string
}

export default function MemberSettingsPage() {
  // ─── Password state ─────────────────────────────────────────────────
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ─── Profile state ──────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [upgradingVip, setUpgradingVip] = useState(false);

  // Editable form fields
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');

  // ─── Notifications ──────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailDisputes: true,
    emailReviews: false,
    emailPromotions: true,
    pushOrders: true,
    pushMessages: true,
    smsImportant: false,
  });

  // ─── Privacy ────────────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showReviews: true,
    showRating: true,
    twoFactorAuth: false,
  });

  // ─── Fetch profile from API ─────────────────────────────────────────
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetchClient('/users/me');
      setProfile(res);
      // Populate form fields
      setDisplayName(res.displayName || '');
      setPhoneNumber(res.phoneNumber || '');
      setGender(res.gender || '');
      setDateOfBirth(res.dateOfBirth ? res.dateOfBirth.split('T')[0] : '');
      setAddress(res.address || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Không thể tải thông tin tài khoản.');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ─── Save profile ───────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const body: Record<string, any> = { displayName, phoneNumber, address };
      if (gender) body.gender = gender;
      if (dateOfBirth) body.dateOfBirth = new Date(dateOfBirth).toISOString();

      const res = await fetchClient('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setProfile((prev) => (prev ? { ...prev, ...res } : prev));
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi cập nhật hồ sơ.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Reset form to original values ──────────────────────────────────
  const handleCancelProfile = () => {
    if (!profile) return;
    setDisplayName(profile.displayName || '');
    setPhoneNumber(profile.phoneNumber || '');
    setGender(profile.gender || '');
    setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
    setAddress(profile.address || '');
  };

  // ─── Change password ────────────────────────────────────────────────
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('Vui lòng điền đầy đủ thông tin mật khẩu.');
    }
    if (newPassword.length < 6) {
      return toast.error('Mật khẩu mới phải từ 6 ký tự trở lên.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp.');
    }

    setIsChangingPassword(true);
    try {
      const response = await AuthService.changePassword({ oldPassword, newPassword });
      toast.success(response.message || 'Mật khẩu đã được cập nhật thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đổi mật khẩu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ─── Upgrade VIP ────────────────────────────────────────────────────
  const handleUpgradeVip = async () => {
    setUpgradingVip(true);
    try {
      const res = await fetchClient('/users/upgrade-vip', { method: 'POST' });
      toast.success(res.message || 'Nâng cấp VIP thành công!');
      // Refresh profile to get updated role + balance
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'Không thể nâng cấp VIP. Kiểm tra số dư ví.');
    } finally {
      setUpgradingVip(false);
    }
  };

  // ─── Helpers ────────────────────────────────────────────────────────
  const initials = (displayName || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN').format(value) + 'đ';

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isVip = profile?.isSubscriptionActive && profile?.role !== 'guest';

  // ─── Loading skeleton ──────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold ">
          Cài đặt tài khoản
        </h1>

        <p className=" mt-2">
          Quản lý thông tin cá nhân và bảo mật
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Hồ sơ
          </TabsTrigger>

          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Bảo mật
          </TabsTrigger>

          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Thông báo
          </TabsTrigger>

          <TabsTrigger value="privacy">
            <Shield className="w-4 h-4 mr-2" />
            Quyền riêng tư
          </TabsTrigger>

          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Thanh toán
          </TabsTrigger>
        </TabsList>

        {/* PROFILE */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-6">
              Thông tin cá nhân
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 border-b pb-6 mb-6">
              <div className="relative">
                <Avatar className="size-20 border text-2xl">
                  {profile?.avatar && <AvatarImage src={profile.avatar} alt={displayName} />}
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full  border flex items-center justify-center bg-background">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {profile?.displayName || 'Chưa đặt tên'}
                  </h3>
                  {isVip && (
                    <Badge className="rounded-full bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Crown className="size-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground">
                  {profile?.email}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="rounded-full text-xs">
                    {profile?.role === 'admin' ? 'Admin' : profile?.role === 'member' ? 'Member' : profile?.role === 'owner' ? 'Owner' : 'Guest'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Trust Score: {profile?.trustScore?.toFixed(1) ?? '5.0'}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
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

        {/* SECURITY */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-6">
                Đổi mật khẩu
              </h2>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <Label>Mật khẩu hiện tại</Label>

                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
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
                      onClick={() =>
                        setShowNewPassword(
                          !showNewPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label>Xác nhận mật khẩu</Label>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    Mật khẩu cần ít nhất 6 ký tự.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                    {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* 2FA */}
            <Card className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    Xác thực 2 lớp
                  </h3>

                  <p className=" text-sm mt-1">
                    Tăng cường bảo mật tài khoản
                  </p>
                </div>

                <Switch
                  checked={privacy.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setPrivacy({
                      ...privacy,
                      twoFactorAuth: checked,
                    })
                  }
                />
              </div>

              {privacy.twoFactorAuth && (
                <div className="mt-5 border rounded-lg p-5 ">
                  <div className="w-40 h-40  border rounded-lg mx-auto flex items-center justify-center">
                    QR CODE
                  </div>

                  <Input
                    className="mt-4"
                    placeholder="Nhập mã 6 số"
                  />
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-6">
              Thông báo
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Cập nhật đơn hàng
                  </p>

                  <p className="text-sm ">
                    Email khi có thay đổi đơn hàng
                  </p>
                </div>

                <Switch
                  checked={notifications.emailOrders}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailOrders: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Khuyến mãi
                  </p>

                  <p className="text-sm ">
                    Nhận thông báo ưu đãi
                  </p>
                </div>

                <Switch
                  checked={
                    notifications.emailPromotions
                  }
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailPromotions: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Tin nhắn
                  </p>

                  <p className="text-sm ">
                    Nhận thông báo tin nhắn mới
                  </p>
                </div>

                <Switch
                  checked={
                    notifications.pushMessages
                  }
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      pushMessages: checked,
                    })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button>
                  Lưu tùy chọn
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* PRIVACY */}
        <TabsContent value="privacy">
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-6">
              Quyền riêng tư
            </h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Hiển thị hồ sơ
                  </p>

                  <p className="text-sm ">
                    Người khác có thể xem hồ sơ
                  </p>
                </div>

                <Switch
                  checked={privacy.showProfile}
                  onCheckedChange={(checked) =>
                    setPrivacy({
                      ...privacy,
                      showProfile: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Hiển thị đánh giá
                  </p>

                  <p className="text-sm ">
                    Công khai đánh giá của bạn
                  </p>
                </div>

                <Switch
                  checked={privacy.showReviews}
                  onCheckedChange={(checked) =>
                    setPrivacy({
                      ...privacy,
                      showReviews: checked,
                    })
                  }
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800">
                  Dữ liệu tài khoản
                </h4>

                <p className="text-sm text-amber-700 mt-2">
                  Bạn có thể tải xuống hoặc xóa tài khoản.
                </p>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Tải dữ liệu
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                  >
                    Xóa tài khoản
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* PAYMENT */}
        <TabsContent value="payment">
          <div className="space-y-6">
            {/* Wallet & Balance */}
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-6">
                Thanh toán
              </h2>

              <div className="p-4 border rounded-xl bg-emerald-50 border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-emerald-600" />
                  </div>

                  <div>
                    <p className="font-medium">
                      Ví EduShare
                    </p>

                    <p className="text-sm font-semibold text-emerald-700">
                      Số dư: {formatCurrency(profile?.balance ?? 0)}
                    </p>
                  </div>
                </div>

                <span className="text-xs  px-3 py-1 rounded-full text-emerald-600 font-medium">
                  Mặc định
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full mt-5"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Thêm phương thức thanh toán
              </Button>
            </Card>

            {/* VIP Subscription */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-xl flex items-center gap-2">
                    <Crown className="size-5 text-amber-500" />
                    Gói VIP Member
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nâng cấp tài khoản để tham gia các nhóm dùng chung
                  </p>
                </div>
                {isVip && (
                  <Badge className="rounded-full bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Đang hoạt động
                  </Badge>
                )}
              </div>

              {isVip ? (
                <div className="space-y-3 rounded-lg border p-4 bg-secondary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <span className="font-semibold text-emerald-600">Đang kích hoạt</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ngày bắt đầu</span>
                    <span className="font-semibold">{formatDate(profile?.membershipStartedAt ?? null)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Ngày hết hạn</span>
                    <span className="font-semibold">{formatDate(profile?.membershipExpiresAt ?? null)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Thanh toán gần nhất</span>
                    <span className="font-semibold">{formatDate(profile?.lastPaymentAt ?? null)}</span>
                  </div>
                  <Separator />
                  <Button
                    className="w-full"
                    onClick={handleUpgradeVip}
                    disabled={upgradingVip}
                  >
                    {upgradingVip && <Loader2 className="size-4 mr-2 animate-spin" />}
                    <Crown className="size-4 mr-2" />
                    Gia hạn thêm 30 ngày — 29.000đ
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-amber-50/50 border-amber-200">
                    <p className="text-sm text-amber-800">
                      Nâng cấp gói VIP Member với giá <strong>29.000đ / 30 ngày</strong> để mở khóa toàn bộ tính năng tham gia nhóm dùng chung phần mềm.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleUpgradeVip}
                    disabled={upgradingVip}
                  >
                    {upgradingVip && <Loader2 className="size-4 mr-2 animate-spin" />}
                    <Crown className="size-4 mr-2" />
                    Nâng cấp VIP — 29.000đ
                  </Button>
                </div>
              )}
            </Card>

            {/* Bank Info */}
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-6">
                Tài khoản ngân hàng
              </h2>

              <div className="space-y-4">
                <div>
                  <Label>Ngân hàng</Label>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngân hàng" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="vcb">
                        Vietcombank
                      </SelectItem>

                      <SelectItem value="acb">
                        ACB
                      </SelectItem>

                      <SelectItem value="bidv">
                        BIDV
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Số tài khoản</Label>

                  <Input placeholder="Nhập số tài khoản" />
                </div>

                <div>
                  <Label>Tên chủ tài khoản</Label>

                  <Input placeholder="Tên chủ tài khoản" />
                </div>

                <div className="flex justify-end">
                  <Button>
                    Lưu thông tin
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
