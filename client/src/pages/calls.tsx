import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneCall, Users, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import EnhancedCallControls from '@/components/dashboard/enhanced-call-controls';
import CallHistory from '@/components/dashboard/call-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CallsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-glow-cyan mb-2">
          Hệ Thống Cuộc Gọi
        </h1>
        <p className="text-slate-400">
          Quản lý và thực hiện cuộc gọi tự động chuyên nghiệp
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="premium-card card-purple">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Cuộc gọi còn lại</p>
                  <p className="text-glow-purple text-lg font-bold">
                    {user.callsRemaining?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="premium-card card-emerald">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Số dư hiện tại</p>
                  <p className="text-glow-emerald text-lg font-bold">
                    {Number(user.balance).toLocaleString()} VNĐ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="premium-card card-cyan">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Chi phí/cuộc gọi</p>
                  <p className="text-glow-cyan text-lg font-bold">600 VNĐ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="space-y-6">
          <EnhancedCallControls />
          <CallHistory />
        </div>
      </div>
    </div>
  );
}