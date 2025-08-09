import { motion } from 'framer-motion';
import { Users, Wallet, Phone, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalBalance: string;
  totalCalls: number;
  monthlyRevenue: string;
  currency: string;
}

export default function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => apiGet('/api/admin/stats') as Promise<AdminStats>,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const statsCards = [
    {
      title: 'Tổng Số User',
      value: stats?.totalUsers?.toLocaleString() || '0',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      change: '+12% so với tháng trước'
    },
    {
      title: 'Tổng Số Dư Hệ Thống',
      value: `${stats?.totalBalance || '0'} ${stats?.currency || 'VNĐ'}`,
      icon: Wallet,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      change: '+8% so với tháng trước'
    },
    {
      title: 'Tổng Cuộc Gọi',
      value: stats?.totalCalls?.toLocaleString() || '0',
      icon: Phone,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
      change: '+25% so với tháng trước'
    },
    {
      title: 'Doanh Thu Tháng',
      value: `${stats?.monthlyRevenue || '0'} ${stats?.currency || 'VNĐ'}`,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
      change: '+15% so với tháng trước'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="pro-card-enhanced hover:scale-105 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {card.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  {isLoading ? (
                    <div className="h-8 bg-slate-700 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-slate-800/50 text-green-400 border-green-500/30"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {card.change}
                </Badge>
                
                {/* Gradient glow effect */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-lg`}
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}