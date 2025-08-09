import { motion } from 'framer-motion';
import { Phone, Check, X, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { apiGet } from '@/lib/api';

interface CallStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalRevenue: string;
}

export default function StatsCards() {
  const { data: callHistory = [] } = useQuery({
    queryKey: ['/api/calls/history'],
    queryFn: () => apiGet('/api/calls/history'),
  });

  // Fetch real-time dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    queryFn: () => apiGet('/api/dashboard/stats'),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Calculate stats from call history
  const stats = {
    totalCalls: callHistory.length,
    successfulCalls: callHistory.filter((call: any) => call.status === 'completed').length,
    failedCalls: callHistory.filter((call: any) => call.status === 'failed').length,
    totalCost: callHistory.reduce((total: number, call: any) => total + (Number(call.cost) || 0), 0),
  };

  const statsData = [
    {
      title: 'Cuộc Gọi Hôm Nay',
      value: statsLoading ? '...' : (dashboardStats?.todayCalls || 0).toLocaleString(),
      change: statsLoading ? '' : dashboardStats?.callsChange || '0',
      icon: Phone,
      color: 'text-cyan-400',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Chi Phí Tháng (VND)',
      value: statsLoading ? '...' : (dashboardStats?.monthlyCost || 0).toLocaleString('vi-VN'),
      change: statsLoading ? '' : dashboardStats?.costChange || '0',
      icon: Wallet,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      title: 'Thời Gian TB',
      value: statsLoading ? '...' : `${dashboardStats?.avgDuration || 0}s`,
      change: statsLoading ? '' : dashboardStats?.durationChange || '0',
      icon: Check,
      color: 'text-purple-400',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Tỷ Lệ Thành Công',
      value: statsLoading ? '...' : `${dashboardStats?.successRate || 0}%`,
      change: statsLoading ? '' : dashboardStats?.successChange || '0',
      icon: X,
      color: 'text-orange-400',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`premium-card ${
            stat.color.includes('cyan') ? 'card-cyan' : 
            stat.color.includes('emerald') ? 'card-emerald' :
            stat.color.includes('purple') ? 'card-purple' : 'card-blue'
          }`}>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs font-medium truncate">
                    {stat.title}
                  </p>
                  <p className={`text-lg font-bold ${stat.color.replace('text-', 'text-glow-').replace('-400', '')} truncate`}>
                    {stat.value}
                  </p>
                  {stat.change && stat.change !== '0' && (
                    <p className="text-glow-emerald text-xs font-medium">
                      +{stat.change}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
