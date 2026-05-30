import {
  User,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Camera,
  Eye,
  EyeOff,
} from 'lucide-react';

import { useState } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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

export default function MemberSettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('Vui lòng điền đầy đủ thông tin mật khẩu.');
    }
    if (newPassword.length < 8) {
      return toast.error('Mật khẩu mới phải từ 8 ký tự trở lên.');
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

  // Fake user data
  const user = {
    name: 'Nguyễn Văn A',
    email: 'vana@gmail.com',
    walletBalance: 250000,
  };

  // Notifications
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailDisputes: true,
    emailReviews: false,
    emailPromotions: true,
    pushOrders: true,
    pushMessages: true,
    smsImportant: false,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showReviews: true,
    showRating: true,
    twoFactorAuth: false,
  });

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
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
                  {user.name.charAt(0)}
                </div>

                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full  border flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  {user.name}
                </h3>

                <p className="">
                  {user.email}
                </p>

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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Họ</Label>
                  <Input defaultValue="Nguyễn" />
                </div>

                <div>
                  <Label>Tên</Label>
                  <Input defaultValue="Văn A" />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input defaultValue={user.email} />
              </div>

              <div>
                <Label>Số điện thoại</Label>
                <Input placeholder="+84 xxx xxx xxx" />
              </div>

              <div>
                <Label>Địa chỉ</Label>
                <Textarea
                  rows={3}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div>
                <Label>Ngôn ngữ</Label>

                <Select defaultValue="vi">
                  <SelectTrigger>
                    <Globe className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="vi">
                      Tiếng Việt
                    </SelectItem>

                    <SelectItem value="en">
                      English
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Giới thiệu</Label>

                <Textarea
                  rows={4}
                  defaultValue="Tôi là người dùng đáng tin cậy."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">
                  Hủy
                </Button>

                <Button>
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
                    Mật khẩu cần ít nhất 8 ký tự.
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
                      Ví ShareHub
                    </p>

                    <p className="text-sm ">
                      Số dư:{' '}
                      {user.walletBalance.toLocaleString(
                        'vi-VN'
                      )}{' '}
                      ₫
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

