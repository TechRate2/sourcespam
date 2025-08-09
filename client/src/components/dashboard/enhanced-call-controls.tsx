import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Plus, Trash2, Play, Loader2, Users, PhoneCall } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CallTarget {
  id: string;
  phoneNumber: string;
  callCount: number;
  note?: string;
}

export default function EnhancedCallControls() {
  const [callTargets, setCallTargets] = useState<CallTarget[]>([
    { id: '1', phoneNumber: '', callCount: 1, note: '' }
  ]);
  const [callMode, setCallMode] = useState<'single' | 'multiple'>('single');
  const [callCount, setCallCount] = useState<number>(1); // Số lượng cuộc gọi muốn thực hiện
  const [targetPhoneNumber, setTargetPhoneNumber] = useState<string>(''); // Số điện thoại đích
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // TRIỆT ĐỂ FIXED: Single call mutation matching backend parameters
  const singleCallMutation = useMutation({
    mutationFn: async ({ phoneNumber, count }: { phoneNumber: string; count: number }) => {
      console.log(`🎯 FRONTEND: Making ${count} calls to ${phoneNumber}`);
      const response = await apiRequest('POST', '/api/calls/make', { 
        to: phoneNumber,      // Backend expects 'to' not 'phoneNumber'
        times: count          // Backend expects 'times' not 'callCount'
      });
      return await response.json();
    },
    onSuccess: (response) => {
      console.log(`✅ FRONTEND RESPONSE:`, response);
      
      // Check if insufficient balance (success: false)
      if (response.success === false) {
        toast({
          title: "Thông báo",
          description: response.message, // "Số dư không đủ. Vui lòng nạp thêm tiền"
          variant: "destructive",
        });
        return;
      }
      
      // TRIỆT ĐỂ ENHANCED: Display input=output guarantee result for successful calls
      const isSuccess = response.success;
      const inputOutput = `${response.actualCalls}/${response.requestedCalls}`;
      const successRate = response.successRate || '100%';
      
      const callsInfo = response.calls && response.calls.length > 0 
        ? `\n\nKết quả chi tiết:\n${response.calls.map((call: any, i: number) => 
            `• Cuộc gọi ${i + 1}: ${call.from} → ${call.to} (${call.status})`
          ).join('\n')}`
        : '';
      
      const failures = response.failures && response.failures.length > 0
        ? `\n\nLỗi (${response.failures.length}):\n${response.failures.map((fail: any, i: number) => 
            `• ${fail.attempt}: ${fail.error}`
          ).join('\n')}`
        : '';
      
      toast({
        title: isSuccess 
          ? `✅ THÀNH CÔNG HOÀN TOÀN: ${inputOutput} cuộc gọi (${successRate})`
          : `⚠️ CHỈ THÀNH CÔNG MỘT PHẦN: ${inputOutput} cuộc gọi (${successRate})`,
        description: `${response.message}${callsInfo}${failures}`,
        variant: isSuccess ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/calls/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi cuộc gọi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enhanced Multiple calls mutation với input=output guarantee
  const multipleCallsMutation = useMutation({
    mutationFn: async (targets: CallTarget[]) => {
      console.log(`🎯 FRONTEND: Making bulk calls to ${targets.length} numbers`);
      const results = [];
      
      for (const target of targets) {
        if (target.phoneNumber.trim() && target.callCount > 0) {
          try {
            console.log(`🎯 Calling ${target.phoneNumber} ${target.callCount} times`);
            const response = await apiRequest('POST', '/api/calls/make', { 
              to: target.phoneNumber,
              times: target.callCount  // Sử dụng số lần gọi riêng cho mỗi số
            });
            const result = await response.json();
            results.push({ ...result, target });
          } catch (error: any) {
            results.push({ 
              error: error.message, 
              target,
              success: false,
              requestedCalls: target.callCount,
              actualCalls: 0
            });
          }
        }
      }
      return results;
    },
    onSuccess: (results) => {
      console.log(`✅ FRONTEND BULK RESPONSE:`, results);
      
      let totalRequested = 0;
      let totalActual = 0;
      let totalSuccessful = 0;
      let totalFailed = 0;
      
      const details = results.map((result, i) => {
        const requested = result.requestedCalls || result.target?.callCount || 0;
        const actual = result.actualCalls || 0;
        totalRequested += requested;
        totalActual += actual;
        
        if (result.success) {
          totalSuccessful++;
        } else {
          totalFailed++;
        }
        
        return `• ${result.target?.phoneNumber}: ${actual}/${requested} cuộc gọi (${result.successRate || '0%'})`;
      }).join('\n');
      
      const overallSuccessRate = totalRequested > 0 
        ? `${((totalActual / totalRequested) * 100).toFixed(1)}%`
        : '0%';
      
      const isCompleteSuccess = totalActual === totalRequested && totalRequested > 0;
      
      toast({
        title: isCompleteSuccess 
          ? `✅ THÀNH CÔNG HOÀN TOÀN: ${totalActual}/${totalRequested} cuộc gọi (${overallSuccessRate})`
          : `⚠️ CHỈ THÀNH CÔNG MỘT PHẦN: ${totalActual}/${totalRequested} cuộc gọi (${overallSuccessRate})`,
        description: `Số điện thoại thành công: ${totalSuccessful}, Lỗi: ${totalFailed}\n\nChi tiết:\n${details}`,
        variant: isCompleteSuccess ? "default" : "destructive",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/calls/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi cuộc gọi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addTarget = () => {
    if (callTargets.length >= 3) {
      toast({
        title: "Giới hạn số điện thoại",
        description: "Tối đa 3 số điện thoại cùng lúc",
        variant: "destructive",
      });
      return;
    }
    
    setCallTargets(prev => [...prev, { 
      id: Date.now().toString(), 
      phoneNumber: '',
      callCount: 1,
      note: '' 
    }]);
  };

  const removeTarget = (id: string) => {
    setCallTargets(prev => prev.filter(t => t.id !== id));
  };

  const updateTarget = (id: string, field: keyof CallTarget, value: string | number) => {
    setCallTargets(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const formatPhoneNumber = (number: string): string => {
    // Auto-format Vietnamese phone numbers
    let cleaned = number.replace(/\D/g, '');
    
    if (cleaned.startsWith('84')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+84${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+84${cleaned}`;
    }
    
    return cleaned;
  };

  const handleSingleCall = () => {
    const phoneNumber = targetPhoneNumber?.trim();
    if (!phoneNumber) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (callCount < 1 || callCount > 10 || isNaN(callCount)) {
      toast({
        title: "Số lượng không hợp lệ",
        description: "Số lượng cuộc gọi phải từ 1-10",
        variant: "destructive",
      });
      return;
    }

    const formatted = formatPhoneNumber(phoneNumber);
    singleCallMutation.mutate({ phoneNumber: formatted, count: callCount });
  };

  const handleMultipleCalls = () => {
    const validTargets = callTargets.filter(t => t.phoneNumber.trim() && t.callCount > 0);
    
    if (validTargets.length === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập ít nhất một số điện thoại với số lần gọi > 0",
        variant: "destructive",
      });
      return;
    }

    // Format all phone numbers
    const formattedTargets = validTargets.map(t => ({
      ...t,
      phoneNumber: formatPhoneNumber(t.phoneNumber)
    }));

    multipleCallsMutation.mutate(formattedTargets);
  };

  const isLoading = singleCallMutation.isPending || multipleCallsMutation.isPending;
  const validTargetsCount = callTargets.filter(t => t.phoneNumber.trim() && t.callCount > 0).length;
  const totalCalls = callTargets
    .filter(t => t.phoneNumber.trim() && t.callCount > 0)
    .reduce((sum, target) => sum + target.callCount, 0);
  const totalCost = totalCalls * 600;

  return (
    <Card className="premium-card card-blue">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-glow-cyan flex items-center justify-between">
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Điều Khiển Cuộc Gọi
          </div>
          <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
            600 VNĐ/cuộc gọi
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="spacing-premium">
        {/* Compact Mode Selection */}
        <div className="flex space-x-2">
          <Button
            variant={callMode === 'single' ? 'default' : 'outline'}
            onClick={() => setCallMode('single')}
            className={`btn-premium ${callMode === 'single' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
            data-testid="button-single-mode"
          >
            <PhoneCall className="w-3 h-3 mr-1" />
            Gọi Đơn
          </Button>
          <Button
            variant={callMode === 'multiple' ? 'default' : 'outline'}
            onClick={() => setCallMode('multiple')}
            className={`btn-premium ${callMode === 'multiple' 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
            data-testid="button-multiple-mode"
          >
            <Users className="w-3 h-3 mr-1" />
            Gọi Nhiều
          </Button>
        </div>

        {/* Single Call Mode - Phone Number and Call Count */}
        {callMode === 'single' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3"
          >
            <div>
              <Label className="text-glow-cyan text-xs">Số điện thoại muốn gọi</Label>
              <Input
                placeholder="Ví dụ: 0987654321 hoặc +84987654321"
                value={targetPhoneNumber}
                onChange={(e) => setTargetPhoneNumber(e.target.value)}
                className="h-8 bg-slate-900 border-slate-600 text-white text-xs focus:border-cyan-400/50"
                data-testid="input-target-phone"
              />
            </div>
            
            <div>
              <Label className="text-glow-cyan text-xs">Số lượng cuộc gọi (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="Nhập số lượng..."
                value={callCount === 0 ? '' : callCount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setCallCount(0);
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setCallCount(numValue);
                    }
                  }
                }}
                className="h-8 bg-slate-900 border-slate-600 text-white text-xs focus:border-cyan-400/50"
                data-testid="input-call-count"
              />
              <p className="text-xs text-glow-emerald mt-1">
                Chi phí: {callCount > 0 ? (callCount * 600).toLocaleString() : '0'} VNĐ
              </p>
            </div>
          </motion.div>
        )}

        {/* Multiple Call Mode - Different Phone Numbers */}
        {callMode === 'multiple' && (
          <div className="space-y-4">
            {callTargets.map((target, index) => (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label className="text-slate-300">
                        Số điện thoại #{index + 1}
                      </Label>
                      <Input
                        placeholder="Ví dụ: 0987654321 hoặc +84987654321"
                        value={target.phoneNumber}
                        onChange={(e) => updateTarget(target.id, 'phoneNumber', e.target.value)}
                        className="bg-slate-900 border-slate-600 text-white"
                        data-testid={`input-phone-${index}`}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-300">Số lần gọi (1-10)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="1"
                          value={target.callCount === 0 ? '' : target.callCount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || value === '0') {
                              updateTarget(target.id, 'callCount', 0); // Cho phép xóa về 0
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
                                updateTarget(target.id, 'callCount', numValue);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Khi blur, nếu là 0 hoặc rỗng thì set về 1
                            const value = e.target.value;
                            if (value === '' || value === '0') {
                              updateTarget(target.id, 'callCount', 1);
                            }
                          }}
                          className="bg-slate-900 border-slate-600 text-white"
                          data-testid={`input-call-count-${index}`}
                        />
                        <p className="text-xs text-glow-emerald mt-1">
                          {target.callCount > 0 ? (target.callCount * 600).toLocaleString() : '0'} VNĐ
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-slate-300">Ghi chú (tuỳ chọn)</Label>
                        <Input
                          placeholder="Ghi chú cho số này..."
                          value={target.note || ''}
                          onChange={(e) => updateTarget(target.id, 'note', e.target.value)}
                          className="bg-slate-900 border-slate-600 text-white"
                          data-testid={`input-note-${index}`}
                        />
                      </div>
                    </div>
                  </div>

                  {callTargets.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeTarget(target.id)}
                      className="border-red-600 text-red-400 hover:bg-red-800"
                      data-testid={`button-remove-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Target Button (Multiple Mode) */}
        {callMode === 'multiple' && (
          <Button
            variant="outline"
            onClick={addTarget}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            data-testid="button-add-target"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Số Điện Thoại
          </Button>
        )}

        {/* Call Actions */}
        <div className="flex space-x-3">
          {callMode === 'single' ? (
            <Button
              onClick={handleSingleCall}
              disabled={isLoading || !targetPhoneNumber?.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              data-testid="button-make-single-call"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Phone className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Đang gọi...' : 'Thực hiện cuộc gọi'}
            </Button>
          ) : (
            <Button
              onClick={handleMultipleCalls}
              disabled={isLoading || totalCalls === 0}
              className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
              data-testid="button-make-multiple-calls"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              {isLoading 
                ? 'Đang gọi...' 
                : `Gọi ${totalCalls} cuộc gọi (${totalCost.toLocaleString()} VNĐ)`
              }
            </Button>
          )}
        </div>

        {/* Enhanced Info */}
        <div className="text-xs text-slate-400 bg-slate-800/30 p-3 rounded">
          <p className="mb-1">
            📞 <strong>Gọi đơn:</strong> 1 số điện thoại × nhiều lần gọi (1-10 lần)
          </p>
          <p className="mb-1">
            👥 <strong>Gọi nhiều:</strong> Tối đa 3 số × tùy chỉnh số lần gọi mỗi số (1-10 lần)
          </p>
          <p className="text-emerald-400">
            ✅ <strong>DID Smart Rotation:</strong> Mỗi cuộc gọi sử dụng DID khác nhau để tránh spam
          </p>
        </div>
      </CardContent>
    </Card>
  );
}