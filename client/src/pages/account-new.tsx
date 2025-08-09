import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Edit, Check, X, Eye, EyeOff, Settings, Wallet, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function AccountNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const profileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('PATCH', '/api/auth/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thông tin tài khoản đã được cập nhật",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      return await apiRequest('PATCH', '/api/auth/change-password', data);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được thay đổi",
      });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thay đổi mật khẩu",
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }
    passwordMutation.mutate(passwordData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-glow-purple mb-2">
          Quản Lý Tài Khoản
        </h1>
        <p className="text-slate-400">
          Cập nhật thông tin cá nhân và bảo mật
        </p>
      </motion.div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="premium-card card-purple">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Tài Khoản</p>
                  <p className="text-glow-purple font-semibold">ID: #{user?.id}</p>
                  <p className="text-slate-300 text-sm">{user?.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="premium-card card-emerald">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Vai Trò</p>
                  <p className="text-glow-emerald font-semibold capitalize">{user?.role}</p>
                  <p className="text-slate-300 text-sm">Người Dùng</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="premium-card card-orange">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Số Dư</p>
                  <p className="text-glow-orange font-semibold">
                    {Number(user?.balance || 0).toLocaleString()} VNĐ
                  </p>
                  <Button 
                    onClick={() => setLocation('/payment')}
                    className="text-xs mt-1 p-0 h-auto text-orange-400 hover:text-orange-300"
                    variant="link"
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    Nạp tiền
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="premium-card card-purple">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-glow-purple flex items-center justify-between">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông Tin Cá Nhân
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="ghost"
                  size="sm"
                  className="btn-premium text-purple-400 hover:text-purple-300"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label className="text-slate-300 text-sm">Họ và tên</Label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="bg-slate-800/50 border-slate-600 focus:border-purple-400/50 text-white"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-slate-800/50 border-slate-600 focus:border-purple-400/50 text-white"
                      placeholder="Nhập email"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Số điện thoại</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-slate-800/50 border-slate-600 focus:border-purple-400/50 text-white"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={profileMutation.isPending}
                      className="btn-premium bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {profileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                      className="btn-premium text-slate-400 hover:text-slate-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Họ và tên</p>
                      <p className="text-white font-medium">{user?.fullName || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <p className="text-white font-medium">{user?.email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Số điện thoại</p>
                      <p className="text-white font-medium">{user?.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="premium-card card-cyan">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-glow-cyan flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Thay Đổi Mật Khẩu
                </div>
                <Button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  variant="ghost"
                  size="sm"
                  className="btn-premium text-cyan-400 hover:text-cyan-300"
                >
                  {isChangingPassword ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label className="text-slate-300 text-sm">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="bg-slate-800/50 border-slate-600 focus:border-cyan-400/50 text-white pr-10"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <Button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="bg-slate-800/50 border-slate-600 focus:border-cyan-400/50 text-white pr-10"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <Button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="bg-slate-800/50 border-slate-600 focus:border-cyan-400/50 text-white pr-10"
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <Button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={passwordMutation.isPending}
                      className="btn-premium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {passwordMutation.isPending ? 'Đang lưu...' : 'Đổi mật khẩu'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      variant="ghost"
                      className="btn-premium text-slate-400 hover:text-slate-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-50" />
                  <p className="text-slate-400 mb-4">
                    Bảo vệ tài khoản của bạn bằng mật khẩu mạnh
                  </p>
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    className="btn-premium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                  >
                    Thay đổi mật khẩu
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}