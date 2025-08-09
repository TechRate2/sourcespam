import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderSync, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';
import type { TwilioAccount } from '@shared/schema';

// Using imported TwilioAccount type from schema

export default function TwilioAccounts() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTokens, setShowTokens] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState({
    sid: '',
    authToken: '',
    accountName: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['/api/admin/twilio-accounts'],
    queryFn: () => apiGet('/api/admin/twilio-accounts'),
  });

  const addAccountMutation = useMutation({
    mutationFn: (data: typeof formData) => apiPost('/api/admin/twilio-accounts', data),
    onSuccess: (response: any) => {
      toast({
        title: "Thành công",
        description: response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/twilio-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setFormData({ sid: '', authToken: '', accountName: '' });
      setShowAddForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi thêm tài khoản Twilio",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncDidsMutation = useMutation({
    mutationFn: (accountId: number) => apiPost(`/api/admin/sync-dids/${accountId}`),
    onSuccess: (response: any) => {
      toast({
        title: "Đồng bộ DID thành công",
        description: response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dids'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi đồng bộ DID",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sid.trim() || !formData.authToken.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ SID và Auth Token",
        variant: "destructive",
      });
      return;
    }

    addAccountMutation.mutate(formData);
  };

  const toggleTokenVisibility = (accountId: number) => {
    setShowTokens(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const maskToken = (token: string) => {
    if (token.length <= 8) return '*'.repeat(token.length);
    return token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4);
  };

  const handleSyncDids = (accountId: number) => {
    syncDidsMutation.mutate(accountId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Account Form */}
      <Card className="premium-card">
        <CardHeader className="flex flex-row items-center justify-between premium-table-header">
          <CardTitle className="text-2xl font-bold text-purple-400 glow-text">
            Quản Lý Tài Khoản Twilio
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 neon-button px-6 py-3 text-lg font-semibold"
          >
            <Plus className="mr-2 h-5 w-5" />
            Thêm Tài Khoản
          </Button>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-purple-500/20 pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-purple-300 mb-3 block font-semibold">Account SID *</Label>
                  <Input
                    type="text"
                    value={formData.sid}
                    onChange={(e) => setFormData(prev => ({ ...prev, sid: e.target.value }))}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="premium-input text-white text-lg py-3"
                    required
                  />
                </div>
                <div>
                  <Label className="text-purple-300 mb-3 block font-semibold">Auth Token *</Label>
                  <Input
                    type="password"
                    value={formData.authToken}
                    onChange={(e) => setFormData(prev => ({ ...prev, authToken: e.target.value }))}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="premium-input text-white text-lg py-3"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-purple-300 mb-3 block font-semibold">Tên tài khoản (tùy chọn)</Label>
                <Input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Tên mô tả cho tài khoản"
                  className="premium-input text-white text-lg py-3"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={addAccountMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 neon-button px-8 py-3 text-lg font-semibold"
                >
                  {addAccountMutation.isPending ? (
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="mr-3 h-5 w-5" />
                  )}
                  Thêm & Đồng Bộ DID
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-900/20 px-8 py-3 text-lg font-semibold"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Accounts List */}
      <div className="space-y-6">
        {accounts.length === 0 ? (
          <Card className="premium-card">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                <Plus className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-slate-300 text-lg mb-2">Chưa có tài khoản Twilio nào</p>
              <p className="text-slate-400">Thêm tài khoản đầu tiên để bắt đầu sử dụng hệ thống</p>
            </CardContent>
          </Card>
        ) : (
          <div className="premium-table">
            {/* Table Header */}
            <div className="premium-table-header grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-purple-300 text-sm uppercase tracking-wider">
              <div className="col-span-3">Tên tài khoản</div>
              <div className="col-span-4">Account SID</div>
              <div className="col-span-2">Trạng thái</div>
              <div className="col-span-2">Ngày tạo</div>
              <div className="col-span-1">Thao tác</div>
            </div>
            
            {/* Table Rows */}
            <div className="divide-y divide-purple-500/10">
              {accounts.map((account: TwilioAccount, index: number) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-table-row grid grid-cols-12 gap-4 px-6 py-4"
                >
                  <div className="col-span-3 premium-table-cell">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${account.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                      <span className="font-semibold text-white">
                        {account.accountName || `Tài khoản ${account.id}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-4 premium-table-cell font-mono text-cyan-300 text-sm">
                    {account.sid}
                  </div>
                  
                  <div className="col-span-2 premium-table-cell">
                    <Badge className={account.isActive ? 
                      "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : 
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }>
                      {account.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </div>
                  
                  <div className="col-span-2 premium-table-cell text-slate-400 text-sm">
                    {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  
                  <div className="col-span-1 premium-table-cell">
                    <Button
                      size="sm"
                      onClick={() => handleSyncDids(account.id)}
                      disabled={syncDidsMutation.isPending}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 neon-button px-3 py-1"
                    >
                      {syncDidsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FolderSync className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
