import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { 
  Wallet, 
  DollarSign, 
  CreditCard, 
  Infinity,
  ArrowUp,
  Shield,
  Crown,
  Zap,
  Sparkles,
  Star,
  Diamond,
  Banknote,
  ArrowRight,
  CheckCircle,
  Clock3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminPayment() {
  const [amount, setAmount] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin unlimited topup mutation
  const adminTopupMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest('POST', '/api/admin/balance/unlimited', { amount });
    },
    onSuccess: (data) => {
      // CRITICAL FIX: Force immediate UI update
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      
      // Force refetch để UI update ngay lập tức
      queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Thành công",
        description: `Đã nạp ${parseFloat(amount).toLocaleString()} VNĐ vào tài khoản`,
      });
      setAmount('');
    },
    onError: (error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTopup = () => {
    const topupAmount = parseFloat(amount);
    if (isNaN(topupAmount) || topupAmount <= 0) {
      toast({
        title: "Lỗi",
        description: "Số tiền không hợp lệ",
        variant: "destructive",
      });
      return;
    }
    adminTopupMutation.mutate(topupAmount);
  };

  const quickAmounts = [100000, 500000, 1000000, 5000000, 10000000]; // VNĐ amounts

  return (
    <div className="min-h-screen pro-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center mr-4 shadow-lg shadow-yellow-500/25 animate-pulse">
              <Crown className="w-8 h-8 text-white drop-shadow-sm" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Admin Payment Center
            </h1>
          </div>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            Hệ thống nạp tiền cao cấp dành riêng cho quản trị viên với quyền hạn không giới hạn
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 text-purple-300 text-sm">
              <Infinity className="w-4 h-4 mr-2" />
              Unlimited Access
            </Badge>
            <Badge className="px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500/30 text-emerald-300 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Instant Processing
            </Badge>
            <Badge className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-blue-300 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Admin Only
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Premium Admin Features Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            <Card className="pro-card-enhanced relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mr-3 shadow-lg shadow-yellow-500/25">
                    <Shield className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  Đặc Quyền Admin
                  <Badge className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    VIP
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                <div className="space-y-5">
                  {[
                    {
                      icon: Infinity,
                      title: "Nạp Tiền Vô Hạn",
                      description: "Không giới hạn số tiền nạp",
                      gradient: "from-emerald-500 via-green-500 to-emerald-600"
                    },
                    {
                      icon: Zap,
                      title: "Xử Lý Tức Thì",
                      description: "Không cần QR code hay xác thực",
                      gradient: "from-blue-500 via-cyan-500 to-blue-600"
                    },
                    {
                      icon: Crown,
                      title: "Quyền Admin",
                      description: "Chỉ dành cho tài khoản admin",
                      gradient: "from-purple-500 via-pink-500 to-purple-600"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center space-x-4 group"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                        <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold text-lg">{feature.title}</div>
                        <div className="text-slate-300 text-sm leading-relaxed">{feature.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="relative p-4 bg-gradient-to-r from-yellow-600/20 via-orange-600/10 to-red-600/20 rounded-xl border border-yellow-500/30 mt-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-xl"></div>
                  <div className="relative flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-slate-200 text-sm leading-relaxed">
                      <strong className="text-yellow-400">Lưu ý quan trọng:</strong> Tính năng này chỉ dành cho admin để quản lý hệ thống. 
                      Người dùng thường cần sử dụng QR code để nạp tiền một cách an toàn.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <Card className="pro-card-enhanced relative overflow-hidden group h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/25">
                    <Wallet className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  Nạp Tiền Admin
                  <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                    <Infinity className="w-3 h-3 mr-1" />
                    Unlimited
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Premium Quick Amount Buttons */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <Label className="text-white font-semibold">Số tiền nhanh (VNĐ)</Label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {quickAmounts.map((quickAmount, index) => (
                      <motion.button
                        key={quickAmount}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => setAmount(quickAmount.toString())}
                        className="relative group p-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-emerald-600 hover:to-green-600 rounded-xl border border-slate-600 hover:border-emerald-500 transition-all duration-300 transform hover:scale-105"
                        data-testid={`button-admin-quick-amount-${quickAmount}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/20 group-hover:to-green-500/20 rounded-xl transition-all duration-300"></div>
                        <div className="relative flex items-center justify-center space-x-2">
                          <Diamond className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
                          <span className="text-white font-semibold">
                            {(quickAmount / 1000).toLocaleString()}K
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Premium Custom Amount Input */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-blue-400" />
                    <Label className="text-white font-semibold">Số tiền tùy chọn (VNĐ)</Label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                    <Input
                      type="number"
                      placeholder="Nhập số tiền VNĐ..."
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 h-12 bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-slate-600 focus:border-emerald-500 text-white placeholder-slate-400 text-lg font-semibold rounded-xl transition-all duration-300"
                      min="0"
                      step="1000"
                      data-testid="input-admin-amount"
                    />
                  </div>
                  <p className="text-slate-400 text-sm mt-2">
                    Số tiền tối thiểu: 10,000 VNĐ - Không giới hạn tối đa
                  </p>
                </div>

                {/* Premium Amount Preview */}
                {amount && !isNaN(parseFloat(amount)) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative p-4 bg-gradient-to-r from-emerald-600/20 via-green-600/10 to-emerald-600/20 rounded-xl border-2 border-emerald-500/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-xl"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-slate-300 text-sm font-medium">Số tiền sẽ nạp:</div>
                          <div className="text-white text-lg font-bold">
                            {parseInt(amount).toLocaleString()} VNĐ
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 text-sm font-semibold">Admin Priority</div>
                        <div className="text-slate-400 text-xs">Xử lý tức thì</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Premium Admin Topup Button */}
                <Button
                  onClick={handleTopup}
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || adminTopupMutation.isPending}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-800 text-white font-bold text-lg relative overflow-hidden group border-0 shadow-lg shadow-emerald-500/25 transition-all duration-300"
                  data-testid="button-admin-topup"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    {adminTopupMutation.isPending ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-5 h-5 text-white" />
                        <span>Nạp Tiền Admin</span>
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </Button>

                {/* Premium Security Info */}
                <div className="relative p-4 bg-gradient-to-r from-purple-600/20 via-blue-600/10 to-purple-600/20 rounded-xl border border-purple-500/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl"></div>
                  <div className="relative flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-purple-300 font-bold text-sm mb-2">Admin Security Notice</div>
                      <div className="text-slate-200 text-sm leading-relaxed">
                        Không cần xác thực qua QR code hay ngân hàng. Tiền sẽ được cộng trực tiếp vào tài khoản admin với độ bảo mật cao nhất.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}