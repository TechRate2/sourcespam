import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Call {
  id: number;
  to: string;
  from: string;
  status: string;
  duration: number | null;
  cost: string;
  createdAt: string;
  // THỜI GIAN ĐỔ CHUÔNG VÀ TRACKING CHI TIẾT
  startTime?: string;
  ringingTime?: string;
  answerTime?: string;
  ringingDuration?: number; // Thời gian đổ chuông (giây)
  callDuration?: number; // Thời gian nói chuyện (giây)
  totalDuration?: number; // Tổng thời gian (giây)
  answeredBy?: string;
}

export default function CallHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Tối ưu responsive: 5 calls per page

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['/api/calls/history'],
  });

  const callsArray = Array.isArray(calls) ? calls as Call[] : [];

  const filteredCalls = callsArray.filter((call: Call) =>
    call.to?.includes(searchTerm) ||
    call.from?.includes(searchTerm) ||
    call.status?.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCalls = filteredCalls.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'busy':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Thành công', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      failed: { label: 'Thất bại', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      busy: { label: 'Bận', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      'no-answer': { label: 'Không nhấc máy', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      ringing: { label: 'Đang đổ chuông', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      initiated: { label: 'Đang khởi tạo', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.failed;
    return (
      <Badge className={`${config.className} border rounded-full px-3 py-1 text-xs font-medium`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="premium-card card-purple">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <CardTitle className="text-lg font-semibold text-glow-purple flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Lịch Sử Cuộc Gọi
            </CardTitle>
            <div className="w-full md:w-64">
              <Input
                placeholder="Tìm kiếm số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs bg-slate-700/50 border-slate-600 focus:border-purple-400/50"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-slate-300 text-lg mb-2">
                {searchTerm ? 'Không tìm thấy cuộc gọi nào' : 'Chưa có cuộc gọi nào'}
              </p>
              <p className="text-slate-400">
                {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Thực hiện cuộc gọi đầu tiên của bạn'}
              </p>
            </div>
          ) : (
            <div className="premium-table">
              {/* Desktop Table Header */}
              <div className="hidden md:grid premium-table-header grid-cols-12 gap-4 px-6 py-4 font-semibold text-purple-300 text-sm uppercase tracking-wider">
                <div className="col-span-2">Số điện thoại</div>
                <div className="col-span-2">Trạng thái</div>
                <div className="col-span-2">⏰ Đổ chuông</div>
                <div className="col-span-2">📞 Nói chuyện</div>
                <div className="col-span-2">💰 Chi phí</div>
                <div className="col-span-2">🕐 Thời gian</div>
              </div>
              
              {/* Responsive Table Rows */}
              <div className="divide-y divide-purple-500/10">
                {paginatedCalls.map((call: Call, index: number) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="premium-table-row hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-violet-900/20"
                    data-testid={`call-history-row-${call.id}`}
                  >
                    {/* Desktop Table Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4">
                      <div className="col-span-2 premium-table-cell font-mono text-cyan-300">
                        {call.to}
                      </div>
                      <div className="col-span-2 premium-table-cell">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(call.status)}
                          {getStatusBadge(call.status)}
                        </div>
                      </div>
                      <div className="col-span-2 premium-table-cell text-orange-400 font-semibold">
                        {call.ringingDuration ? (
                          <span className="flex items-center">
                            ⏰ {call.ringingDuration}s
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                      <div className="col-span-2 premium-table-cell text-blue-400">
                        {call.callDuration && call.callDuration > 0 ? (
                          <span className="flex items-center">
                            📞 {call.callDuration}s
                          </span>
                        ) : '-'}
                      </div>
                      <div className="col-span-2 premium-table-cell font-semibold">
                        <span className="text-emerald-400">600 VNĐ</span>
                      </div>
                      <div className="col-span-2 premium-table-cell text-slate-400 text-sm">
                        {new Date(call.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-cyan-300 font-semibold text-lg">
                          {call.to}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(call.status)}
                          {getStatusBadge(call.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-400">⏰ Đổ chuông:</span>
                          <div className="text-orange-400 font-semibold">
                            {call.ringingDuration ? `${call.ringingDuration}s` : '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">📞 Nói chuyện:</span>
                          <div className="text-blue-400 font-semibold">
                            {call.callDuration && call.callDuration > 0 ? `${call.callDuration}s` : '-'}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">💰 Chi phí:</span>
                          <div className="text-emerald-400 font-semibold">600 VNĐ</div>
                        </div>
                        <div>
                          <span className="text-slate-400">🕐 Thời gian:</span>
                          <div className="text-slate-300">
                            {new Date(call.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        {call.answeredBy && (
                          <div className="col-span-2">
                            <span className="text-slate-400">👤 Trả lời bởi:</span>
                            <div className="text-cyan-400 font-semibold capitalize">
                              {call.answeredBy === 'human' ? 'Con người' : 
                               call.answeredBy === 'machine' ? 'Máy trả lời' : call.answeredBy}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile-Optimized Pagination Controls */}
          {filteredCalls.length > itemsPerPage && (
            <div className="px-4 py-4 border-t border-purple-500/10 space-y-3 md:space-y-0">
              {/* Stats - Responsive Text */}
              <div className="text-xs md:text-sm text-slate-400 text-center md:text-left">
                Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCalls.length)} của {filteredCalls.length} cuộc gọi
              </div>
              
              {/* Pagination Buttons - Mobile Optimized */}
              <div className="flex justify-center md:justify-end items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-purple-500/30 hover:border-purple-400/50 text-purple-300 px-2 md:px-3"
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Trước</span>
                </Button>
                
                {/* Compact Page Numbers for Mobile */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    const startPage = Math.max(1, currentPage - 1);
                    const page = startPage + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={page === currentPage 
                          ? "bg-purple-600 hover:bg-purple-700 text-white min-w-[2rem] md:min-w-[2.5rem]" 
                          : "border-purple-500/30 hover:border-purple-400/50 text-purple-300 min-w-[2rem] md:min-w-[2.5rem]"
                        }
                        data-testid={`button-page-${page}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-purple-500/30 hover:border-purple-400/50 text-purple-300 px-2 md:px-3"
                  data-testid="button-next-page"
                >
                  <span className="hidden sm:inline mr-1">Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}