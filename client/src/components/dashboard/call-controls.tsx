import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Play, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiPost } from '@/lib/api';

export default function CallControls() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callTimes, setCallTimes] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testCallMutation = useMutation({
    mutationFn: (data: { to: string }) => apiPost('/api/calls/test', data),
    onSuccess: (response: any) => {
      toast({
        title: "Cuộc gọi thử thành công",
        description: response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi cuộc gọi thử",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const makeCallMutation = useMutation({
    mutationFn: (data: { toNumber: string; times: number }) => apiPost('/api/calls/make', data),
    onSuccess: (response: any) => {
      toast({
        title: "Cuộc gọi thành công",
        description: `${response.message} - Chi phí: ${response.cost}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setPhoneNumber('');
      setCallTimes(1);
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi thực hiện cuộc gọi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format Vietnamese phone numbers
    if (cleaned.startsWith('84')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleTestCall = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }
    testCallMutation.mutate({ to: phoneNumber });
  };

  const handleMakeCall = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (callTimes < 1 || callTimes > 10) {
      toast({
        title: "Lỗi",
        description: "Số lần gọi phải từ 1 đến 10",
        variant: "destructive",
      });
      return;
    }

    makeCallMutation.mutate({ toNumber: phoneNumber, times: callTimes });
  };

  const getDisplayPhoneNumber = () => {
    if (!phoneNumber) return '';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('84')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+84${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+84${cleaned}`;
    }
    
    return phoneNumber;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass-card glow-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-cyan-400 glow-text">
            Thực Hiện Cuộc Gọi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="block text-slate-300 mb-2">Số điện thoại đích</Label>
            <Input
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="09xxxxxxxx hoặc 03xxxxxxxx"
              className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400 transition-all duration-300"
            />
            <div className="text-xs text-slate-400 mt-1">
              Hệ thống sẽ tự động chuyển đổi sang định dạng: {getDisplayPhoneNumber()}
            </div>
          </div>
          
          <div>
            <Label className="block text-slate-300 mb-2">Số lần gọi</Label>
            <Input
              type="number"
              value={callTimes}
              onChange={(e) => setCallTimes(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              min="1"
              max="10"
              className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400 transition-all duration-300"
            />
            <div className="text-xs text-slate-400 mt-1">
              Sẽ có delay 5 giây giữa các cuộc gọi và tự động hangup sau 15 giây
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={handleTestCall}
              disabled={testCallMutation.isPending}
              variant="outline"
              className="flex-1 glow-border hover:bg-slate-800/50 transition-all duration-300"
            >
              {testCallMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Phone className="mr-2 h-4 w-4" />
              )}
              Gọi Thử
            </Button>
            
            <Button
              onClick={handleMakeCall}
              disabled={makeCallMutation.isPending}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 neon-button transition-all duration-300"
            >
              {makeCallMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Bắt Đầu Gọi
            </Button>
          </div>
          
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">Lưu ý quan trọng:</h4>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Hệ thống sẽ chọn DID theo thuật toán round-robin</li>
              <li>• Nếu số này đã bị DID trước từng gọi và thất bại, sẽ dùng DID khác</li>
              <li>• Cuộc gọi tự động hangup sau 15 giây nếu người nghe bắt máy</li>
              <li>• Chi phí sẽ được tính theo thời lượng thực tế của Twilio</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
