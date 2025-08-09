import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Check, X, Wallet, Settings, TrendingUp, Zap, Users, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
// Remove Navbar import since it's now in App.tsx
import StatsCards from '@/components/dashboard/stats-cards';
import EnhancedCallControls from '@/components/dashboard/enhanced-call-controls';
import CallHistory from '@/components/dashboard/call-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/');
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Responsive Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative px-4"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-cyan-600/5 rounded-3xl blur-3xl"></div>
        <div className="relative">
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-2xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            Chào mừng trở lại, {user.fullName}!
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-base md:text-lg text-slate-300 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Hệ thống gọi điện tự động chuyên nghiệp <span className="text-glow-cyan">BombCall</span>
          </motion.p>
          <motion.div
            className="mt-4 flex items-center justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-400 font-medium">Hệ thống đang hoạt động</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Premium Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <StatsCards />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Responsive Main Content */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/5 to-cyan-600/5 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <EnhancedCallControls />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <CallHistory />
                </div>
              </motion.div>
            </div>

            {/* Responsive Premium Sidebar */}
            <motion.div 
              className="space-y-4 sm:space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {/* Premium System Status */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl blur-sm"></div>
                <Card className="premium-card card-emerald relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-glow-emerald flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3 animate-pulse-glow">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      Hệ Thống
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="spacing-compact">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-slate-400 text-sm">Trạng thái:</span>
                      <span className="flex items-center text-glow-emerald font-medium text-sm">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mr-2 animate-pulse shadow-lg shadow-emerald-400/50"></div>
                        Hoạt động
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400 text-sm">DID khả dụng:</span>
                      <span className="text-glow-cyan font-medium text-sm">12/15</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400 text-sm">Tài khoản Twilio:</span>
                      <span className="text-glow-purple font-medium text-sm">3 active</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="premium-card card-cyan">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-glow-cyan flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Thao Tác Nhanh
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="spacing-compact">
                    <Button
                      className="btn-premium w-full mb-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                      onClick={() => setLocation('/payment')}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Nạp Tiền
                    </Button>
                    <Button
                      className="btn-premium w-full mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      onClick={() => setLocation('/account')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Quản Lý Tài Khoản
                    </Button>
                    {user.role === 'admin' && (
                      <Button
                        className="btn-premium w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white"
                        onClick={() => setLocation('/admin')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Quản Trị Hệ Thống
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
    </div>
  );
}
