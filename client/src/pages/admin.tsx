import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Wallet, 
  Plus, 
  Minus, 
  Trash2, 
  Edit,
  DollarSign,
  Shield,
  AlertTriangle,
  Settings,
  BarChart3,
  Gift
} from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import AdminStats from '@/components/admin/admin-stats';
import TwilioManagementNew from '@/components/admin/twilio-management-new';
import ProductionMonitor from '@/components/admin/production-monitor';
import TwilioDidManager from '@/components/admin/twilio-did-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  balance: string;
  callsRemaining: number;
  plan: string;
  isActive: boolean;
  createdAt: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'twilio' | 'dids' | 'stats' | 'monitor'>('users');
  const [balanceDialog, setBalanceDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [adminTopupDialog, setAdminTopupDialog] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [adminTopupAmount, setAdminTopupAmount] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with real-time refresh
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    retry: false,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Update user balance mutation
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount, operation }: { userId: number; amount: number; operation: string }) => {
      return await apiRequest('POST', '/api/admin/user/balance/update', {
        userId,
        amount,
        operation
      });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã cập nhật số dư thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setBalanceDialog({ open: false, user: null });
      setBalanceAmount('');
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest('DELETE', `/api/admin/user/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa tài khoản thành công",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setDeleteDialog({ open: false, user: null });
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin unlimited topup mutation
  const adminTopupMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest('POST', '/api/admin/balance/unlimited', { amount });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã nạp tiền admin thành công",
      });
      setAdminTopupDialog(false);
      setAdminTopupAmount('');
      // Refresh current user data if needed
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateBalance = () => {
    if (!balanceDialog.user || !balanceAmount) return;
    
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Số tiền không hợp lệ",
        variant: "destructive",
      });
      return;
    }

    updateBalanceMutation.mutate({
      userId: balanceDialog.user.id,
      amount,
      operation: balanceOperation
    });
  };

  const handleDeleteUser = () => {
    if (!deleteDialog.user) return;
    deleteUserMutation.mutate(deleteDialog.user.id);
  };

  const handleAdminTopup = () => {
    const amount = parseFloat(adminTopupAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Số tiền không hợp lệ",
        variant: "destructive",
      });
      return;
    }
    adminTopupMutation.mutate(amount);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(amount) * 24000); // Approximate USD to VND
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Admin</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">User</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Quản lý người dùng và hệ thống</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Monthly Packages Quick Link */}
            <Button 
              onClick={() => window.location.href = '/admin/packages'}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Gift className="w-4 h-4 mr-2" />
              Gói Tháng
            </Button>

            {/* Admin Unlimited Topup Button */}
            <Dialog open={adminTopupDialog} onOpenChange={setAdminTopupDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Wallet className="w-4 h-4 mr-2" />
                  Nạp Tiền Admin
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Nạp Tiền Admin (Vô Hạn)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Số tiền (USD)</Label>
                  <Input
                    type="number"
                    placeholder="Nhập số tiền..."
                    value={adminTopupAmount}
                    onChange={(e) => setAdminTopupAmount(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAdminTopupDialog(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAdminTopup}
                  disabled={adminTopupMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {adminTopupMutation.isPending ? 'Đang xử lý...' : 'Nạp Tiền'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Tab Navigation - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile: Dropdown */}
          <div className="block sm:hidden">
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="users">👥 Người Dùng</SelectItem>
                <SelectItem value="twilio">⚙️ Tài Khoản Twilio</SelectItem>
                <SelectItem value="dids">📞 Quản Lý DIDs</SelectItem>
                <SelectItem value="stats">📊 Thống Kê</SelectItem>
                <SelectItem value="monitor">🛡️ Production Monitor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Tab buttons */}
          <div className="hidden sm:block">
            <div className="flex flex-wrap gap-1 bg-slate-800/50 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 lg:px-4 py-2 rounded-md transition-all text-sm ${
                  activeTab === 'users' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Users className="w-4 h-4 mr-1 lg:mr-2 inline" />
                <span className="hidden md:inline">Người Dùng</span>
                <span className="md:hidden">Users</span>
              </button>
              <button
                onClick={() => setActiveTab('twilio')}
                className={`px-3 lg:px-4 py-2 rounded-md transition-all text-sm ${
                  activeTab === 'twilio' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 mr-1 lg:mr-2 inline" />
                <span className="hidden md:inline">Tài Khoản Twilio</span>
                <span className="md:hidden">Twilio</span>
              </button>
              <button
                onClick={() => setActiveTab('dids')}
                className={`px-3 lg:px-4 py-2 rounded-md transition-all text-sm ${
                  activeTab === 'dids' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-1 lg:mr-2 inline" />
                <span className="hidden md:inline">Quản Lý DIDs</span>
                <span className="md:hidden">DIDs</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 lg:px-4 py-2 rounded-md transition-all text-sm ${
                  activeTab === 'stats' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-1 lg:mr-2 inline" />
                <span className="hidden md:inline">Thống Kê</span>
                <span className="md:hidden">Stats</span>
              </button>
              <button
                onClick={() => setActiveTab('monitor')}
                className={`px-3 lg:px-4 py-2 rounded-md transition-all text-sm ${
                  activeTab === 'monitor' 
                    ? 'bg-green-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Shield className="w-4 h-4 mr-1 lg:mr-2 inline" />
                <span className="hidden md:inline">Production Monitor</span>
                <span className="md:hidden">Monitor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Quản Lý Người Dùng ({users.length})
              </CardTitle>
            </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-300">User</th>
                    <th className="text-left py-3 px-4 text-slate-300">Role</th>
                    <th className="text-left py-3 px-4 text-slate-300">Số Dư</th>
                    <th className="text-left py-3 px-4 text-slate-300">Cuộc Gọi</th>
                    <th className="text-left py-3 px-4 text-slate-300">Trạng Thái</th>
                    <th className="text-left py-3 px-4 text-slate-300">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      data-testid={`user-row-${user.id}`}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-white font-medium">{user.fullName}</div>
                          <div className="text-slate-400 text-sm">@{user.username}</div>
                          <div className="text-slate-500 text-xs">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-mono">
                          ${parseFloat(user.balance).toFixed(2)}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {formatCurrency(user.balance)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white">{user.callsRemaining}</div>
                        <div className="text-slate-400 text-xs">{user.plan}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={user.isActive 
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                          }
                        >
                          {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Dialog 
                            open={balanceDialog.open && balanceDialog.user?.id === user.id} 
                            onOpenChange={(open) => setBalanceDialog({ open, user: open ? user : null })}
                          >
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  Cập nhật số dư cho {user.fullName}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-white">Thao tác</Label>
                                  <Select value={balanceOperation} onValueChange={(value: any) => setBalanceOperation(value)}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      <SelectItem value="add">Cộng tiền</SelectItem>
                                      <SelectItem value="subtract">Trừ tiền</SelectItem>
                                      <SelectItem value="set">Đặt số dư</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-white">Số tiền (USD)</Label>
                                  <Input
                                    type="number"
                                    placeholder="Nhập số tiền..."
                                    value={balanceAmount}
                                    onChange={(e) => setBalanceAmount(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setBalanceDialog({ open: false, user: null })}
                                  className="border-slate-700 text-slate-300"
                                >
                                  Hủy
                                </Button>
                                <Button
                                  onClick={handleUpdateBalance}
                                  disabled={updateBalanceMutation.isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {updateBalanceMutation.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {user.role !== 'admin' && (
                            <Dialog 
                              open={deleteDialog.open && deleteDialog.user?.id === user.id} 
                              onOpenChange={(open) => setDeleteDialog({ open, user: open ? user : null })}
                            >
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-red-700 text-red-400 hover:bg-red-800"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-900 border-slate-800">
                                <DialogHeader>
                                  <DialogTitle className="text-white flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                                    Xác nhận xóa tài khoản
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <p className="text-slate-300">
                                    Bạn có chắc chắn muốn xóa tài khoản của <strong>{user.fullName}</strong> không?
                                  </p>
                                  <p className="text-red-400 text-sm mt-2">
                                    Hành động này không thể hoàn tác!
                                  </p>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeleteDialog({ open: false, user: null })}
                                    className="border-slate-700 text-slate-300"
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    onClick={handleDeleteUser}
                                    disabled={deleteUserMutation.isPending}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {deleteUserMutation.isPending ? 'Đang xóa...' : 'Xóa tài khoản'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {users.map((user: User) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/30 rounded-lg border border-slate-700"
                  data-testid={`user-card-${user.id}`}
                >
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm">{user.fullName}</div>
                        <div className="text-slate-400 text-xs">@{user.username}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                      {getRoleBadge(user.role)}
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400">Số Dư</div>
                        <div className="text-white font-mono">${parseFloat(user.balance).toFixed(2)}</div>
                        <div className="text-slate-500">{formatCurrency(user.balance)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Cuộc Gọi</div>
                        <div className="text-white">{user.callsRemaining}</div>
                        <div className="text-slate-500">{user.plan}</div>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        className={`text-xs ${user.isActive 
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </Badge>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Dialog 
                          open={balanceDialog.open && balanceDialog.user?.id === user.id} 
                          onOpenChange={(open) => setBalanceDialog({ open, user: open ? user : null })}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-slate-700 text-slate-300 hover:bg-slate-800 h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Cập nhật số dư cho {user.fullName}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-white">Thao tác</Label>
                                <Select value={balanceOperation} onValueChange={(value: any) => setBalanceOperation(value)}>
                                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="add">Cộng tiền</SelectItem>
                                    <SelectItem value="subtract">Trừ tiền</SelectItem>
                                    <SelectItem value="set">Đặt số dư</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-white">Số tiền (USD)</Label>
                                <Input
                                  type="number"
                                  placeholder="Nhập số tiền..."
                                  value={balanceAmount}
                                  onChange={(e) => setBalanceAmount(e.target.value)}
                                  className="bg-slate-800 border-slate-700 text-white"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setBalanceDialog({ open: false, user: null })}
                                className="border-slate-700 text-slate-300"
                              >
                                Hủy
                              </Button>
                              <Button
                                onClick={handleUpdateBalance}
                                disabled={updateBalanceMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {updateBalanceMutation.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {user.role !== 'admin' && (
                          <Dialog 
                            open={deleteDialog.open && deleteDialog.user?.id === user.id} 
                            onOpenChange={(open) => setDeleteDialog({ open, user: open ? user : null })}
                          >
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-700 text-red-400 hover:bg-red-800 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800">
                              <DialogHeader>
                                <DialogTitle className="text-white flex items-center">
                                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                                  Xác nhận xóa tài khoản
                                </DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="text-slate-300">
                                  Bạn có chắc chắn muốn xóa tài khoản của <strong>{user.fullName}</strong> không?
                                </p>
                                <p className="text-red-400 text-sm mt-2">
                                  Hành động này không thể hoàn tác!
                                </p>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteDialog({ open: false, user: null })}
                                  className="border-slate-700 text-slate-300"
                                >
                                  Hủy
                                </Button>
                                <Button
                                  onClick={handleDeleteUser}
                                  disabled={deleteUserMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {deleteUserMutation.isPending ? 'Đang xóa...' : 'Xóa tài khoản'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Twilio Management Tab */}
        {activeTab === 'twilio' && <TwilioManagementNew />}

        {/* DID Sync Management Tab */}
        {activeTab === 'dids' && <TwilioDidManager />}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <AdminStats />
            <Card className="pro-card">
              <CardHeader>
                <CardTitle className="text-white">Báo Cáo Chi Tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Các biểu đồ và thống kê chi tiết sẽ được thêm vào đây</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Production Monitor Tab */}
        {activeTab === 'monitor' && <ProductionMonitor />}
      </div>
    </div>
  );
}