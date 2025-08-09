import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Check, 
  Shield, 
  Clock, 
  Copy, 
  Wallet,
  Zap,
  Sparkles,
  Star,
  Crown,
  Diamond,
  Banknote,
  ArrowRight,
  CheckCircle,
  Clock3,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/ui/navbar';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  fee: string;
  processingTime: string;
  color: string;
}

export default function Payment() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank_qr',
      name: 'QR Code Ngân Hàng',
      icon: QrCode,
      description: 'Quét mã QR để thanh toán qua app ngân hàng',
      fee: 'Miễn phí',
      processingTime: 'Tức thì',
      color: 'from-emerald-400 via-green-500 to-emerald-600'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: Smartphone,
      description: 'Thanh toán qua ví điện tử MoMo',
      fee: '0.5%',
      processingTime: 'Tức thì',
      color: 'from-pink-400 via-rose-500 to-pink-600'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: Smartphone,
      description: 'Thanh toán qua ví điện tử ZaloPay',
      fee: '0.8%',
      processingTime: 'Tức thì',
      color: 'from-blue-400 via-cyan-500 to-blue-600'
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển Khoản Ngân Hàng',
      icon: CreditCard,
      description: 'Chuyển khoản trực tiếp qua ngân hàng',
      fee: 'Miễn phí',
      processingTime: '5-30 phút',
      color: 'from-purple-400 via-violet-500 to-purple-600'
    }
  ];

  const quickAmounts = [100000, 500000, 1000000, 2000000, 5000000, 10000000]; // VNĐ amounts

  const handlePayment = async () => {
    if (!selectedMethod || !amount) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng chọn phương thức và nhập số tiền",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate API call to generate QR code
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockQRData = {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'CONG TY TNHH TWILIO PRO',
      amount: parseInt(amount),
      transferContent: `NAPTIEN ${user?.id} ${Date.now()}`,
      expireTime: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };

    setQrData(mockQRData);
    setShowQRModal(true);
    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Thông tin đã được sao chép vào clipboard"
    });
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-16 pro-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center space-x-3">
              <Wallet className="h-8 w-8 text-emerald-400" />
              <h1 className="text-4xl font-bold text-emerald-400 glow-text">Nạp Tiền</h1>
            </div>
            <p className="text-foreground-secondary text-lg">Chọn phương thức thanh toán để nạp tiền vào tài khoản</p>
          </motion.div>

          <div className="space-y-6">
            {/* Compact Balance & Account Info - Horizontal Cards */}
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-slate-800/40 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wallet className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-emerald-300 text-sm">Số Dư</h3>
                            <p className="text-slate-400 text-xs">Hiện tại</p>
                            <p className="text-emerald-400 font-bold text-lg truncate">
                              {parseInt(user.balance).toLocaleString('vi-VN')} VNĐ
                            </p>
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
                    <Card className="bg-slate-800/40 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-purple-300 text-sm">Cuộc Gọi</h3>
                            <p className="text-slate-400 text-xs">Còn lại</p>
                            <p className="text-purple-400 font-bold text-lg">
                              {user.callsRemaining?.toLocaleString('vi-VN') || '0'}
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
                    <Card className="bg-slate-800/40 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-cyan-300 text-sm">Gói Dịch Vụ</h3>
                            <p className="text-slate-400 text-xs">Hiện tại</p>
                            <p className="text-cyan-400 font-bold text-lg capitalize">
                              {user.plan || 'Cơ bản'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                </motion.div>
              </div>
            )}

            {/* Compact Amount Input */}
            <Card className="bg-slate-800/40 border border-purple-500/30 hover:border-purple-400/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-purple-300 text-lg flex items-center">
                  <Banknote className="h-5 w-5 mr-2" />
                  Nhập Số Tiền Nạp
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                  {/* Premium Amount Input */}
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Banknote className="h-5 w-5 text-emerald-400" />
                      </div>
                      <Input
                        type="number"
                        placeholder="Nhập số tiền (VNĐ)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10 pr-16 h-10 bg-slate-700/50 border-slate-600 text-white font-medium focus:border-purple-500 focus:ring-purple-500/25 transition-all duration-300"
                        data-testid="input-payment-amount"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-medium">VNĐ</span>
                      </div>
                    </div>
                    
                {/* Compact Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {quickAmounts.map((quickAmount, index) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="p-2.5 bg-slate-700/50 hover:bg-purple-600/30 border border-slate-600 hover:border-purple-500/50 rounded-lg transition-all duration-300 text-sm font-medium text-slate-300 hover:text-white"
                      data-testid={`button-quick-amount-${quickAmount}`}
                    >
                      {(quickAmount / 1000).toLocaleString()}K
                    </button>
                  ))}
                </div>
                  </div>
                </CardContent>
              </Card>

            {/* Compact Payment Methods */}
            <Card className="bg-slate-800/40 border border-emerald-500/30 hover:border-emerald-400/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-emerald-300 text-lg flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Chọn Phương Thức Thanh Toán
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                        selectedMethod === method.id
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/30 hover:bg-slate-700/50'
                      }`}
                      data-testid={`button-payment-method-${method.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <method.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white text-sm">{method.name}</h4>
                            {selectedMethod === method.id && (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{method.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-emerald-400 text-xs font-medium">
                              Phí: {method.fee}
                            </span>
                            <span className="text-blue-400 text-xs font-medium">
                              {method.processingTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </CardContent>
            </Card>

            {/* Compact Payment Summary & Action */}
            <Card className="bg-slate-800/40 border border-cyan-500/30 hover:border-cyan-400/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-cyan-300 text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Thông Tin Thanh Toán
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 text-sm">Số tiền nạp:</span>
                    <span className="text-white font-semibold">
                      {amount ? parseInt(amount).toLocaleString() : '0'} VNĐ
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 text-sm">Phí giao dịch:</span>
                    <span className="text-emerald-400 font-medium">
                      {selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.fee : 'Miễn phí'}
                    </span>
                  </div>
                  
                  {selectedMethod && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400 text-sm">Thời gian xử lý:</span>
                      <span className="text-cyan-400 font-medium">
                        {paymentMethods.find(m => m.id === selectedMethod)?.processingTime}
                      </span>
                    </div>
                  )}
                </div>
                  
                <div className="border-t border-slate-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Tổng cộng:</span>
                    <span className="text-cyan-400 font-bold text-lg">
                      {amount ? parseInt(amount).toLocaleString() : '0'} VNĐ
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={!selectedMethod || !amount || isProcessing}
                  className="w-full px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 font-semibold disabled:opacity-50"
                  data-testid="button-process-payment"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Đang Xử Lý...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowRight className="w-4 h-4" />
                      <span>Tiến Hành Thanh Toán</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="qr-payment-modal max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-400 text-center">
              Quét Mã QR Để Thanh Toán
            </DialogTitle>
          </DialogHeader>
          
          {qrData && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="w-64 h-64 mx-auto bg-white rounded-lg p-4 mb-4">
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-gray-600" />
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  Sử dụng app ngân hàng để quét mã QR
                </p>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="text-white font-semibold">{qrData.bankName}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono">{qrData.accountNumber}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(qrData.accountNumber)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="text-white font-semibold">{qrData.accountName}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Số tiền:</span>
                  <span className="text-emerald-400 font-bold text-lg">
                    {qrData.amount.toLocaleString()} VNĐ
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Nội dung:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">{qrData.transferContent}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(qrData.transferContent)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="text-center p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <Clock className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                <p className="text-orange-400 font-semibold">
                  Mã QR hết hạn sau: 14:32
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-2">Hướng dẫn thanh toán:</h4>
                <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                  <li>Chọn chức năng "Quét mã QR" hoặc "Chuyển tiền QR"</li>
                  <li>Quét mã QR phía trên</li>
                  <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                  <li>Số dư sẽ được cập nhật tự động sau khi thanh toán thành công</li>
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}