import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiGet } from '@/lib/api';
import type { DID } from '@shared/schema';

export default function DIDManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: dids = [], isLoading } = useQuery({
    queryKey: ['/api/admin/dids'],
    queryFn: () => apiGet('/api/admin/dids'),
  });

  const filteredDids = dids.filter((did: DID) => {
    const matchesSearch = did.phoneNumber.includes(searchTerm) || 
                         (did.friendlyName && did.friendlyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const isInUse = did.blockedUntil && new Date(did.blockedUntil) > new Date();
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && did.isActive) ||
                         (statusFilter === 'inactive' && !did.isActive) ||
                         (statusFilter === 'in-use' && isInUse);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (did: DID) => {
    if (!did.isActive) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Tạm dừng</Badge>;
    }
    const isInUse = did.blockedUntil && new Date(did.blockedUntil) > new Date();
    if (isInUse) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Đang sử dụng</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Sẵn sàng</Badge>;
  };

  const getTotalStats = () => {
    const total = dids.length;
    const active = dids.filter((d: DID) => d.isActive).length;
    const inUse = dids.filter((d: DID) => d.blockedUntil && new Date(d.blockedUntil) > new Date()).length;
    const available = dids.filter((d: DID) => d.isActive && (!d.blockedUntil || new Date(d.blockedUntil) <= new Date())).length;
    
    return { total, active, inUse, available };
  };

  const stats = getTotalStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Tổng DID</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Phone className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Hoạt động</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Đang sử dụng</p>
                <p className="text-2xl font-bold text-blue-400">{stats.inUse}</p>
              </div>
              <div className="h-8 w-8 bg-blue-400 rounded-full animate-pulse" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Sẵn sàng</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.available}</p>
              </div>
              <div className="h-8 w-8 bg-cyan-400 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DID Management Table */}
      <Card className="premium-card">
        <CardHeader className="premium-table-header">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-purple-400 glow-text flex items-center">
              <Phone className="mr-3 h-6 w-6" />
              Quản Lý DID
            </CardTitle>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="premium-input pl-10 w-full md:w-80"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="premium-input w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lọc trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-purple-500/30">
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm dừng</SelectItem>
                  <SelectItem value="in-use">Đang sử dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : filteredDids.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-300 text-lg mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy DID nào' : 'Chưa có DID nào'}
              </p>
              <p className="text-slate-400">
                {searchTerm || statusFilter !== 'all' ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Thêm tài khoản Twilio để đồng bộ DID'}
              </p>
            </div>
          ) : (
            <div className="premium-table">
              {/* Table Header */}
              <div className="premium-table-header grid grid-cols-12 gap-4 px-6 py-4 font-semibold text-purple-300 text-sm uppercase tracking-wider">
                <div className="col-span-3">Số điện thoại</div>
                <div className="col-span-3">Tên gọi</div>
                <div className="col-span-2">Trạng thái</div>
                <div className="col-span-2">Tài khoản</div>
                <div className="col-span-2">Lần cuối sử dụng</div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y divide-purple-500/10">
                {filteredDids.map((did: DID, index: number) => (
                  <motion.div
                    key={did.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="premium-table-row grid grid-cols-12 gap-4 px-6 py-4"
                  >
                    <div className="col-span-3 premium-table-cell">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${did.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="font-mono text-cyan-300 font-semibold">
                          {did.phoneNumber}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-span-3 premium-table-cell text-slate-300">
                      {did.friendlyName || '-'}
                    </div>
                    
                    <div className="col-span-2 premium-table-cell">
                      {getStatusBadge(did)}
                    </div>
                    
                    <div className="col-span-2 premium-table-cell text-slate-400 text-sm">
                      Account #{did.twilioAccountId}
                    </div>
                    
                    <div className="col-span-2 premium-table-cell text-slate-400 text-sm">
                      {did.lastUsed ? (
                        new Date(did.lastUsed).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        'Chưa sử dụng'
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}