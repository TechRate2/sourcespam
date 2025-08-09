import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, Database, RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface TwilioAccount {
  id: number;
  accountName: string;
  sid: string;
  isActive: boolean;
  createdAt: string;
  didsCount?: number;
}

export default function TwilioManagementNew() {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    sid: '',
    authToken: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Twilio accounts
  const { data: accounts = [], isLoading } = useQuery<TwilioAccount[]>({
    queryKey: ['/api/admin/twilio-accounts'],
  });

  // Add account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (accountData: typeof newAccount) => {
      return await apiRequest('POST', '/api/admin/twilio-accounts', accountData);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thêm tài khoản Twilio thành công",
      });
      setIsAddingAccount(false);
      setNewAccount({ accountName: '', sid: '', authToken: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/twilio-accounts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm tài khoản Twilio",
        variant: "destructive",
      });
    },
  });

  // Sync DIDs mutation
  const syncDIDsMutation = useMutation({
    mutationFn: async (accountId: number) => {
      return await apiRequest('POST', `/api/admin/twilio-accounts/${accountId}/sync-dids`);
    },
    onSuccess: (data) => {
      toast({
        title: "Đồng bộ thành công",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/twilio-accounts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi đồng bộ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset database mutation
  const resetDatabaseMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/admin/reset-database');
    },
    onSuccess: (data) => {
      toast({
        title: "Reset thành công",
        description: data.message,
      });
      queryClient.invalidateQueries();
      // Reload page to refresh all data
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi reset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = () => {
    if (!newAccount.accountName || !newAccount.sid || !newAccount.authToken) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }
    addAccountMutation.mutate(newAccount);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản Lý Tài Khoản Twilio</h2>
          <p className="text-slate-400">Thêm và quản lý tài khoản Twilio cho hệ thống</p>
        </div>
        <div className="flex space-x-3">
          {/* Reset Database Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-800"
                data-testid="button-reset-database"
              >
                <Database className="w-4 h-4 mr-2" />
                Reset Database
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Xác nhận Reset Database
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  Hành động này sẽ xóa TẤT CẢ dữ liệu trong hệ thống bao gồm:
                  <br />• Tất cả cuộc gọi và lịch sử
                  <br />• Tài khoản Twilio và DIDs
                  <br />• Người dùng (trừ admin mặc định)
                  <br />• Blacklist và campaigns
                  <br /><br />
                  <strong className="text-red-400">KHÔNG THỂ HOÀN TÁC!</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300">
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => resetDatabaseMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={resetDatabaseMutation.isPending}
                >
                  {resetDatabaseMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Xác nhận Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Account Button */}
          <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                data-testid="button-add-twilio-account"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Tài Khoản Twilio
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Thêm Tài Khoản Twilio Mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Tên tài khoản</Label>
                  <Input
                    placeholder="Ví dụ: Tài khoản chính"
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                    data-testid="input-account-name"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Account SID</Label>
                  <Input
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={newAccount.sid}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, sid: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                    data-testid="input-account-sid"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Auth Token</Label>
                  <Input
                    type="password"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={newAccount.authToken}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, authToken: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                    data-testid="input-auth-token"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingAccount(false)}
                    className="border-slate-600 text-slate-300"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleAddAccount}
                    disabled={addAccountMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-submit-account"
                  >
                    {addAccountMutation.isPending ? 'Đang thêm...' : 'Thêm tài khoản'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Accounts List */}
      <Card className="pro-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Danh Sách Tài Khoản Twilio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-4">Chưa có tài khoản Twilio nào</p>
              <Button
                onClick={() => setIsAddingAccount(true)}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm tài khoản đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium text-sm">{account.accountName}</h3>
                      <Badge
                        variant={account.isActive ? "default" : "secondary"}
                        className={`text-xs ${account.isActive ? "bg-green-600" : "bg-slate-600"}`}
                      >
                        {account.isActive ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </div>
                    <div className="text-slate-400 text-xs space-y-1">
                      <p>SID: {account.sid}</p>
                      <p>DIDs: {account.didsCount || 0}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncDIDsMutation.mutate(account.id)}
                      disabled={syncDIDsMutation.isPending}
                      className="w-full border-blue-600 text-blue-400 hover:bg-blue-800 text-xs"
                      data-testid={`button-sync-${account.id}`}
                    >
                      {syncDIDsMutation.isPending ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                          Đang sync...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3 mr-2" />
                          Sync DIDs
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-medium">{account.accountName}</h3>
                        <Badge
                          variant={account.isActive ? "default" : "secondary"}
                          className={account.isActive ? "bg-green-600" : "bg-slate-600"}
                        >
                          {account.isActive ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        SID: {account.sid} • DIDs: {account.didsCount || 0}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncDIDsMutation.mutate(account.id)}
                        disabled={syncDIDsMutation.isPending}
                        className="border-blue-600 text-blue-400 hover:bg-blue-800"
                        data-testid={`button-sync-${account.id}`}
                      >
                        {syncDIDsMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="pro-card">
        <CardHeader>
          <CardTitle className="text-white">Hướng Dẫn Lấy Thông Tin Twilio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-slate-300 space-y-2">
            <p><strong>Bước 1:</strong> Truy cập <a href="https://console.twilio.com" target="_blank" className="text-blue-400 hover:underline">Twilio Console</a></p>
            <p><strong>Bước 2:</strong> Ở Dashboard, tìm phần "Account Info"</p>
            <p><strong>Bước 3:</strong> Copy <strong>Account SID</strong> (bắt đầu bằng AC...)</p>
            <p><strong>Bước 4:</strong> Click "Show" để hiển thị <strong>Auth Token</strong></p>
            <p><strong>Bước 5:</strong> Dán thông tin vào form và click "Thêm tài khoản"</p>
            <p><strong>Bước 6:</strong> Sau khi thêm, click nút "Sync" để lấy số điện thoại</p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
            <p className="text-yellow-300 text-sm">
              ⚠️ <strong>Lưu ý:</strong> Auth Token phải được giữ bí mật. Tài khoản Twilio cần có số dư và ít nhất 1 số điện thoại để thực hiện cuộc gọi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Instructions */}
      <Card className="pro-card border-red-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="w-5 h-5 mr-2 text-red-400" />
            Reset Database - Hướng Dẫn Share Source Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-slate-300 space-y-2">
            <p><strong>Khi nào cần Reset Database:</strong></p>
            <p>• Trước khi download source code để share cho người khác</p>
            <p>• Trước khi remix/fork dự án trên Replit</p>
            <p>• Khi muốn xóa sạch dữ liệu test và bắt đầu lại</p>
            
            <p className="mt-4"><strong>Sau khi Reset, người nhận cần:</strong></p>
            <p>• Tạo file .env từ .env.example</p>
            <p>• Điền DATABASE_URL và JWT_SECRET</p>
            <p>• Chạy <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">npm run db:push</code></p>
            <p>• Login với admin/admin và đổi mật khẩu ngay</p>
            <p>• Thêm tài khoản Twilio của họ</p>
          </div>
          <div className="bg-red-900/20 border border-red-600/30 rounded p-3">
            <p className="text-red-300 text-sm">
              🚨 <strong>Cảnh báo:</strong> Reset Database sẽ xóa TẤT CẢ dữ liệu và không thể hoàn tác. Chỉ sử dụng khi chắc chắn!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}