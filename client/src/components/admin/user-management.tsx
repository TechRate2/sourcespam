import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Edit, Loader2, DollarSign } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPatch } from '@/lib/api';
import type { User } from '@shared/schema';

// Using imported User type from schema

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiGet('/api/admin/users'),
  });

  const updateBalanceMutation = useMutation({
    mutationFn: ({ userId, amount }: { userId: number; amount: string }) => 
      apiPatch(`/api/admin/users/${userId}/balance`, { amount }),
    onSuccess: (response: any) => {
      toast({
        title: "Cập nhật số dư thành công",
        description: response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsBalanceDialogOpen(false);
      setSelectedUser(null);
      setBalanceAmount('');
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi cập nhật số dư",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBalanceUpdate = (user: User, action: 'add' | 'subtract') => {
    setSelectedUser(user);
    setBalanceAmount('');
    setIsBalanceDialogOpen(true);
  };

  const handleSubmitBalance = () => {
    if (!selectedUser || !balanceAmount.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Lỗi",
        description: "Số tiền phải là số dương",
        variant: "destructive",
      });
      return;
    }

    updateBalanceMutation.mutate({
      userId: selectedUser.id,
      amount: balanceAmount,
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'basic':
        return 'bg-blue-500/20 text-blue-400 border-blue-400';
      case 'pro':
        return 'bg-purple-500/20 text-purple-400 border-purple-400';
      case 'enterprise':
        return 'bg-gold-500/20 text-yellow-400 border-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      <Card className="glass-card glow-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-purple-400 glow-text">
            Quản Lý Người Dùng ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-300 text-lg mb-2">Chưa có người dùng nào</p>
              <p className="text-slate-400">Người dùng sẽ hiển thị tại đây sau khi đăng ký</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user: User, index: number) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg glow-border hover:bg-slate-800/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-medium">{user.fullName}</h3>
                        <Badge className={getPlanBadgeColor(user.plan)}>
                          {user.plan.toUpperCase()}
                        </Badge>
                        {user.role === 'admin' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-400">
                            ADMIN
                          </Badge>
                        )}
                        {!user.isActive && (
                          <Badge variant="secondary" className="bg-slate-500/20 text-slate-400">
                            Tạm dừng
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-slate-400 text-sm space-y-1">
                        <div>{user.email} • @{user.username}</div>
                        <div className="flex items-center space-x-4">
                          <span>Số dư: <span className="text-emerald-400 font-medium">{Number(user.balance).toLocaleString()} VNĐ</span></span>
                          <span>Cuộc gọi: <span className="text-cyan-400 font-medium">{user.callsRemaining.toLocaleString()}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog open={isBalanceDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                      setIsBalanceDialogOpen(open);
                      if (!open) {
                        setSelectedUser(null);
                        setBalanceAmount('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => handleBalanceUpdate(user, 'add')}
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-400"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Nạp
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card glow-border">
                        <DialogHeader>
                          <DialogTitle className="text-cyan-400 glow-text">
                            Cập Nhật Số Dư - {selectedUser?.fullName}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-300">Số dư hiện tại</Label>
                            <p className="text-lg font-semibold text-emerald-400">
                              {Number(selectedUser?.balance || 0).toLocaleString()} VNĐ
                            </p>
                          </div>
                          <div>
                            <Label className="text-slate-300">Số tiền mới (VNĐ)</Label>
                            <Input
                              type="number"
                              value={balanceAmount}
                              onChange={(e) => setBalanceAmount(e.target.value)}
                              placeholder="Nhập số dư mới"
                              className="bg-slate-800/50 glow-border text-white"
                              min="0"
                              step="1000"
                            />
                          </div>
                          <div className="flex space-x-4">
                            <Button
                              onClick={handleSubmitBalance}
                              disabled={updateBalanceMutation.isPending}
                              className="bg-gradient-to-r from-emerald-500 to-green-500 neon-button"
                            >
                              {updateBalanceMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <DollarSign className="mr-2 h-4 w-4" />
                              )}
                              Cập Nhật
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsBalanceDialogOpen(false)}
                              className="glow-border hover:bg-slate-800/50"
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
