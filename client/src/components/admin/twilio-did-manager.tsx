import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Loader2, RefreshCw, Phone, CheckCircle, XCircle, Clock } from "lucide-react";

interface TwilioAccount {
  id: number;
  sid: string;
  friendlyName: string;
  isActive: boolean;
  didCount: number;
  lastSyncedAt: string | null;
}

interface DID {
  id: number;
  phoneNumber: string;
  twilioAccountId: number;
  isActive: boolean;
  lastUsed: string | null;
  usageCount: number;
  currentTargetNumber: string | null;
  blockedUntil: string | null;
}

export default function TwilioDidManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncingAccountId, setSyncingAccountId] = useState<number | null>(null);

  // Fetch Twilio accounts
  const { data: twilioAccounts = [], isLoading: accountsLoading } = useQuery<TwilioAccount[]>({
    queryKey: ['/api/admin/twilio-accounts'],
  });

  // Fetch DIDs
  const { data: dids = [], isLoading: didsLoading } = useQuery<DID[]>({
    queryKey: ['/api/admin/dids'],
  });

  // Sync DIDs mutation
  const syncDidsMutation = useMutation({
    mutationFn: async (accountId: number) => {
      return await apiRequest("POST", `/api/admin/twilio-accounts/${accountId}/sync-dids`);
    },
    onMutate: (accountId) => {
      setSyncingAccountId(accountId);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sync thành công",
        description: `Đã sync ${data.newDids || 0} số mới, cập nhật ${data.updatedDids || 0} số hiện có`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/twilio-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dids'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi sync DIDs",
        description: error.message || "Không thể sync số từ Twilio",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSyncingAccountId(null);
    },
  });

  // Sync all accounts
  const syncAllMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/sync-all-dids");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sync tất cả thành công",
        description: `Tổng cộng: ${data.totalNewDids || 0} số mới, ${data.totalUpdatedDids || 0} số cập nhật`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/twilio-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dids'] });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi sync tất cả",
        description: error.message || "Không thể sync từ tất cả tài khoản Twilio",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa bao giờ";
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getDidStatus = (did: DID) => {
    if (!did.isActive) return { label: "Tắt", color: "bg-gray-500" };
    if (did.blockedUntil && new Date(did.blockedUntil) > new Date()) {
      return { label: "Đang bận", color: "bg-red-500" };
    }
    if (did.currentTargetNumber) {
      return { label: "Đang gọi", color: "bg-yellow-500" };
    }
    return { label: "Sẵn sàng", color: "bg-green-500" };
  };

  return (
    <div className="space-y-6">
      {/* Header với nút sync tất cả */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản Lý DIDs Twilio</h2>
          <p className="text-gray-400 mt-1">Sync và quản lý số điện thoại từ tài khoản Twilio</p>
        </div>
        <Button
          onClick={() => syncAllMutation.mutate()}
          disabled={syncAllMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {syncAllMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync Tất Cả
        </Button>
      </div>

      {/* Twilio Accounts */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Tài Khoản Twilio ({twilioAccounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : twilioAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Chưa có tài khoản Twilio nào. Thêm tài khoản trong phần quản lý Twilio.
            </div>
          ) : (
            <div className="space-y-4">
              {twilioAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-white">{account.friendlyName}</h3>
                      <Badge className={account.isActive ? "bg-green-600" : "bg-gray-600"}>
                        {account.isActive ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">SID: {account.sid}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                      <span>DIDs: {account.didCount}</span>
                      <span>Sync cuối: {formatDate(account.lastSyncedAt)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => syncDidsMutation.mutate(account.id)}
                    disabled={syncingAccountId === account.id || !account.isActive}
                    variant="outline"
                    size="sm"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    {syncingAccountId === account.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Sync DIDs
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIDs List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Danh Sách DIDs ({dids.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {didsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : dids.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Chưa có DID nào. Sync từ tài khoản Twilio để hiển thị các số.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dids.map((did) => {
                const status = getDidStatus(did);
                return (
                  <div
                    key={did.id}
                    className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{did.phoneNumber}</h4>
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>Sử dụng:</span>
                        <span>{did.usageCount} lần</span>
                      </div>
                      
                      {did.lastUsed && (
                        <div className="flex items-center justify-between">
                          <span>Lần cuối:</span>
                          <span>{formatDate(did.lastUsed)}</span>
                        </div>
                      )}
                      
                      {did.currentTargetNumber && (
                        <div className="flex items-center justify-between">
                          <span>Đang gọi:</span>
                          <span className="text-yellow-400">{did.currentTargetNumber}</span>
                        </div>
                      )}
                      
                      {did.blockedUntil && new Date(did.blockedUntil) > new Date() && (
                        <div className="flex items-center justify-between">
                          <span>Block đến:</span>
                          <span className="text-red-400">{formatDate(did.blockedUntil)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}