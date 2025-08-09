import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Mail, Phone, Save, Eye, EyeOff, Shield, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Validation schemas
const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Account() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest('PATCH', '/api/auth/profile', data);
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Thông tin tài khoản đã được cập nhật',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật thông tin',
        variant: 'destructive',
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      return await apiRequest('PATCH', '/api/auth/change-password', data);
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Mật khẩu đã được thay đổi',
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể thay đổi mật khẩu',
        variant: 'destructive',
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <Settings className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 glow-text">Quản Lý Tài Khoản</h1>
          </div>
          <p className="text-foreground-secondary text-sm sm:text-base lg:text-lg">Cập nhật thông tin cá nhân và bảo mật</p>
        </motion.div>

        {/* Responsive Account Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/40 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-purple-300 text-sm">Tài Khoản</h3>
                    <p className="text-slate-400 text-xs">ID: #{user.id}</p>
                    <p className="text-slate-100 font-medium truncate">{user.username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/40 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-emerald-300 text-sm">Vai Trò</h3>
                    <p className="text-slate-400 text-xs capitalize">{user.role}</p>
                    <p className="text-emerald-400 font-medium">
                      {user.role === 'admin' ? 'Quản Trị Viên' : 'Người Dùng'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/40 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-yellow-300 text-sm">Số Dư</h3>
                    <p className="text-slate-400 text-xs">Hiện tại</p>
                    <p className="text-yellow-400 font-bold text-lg truncate">
                      {parseFloat(user.balance).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Compact Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/40 border border-purple-500/30 hover:border-purple-400/40 transition-all duration-300">
            <Tabs defaultValue="profile" className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/60 border border-purple-500/20 h-12">
                  <TabsTrigger 
                    value="profile" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                    data-testid="tab-profile"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Thông Tin Cá Nhân
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                    data-testid="tab-security"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Bảo Mật
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-5">
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-5">
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-purple-300 font-medium">
                          Họ và Tên *
                        </Label>
                        <Input
                          id="fullName"
                          {...profileForm.register('fullName')}
                          className="premium-input"
                          placeholder="Nhập họ và tên"
                          data-testid="input-fullname"
                        />
                        {profileForm.formState.errors.fullName && (
                          <p className="text-red-400 text-sm">{profileForm.formState.errors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-purple-300 font-medium">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...profileForm.register('email')}
                          className="premium-input"
                          placeholder="Nhập địa chỉ email"
                          data-testid="input-email"
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-red-400 text-sm">{profileForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-purple-300 font-medium">
                          Số Điện Thoại
                        </Label>
                        <Input
                          id="phone"
                          {...profileForm.register('phone')}
                          className="premium-input"
                          placeholder="Nhập số điện thoại"
                          data-testid="input-phone"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-purple-300 font-medium">
                          Tên Đăng Nhập
                        </Label>
                        <Input
                          value={user.username}
                          disabled
                          className="premium-input opacity-50"
                          placeholder="Không thể thay đổi"
                        />
                        <p className="text-slate-400 text-xs">Tên đăng nhập không thể thay đổi</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 font-semibold"
                      data-testid="button-save-profile"
                    >
                      {updateProfileMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang lưu...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Lưu Thay Đổi
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-5">
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-purple-300 font-medium">
                          Mật Khẩu Hiện Tại *
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            {...passwordForm.register('currentPassword')}
                            className="premium-input pr-10"
                            placeholder="Nhập mật khẩu hiện tại"
                            data-testid="input-current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-red-400 text-sm">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-purple-300 font-medium">
                          Mật Khẩu Mới *
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            {...passwordForm.register('newPassword')}
                            className="premium-input pr-10"
                            placeholder="Nhập mật khẩu mới"
                            data-testid="input-new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-red-400 text-sm">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-purple-300 font-medium">
                          Xác Nhận Mật Khẩu Mới *
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...passwordForm.register('confirmPassword')}
                            className="premium-input pr-10"
                            placeholder="Nhập lại mật khẩu mới"
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-red-400 text-sm">{passwordForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-purple-300 mb-2">Yêu cầu mật khẩu:</h4>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>• Ít nhất 6 ký tự</li>
                        <li>• Nên kết hợp chữ hoa, chữ thường và số</li>
                        <li>• Tránh sử dụng thông tin cá nhân</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 font-semibold"
                      data-testid="button-change-password"
                    >
                      {changePasswordMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang thay đổi...
                        </div>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Đổi Mật Khẩu
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}