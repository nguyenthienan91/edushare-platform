import {
  User,
  Lock,
  CreditCard,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Crown,
  Plus,
  Trash2,
  Edit2,
  Building,
} from 'lucide-react';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';
import { fetchClient } from '@/utils/fetchClient';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface BankAccount {
  _id: string
  userId: string
  bankName: string
  accountNumber: string
  accountName: string
  branch?: string
  isDefault: boolean
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable form fields
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');

  // ─── Bank Accounts state ─────────────────────────────────────────────
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(true);
  const [submittingBank, setSubmittingBank] = useState(false);

  // Form states
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [deleteBankId, setDeleteBankId] = useState<string | null>(null);
  const [deletingBank, setDeletingBank] = useState(false);

  // ─── Unused notification & privacy states removed ───

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

  const fetchBankAccounts = async () => {
    setLoadingBankAccounts(true);
    try {
      const res = await fetchClient('/bank-accounts');
      setBankAccounts(res || []);
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      toast.error('Không thể tải danh sách tài khoản ngân hàng.');
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBankAccounts();
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

  // ─── Avatar Upload ──────────────────────────────────────────────────
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingAvatar(true);
    const toastId = toast.loading('Đang tải ảnh đại diện lên...');
    try {
      const res = await fetchClient('/users/me/avatar', {
        method: 'PATCH',
        body: formData,
      });
      setProfile((prev) => (prev ? { ...prev, avatar: res.avatar } : prev));
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải ảnh đại diện lên.', { id: toastId });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ─── Bank Accounts Handlers ──────────────────────────────────────────
  const handleAccountNameInput = (val: string) => {
    const cleaned = val
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '');
    setFormAccountName(cleaned);
  };

  const resetBankForm = () => {
    setEditingBankId(null);
    setFormBankName('');
    setFormAccountNumber('');
    setFormAccountName('');
    setFormBranch('');
    setFormIsDefault(false);
    setShowBankForm(false);
  };

  const startEditBank = (bank: BankAccount) => {
    setEditingBankId(bank._id);
    setFormBankName(bank.bankName);
    setFormAccountNumber(bank.accountNumber);
    setFormAccountName(bank.accountName);
    setFormBranch(bank.branch || '');
    setFormIsDefault(bank.isDefault);
    setShowBankForm(true);
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBankName || !formAccountNumber || !formAccountName) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const accountNameRegex = /^[A-Z0-9\s]+$/;
    if (!accountNameRegex.test(formAccountName)) {
      toast.error('Tên chủ tài khoản chỉ được chứa chữ cái in hoa không dấu, số và khoảng trắng.');
      return;
    }

    setSubmittingBank(true);
    try {
      const body: Record<string, any> = {
        bankName: formBankName,
        accountNumber: formAccountNumber,
        accountName: formAccountName,
        branch: formBranch || undefined,
        isDefault: formIsDefault,
      };

      if (editingBankId) {
        await fetchClient(`/bank-accounts/${editingBankId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        toast.success('Cập nhật tài khoản ngân hàng thành công!');
      } else {
        await fetchClient('/bank-accounts', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        toast.success('Thêm tài khoản ngân hàng thành công!');
      }
      resetBankForm();
      await fetchBankAccounts();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi lưu tài khoản ngân hàng.');
    } finally {
      setSubmittingBank(false);
    }
  };

  const confirmDeleteBankAccount = async () => {
    if (!deleteBankId) return;
    setDeletingBank(true);
    try {
      await fetchClient(`/bank-accounts/${deleteBankId}`, {
        method: 'DELETE',
      });
      toast.success('Xóa tài khoản ngân hàng thành công!');
      await fetchBankAccounts();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa tài khoản ngân hàng.');
    } finally {
      setDeletingBank(false);
      setDeleteBankId(null);
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
    <div className="space-y-6 p-4 sm:p-6">
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
        <TabsList className="flex w-full  h-auto p-1 justify-start gap-1 lg:grid lg:grid-cols-3 scrollbar-thin">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Hồ sơ
          </TabsTrigger>

          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Bảo mật
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
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <div 
                className="relative cursor-pointer group"
                onClick={handleAvatarClick}
              >
                <Avatar className="size-20 border text-2xl group-hover:opacity-80 transition-opacity">
                  {profile?.avatar && <AvatarImage src={profile.avatar} alt={displayName} />}
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAvatarClick();
                  }}
                  disabled={uploadingAvatar}
                >
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

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4">
                  <p className="text-sm text-blue-600">
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

            {/* 2FA removed */}
          </div>
        </TabsContent>

        {/* NOTIFICATIONS and PRIVACY removed */}

        {/* PAYMENT */}
        <TabsContent value="payment">
          <div className="space-y-6">
            {/* Wallet & Balance */}
            <Card className="p-6">
              <h2 className="font-semibold text-xl mb-6">
                Thanh toán
              </h2>

              <div className="p-4 border rounded-lg bg-emerald-500/10 border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12  rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-emerald-500" />
                  </div>

                  <div>
                    <p className="font-medium">
                      Ví EduShare
                    </p>

                    <p className="text-sm font-semibold text-emerald-600">
                      Số dư: {formatCurrency(profile?.balance ?? 0)}
                    </p>
                  </div>
                </div>

                <span className="text-xs  px-3 py-1 rounded-full text-emerald-500 font-medium">
                  Mặc định
                </span>
              </div>
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
                    disabled={upgradingVip || isVip}
                  >
                    {upgradingVip && <Loader2 className="size-4 mr-2 animate-spin" />}
                    <Crown className="size-4 mr-2" />
                    Gia hạn thêm 30 ngày — 29.000đ
                  </Button>
                  
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-amber-500/10 border-amber-500/20">
                    <p className="text-sm text-amber-600">
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-xl">
                    Tài khoản ngân hàng
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Liên kết tài khoản ngân hàng để thực hiện các giao dịch rút tiền (tối đa 3 tài khoản).
                  </p>
                </div>
                {!showBankForm && bankAccounts.length < 3 && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      resetBankForm();
                      setShowBankForm(true);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="size-4" />
                    Thêm tài khoản
                  </Button>
                )}
              </div>

              {loadingBankAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : showBankForm ? (
                <form onSubmit={handleSaveBankAccount} className="space-y-4 border p-4 rounded-lg bg-secondary/5">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {editingBankId ? 'Cập nhật tài khoản ngân hàng' : 'Thêm tài khoản ngân hàng mới'}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Tên ngân hàng <span className="text-red-500">*</span></Label>
                      <Input
                        id="bankName"
                        value={formBankName}
                        onChange={(e) => setFormBankName(e.target.value)}
                        placeholder="Ví dụ: Vietcombank, Techcombank..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountNumber">Số tài khoản <span className="text-red-500">*</span></Label>
                      <Input
                        id="accountNumber"
                        value={formAccountNumber}
                        onChange={(e) => setFormAccountNumber(e.target.value)}
                        placeholder="Nhập số tài khoản"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountName">Tên chủ tài khoản <span className="text-red-500">*</span></Label>
                      <Input
                        id="accountName"
                        value={formAccountName}
                        onChange={(e) => handleAccountNameInput(e.target.value)}
                        placeholder="NGUYEN THIEN AN (in hoa không dấu)"
                        required
                      />
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        * Tự động viết hoa & xóa dấu tiếng Việt.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="branch">Chi nhánh (không bắt buộc)</Label>
                      <Input
                        id="branch"
                        value={formBranch}
                        onChange={(e) => setFormBranch(e.target.value)}
                        placeholder="Ví dụ: CN Ba Dinh"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <Label htmlFor="isDefault" className="text-sm cursor-pointer select-none">
                      Đặt làm tài khoản nhận tiền mặc định
                    </Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={resetBankForm}>
                      Hủy
                    </Button>

                    <Button type="submit" disabled={submittingBank}>
                      {submittingBank && <Loader2 className="size-4 mr-2 animate-spin" />}
                      {editingBankId ? 'Cập nhật' : 'Lưu thông tin'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg bg-secondary/10">
                      <Building className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Bạn chưa liên kết tài khoản ngân hàng nào.
                      </p>
                    </div>
                  ) : (
                    bankAccounts.map((account) => (
                      <div 
                        key={account._id} 
                        className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          account.isDefault ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-background hover:bg-secondary/10'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 rounded-lg border ${
                            account.isDefault ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Building className="w-5 h-5" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">
                                {account.bankName}
                              </span>
                              {account.isDefault && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/10 text-[10px] hover:bg-emerald-500/15 font-medium px-2 py-0.5 rounded-full">
                                  Mặc định
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm font-mono tracking-wider">
                              {account.accountNumber}
                            </p>

                            <p className="text-xs text-muted-foreground uppercase font-medium">
                              {account.accountName} {account.branch ? `• ${account.branch}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => startEditBank(account)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="size-3.5 text-muted-foreground" />
                          </Button>
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => setDeleteBankId(account._id)}
                             className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                           >
                             <Trash2 className="size-3.5" />
                           </Button>
                        </div>
                      </div>
                    ))
                  )}

                  {bankAccounts.length >= 3 && (
                    <p className="text-xs text-muted-foreground text-center mt-2 italic">
                      * Bạn đã đạt giới hạn liên kết tối đa 3 tài khoản ngân hàng.
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog open={deleteBankId !== null} onOpenChange={(open) => { if (!open) setDeleteBankId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản ngân hàng này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteBankId(null)}
              disabled={deletingBank}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteBankAccount}
              disabled={deletingBank}
            >
              {deletingBank && <Loader2 className="size-4 mr-2 animate-spin" />}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
