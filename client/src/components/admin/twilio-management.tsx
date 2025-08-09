import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Phone, Settings, Trash2, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TwilioAccount {
  id: number;
  accountName: string;
  sid: string;
  status: string;
  createdAt: string;
}

export default function TwilioManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    sid: '',
    authToken: '',
    accountName: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Twilio accounts
  const { data: twilioAccounts = [], isLoading } = useQuery({
    queryKey: ['/api/admin/twilio-accounts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/twilio-accounts');
      return await response.json() as TwilioAccount[];
    },
  });

  // Add Twilio account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (data: typeof newAccount) => {
      const response = await apiRequest('POST', '/api/admin/twilio-accounts', data);
      return await response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Thành công",
        description: response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/twilio-accounts'] });
      setIsAddDialogOpen(false);
      setNewAccount({ sid: '', authToken: '', accountName: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Sync DIDs mutation
  const syncDIDsMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest('POST', `/api/admin/twilio-accounts/${accountId}/sync-dids`);
      return await response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Đồng bộ thành công",
        description: response.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi đồng bộ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = () => {
    if (!newAccount.sid || !newAccount.authToken) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ SID và Auth Token",
        variant: "destructive",
      });
      return;
    }
    addAccountMutation.mutate(newAccount);
  };

  const handleSyncDIDs = (accountId: number) => {
    syncDIDsMutation.mutate(accountId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản Lý Tài Khoản Twilio</h2>
          <p className="text-slate-400">Thêm tài khoản Twilio và đồng bộ số điện thoại</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="pro-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              data-testid="button-add-twilio-account"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm Tài Khoản Twilio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Thêm Tài Khoản Twilio</DialogTitle>
              <DialogDescription className="text-slate-400">
                Nhập thông tin tài khoản Twilio để kết nối với hệ thống
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountName" className="text-slate-300">Tên Tài Khoản</Label>
                <Input
                  id="accountName"
                  placeholder="Ví dụ: Tài khoản chính"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  data-testid="input-account-name"
                />
              </div>
              <div>
                <Label htmlFor="sid" className="text-slate-300">Account SID *</Label>
                <Input
                  id="sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={newAccount.sid}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, sid: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  data-testid="input-twilio-sid"
                />
              </div>
              <div>
                <Label htmlFor="authToken" className="text-slate-300">Auth Token *</Label>
                <Input
                  id="authToken"
                  type="password"
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={newAccount.authToken}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, authToken: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  data-testid="input-twilio-auth-token"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  data-testid="button-cancel-add-account"
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleAddAccount}
                  disabled={addAccountMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  data-testid="button-submit-add-account"
                >
                  {addAccountMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Thêm Tài Khoản
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Twilio Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 bg-slate-800/50 rounded-lg animate-pulse" />
          ))
        ) : twilioAccounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full text-center py-12"
          >
            <Settings className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Chưa có tài khoản Twilio</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Thêm tài khoản Twilio đầu tiên để bắt đầu sử dụng dịch vụ gọi điện tự động
            </p>
          </motion.div>
        ) : (
          twilioAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="pro-card-enhanced hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-blue-400" />
                      {account.accountName}
                    </CardTitle>
                    <Badge 
                      variant={account.status === 'active' ? 'default' : 'secondary'}
                      className={account.status === 'active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }
                    >
                      {account.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Account SID</p>
                    <p className="text-sm text-slate-300 font-mono">
                      {account.sid.substring(0, 8)}...{account.sid.substring(-8)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500">Ngày thêm</p>
                    <p className="text-sm text-slate-300">
                      {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSyncDIDs(account.id)}
                      disabled={syncDIDsMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                      data-testid={`button-sync-dids-${account.id}`}
                    >
                      {syncDIDsMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      Đồng bộ DID
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Info Box */}
      <Card className="pro-card bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Settings className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Hướng dẫn thêm tài khoản Twilio</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <p>1. Đăng nhập vào <a href="https://console.twilio.com" target="_blank" className="text-blue-400 hover:underline">Twilio Console</a></p>
                <p>2. Sao chép <strong>Account SID</strong> và <strong>Auth Token</strong> từ Dashboard</p>
                <p>3. Thêm vào hệ thống và đồng bộ số điện thoại đã mua</p>
                <p>4. Hệ thống sẽ tự động phân bổ DID khi thực hiện cuộc gọi</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}