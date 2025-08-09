import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, DollarSign, Zap, Plus, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: CreditCard,
    description: 'Nhanh chóng và bảo mật',
    color: 'from-blue-600 to-cyan-600',
    recommended: true
  },
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: Wallet,
    description: 'Thanh toán liên mạnh',
    color: 'from-pink-600 to-purple-600'
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    icon: Zap,
    description: 'Thanh toán tiện lợi',
    color: 'from-emerald-600 to-teal-600'
  }
];

export default function PaymentNew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = customAmount ? parseInt(customAmount.replace(/,/g, '')) : selectedAmount;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  const handleCustomAmountChange = (value: string) => {
    // Remove non-digits
    const numericValue = value.replace(/\D/g, '');
    // Format with commas
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setCustomAmount(formattedValue);
    setSelectedAmount(0); // Clear quick amount selection
  };

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(''); // Clear custom amount
  };

  const paymentMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      return await apiRequest('POST', '/api/payments/create', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Yêu cầu nạp tiền thành công",
        description: "Vui lòng theo dõi hướng dẫn thanh toán",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // Handle payment response (redirect to payment gateway, show QR code, etc.)
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo yêu cầu thanh toán",
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    if (!totalAmount || totalAmount < 10000) {
      toast({
        title: "Lỗi",
        description: "Số tiền tối thiểu là 10,000 VNĐ",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    paymentMutation.mutate({
      amount: totalAmount,
      method: selectedMethod
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-glow-emerald mb-2">
          Nạp Tiền Tài Khoản
        </h1>
        <p className="text-slate-400">
          Nạp tiền để sử dụng dịch vụ gọi điện tự động
        </p>
      </motion.div>

      {/* Current Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="premium-card card-emerald">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Wallet className="w-16 h-16 text-glow-emerald mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Số dư hiện tại</h3>
              <p className="text-3xl font-bold text-glow-emerald">
                {formatCurrency(Number(user?.balance || 0))}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1 text-emerald-400" />
                Bảo mật cao
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-emerald-400" />
                Giao dịch nhanh
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Amount Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="premium-card card-purple">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-glow-purple flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Chọn Số Tiền
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Amount Buttons */}
              <div>
                <Label className="text-slate-300 text-sm mb-3 block">Số tiền phổ biến</Label>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => handleQuickAmount(amount)}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      className={`btn-premium ${
                        selectedAmount === amount
                          ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-500'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label className="text-slate-300 text-sm">Hoặc nhập số tiền khác</Label>
                <div className="relative">
                  <Input
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 focus:border-purple-400/50 text-white pr-12"
                    placeholder="Nhập số tiền..."
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                    VNĐ
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Số tiền tối thiểu: 10,000 VNĐ
                </p>
              </div>

              {/* Selected Amount Display */}
              {totalAmount > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Số tiền nạp:</span>
                    <span className="text-glow-purple font-bold text-lg">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-400 text-sm">Số dư sau nạp:</span>
                    <span className="text-glow-emerald font-semibold">
                      {formatCurrency(Number(user?.balance || 0) + totalAmount)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="premium-card card-cyan">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-glow-cyan flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Phương Thức Thanh Toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedMethod === method.id
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500/70'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                      <method.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-slate-200">{method.name}</h4>
                        {method.recommended && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            Khuyến nghị
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Button
          onClick={handlePayment}
          disabled={!totalAmount || totalAmount < 10000 || paymentMutation.isPending}
          className="btn-premium px-8 py-3 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white disabled:opacity-50"
        >
          {paymentMutation.isPending ? (
            <div className="flex items-center">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Đang xử lý...
            </div>
          ) : (
            <div className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Nạp {totalAmount > 0 ? formatCurrency(totalAmount) : 'Tiền'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          )}
        </Button>
        
        {totalAmount > 0 && (
          <p className="text-slate-400 text-sm mt-3">
            Bạn sẽ được chuyển đến trang thanh toán an toàn
          </p>
        )}
      </motion.div>
    </div>
  );
}