import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gift, Plus, User, Clock, Coins, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  balance: string;
  isActive: boolean;
}

interface MonthlyPackage {
  id: number;
  userId: number;
  packageCount: number;
  dailyCredit: string;
  startDate: string;
  endDate: string;
  lastCreditDate: string | null;
  totalDaysRemaining: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminMonthlyPackages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [packageCount, setPackageCount] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch monthly packages
  const { data: packages = [], isLoading: packagesLoading } = useQuery<MonthlyPackage[]>({
    queryKey: ['/api/admin/monthly-packages'],
  });

  // Create package mutation
  const createPackageMutation = useMutation({
    mutationFn: async (data: { userId: number; packageCount: number }) => {
      const response = await apiRequest('POST', '/api/admin/monthly-packages', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/monthly-packages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Thành công",
        description: "Đã tạo gói tháng thành công",
      });
      setIsDialogOpen(false);
      setSelectedUserId(null);
      setPackageCount(1);
      setUserSearchTerm('');
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo gói tháng",
        variant: "destructive",
      });
    },
  });

  // Add more packages mutation
  const addPackageMutation = useMutation({
    mutationFn: async (data: { userId: number; packageCount: number }) => {
      const response = await apiRequest('PATCH', `/api/admin/monthly-packages/${data.userId}/add`, { packageCount: data.packageCount });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/monthly-packages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Thành công",
        description: "Đã cộng thêm gói tháng thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cộng thêm gói tháng",
        variant: "destructive",
      });
    },
  });

  const handleCreatePackage = () => {
    if (!selectedUserId || packageCount < 1) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn user và số lượng gói hợp lệ",
        variant: "destructive",
      });
      return;
    }

    createPackageMutation.mutate({ userId: selectedUserId, packageCount });
  };

  const handleAddPackage = (userId: number, additionalPackages: number) => {
    addPackageMutation.mutate({ userId, packageCount: additionalPackages });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: string) => {
    return parseInt(amount).toLocaleString('vi-VN') + ' VNĐ';
  };

  // Group packages by user
  const packagesByUser = packages.reduce((acc: Record<number, MonthlyPackage[]>, pkg: MonthlyPackage) => {
    if (!acc[pkg.userId]) acc[pkg.userId] = [];
    acc[pkg.userId].push(pkg);
    return acc;
  }, {});

  const getUserById = (userId: number) => users.find((u) => u.id === userId);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => {
    // Sort by relevance - exact matches first, then partial matches
    const searchLower = userSearchTerm.toLowerCase();
    const aScore = (
      (a.fullName.toLowerCase().startsWith(searchLower) ? 3 : 0) +
      (a.email.toLowerCase().startsWith(searchLower) ? 2 : 0) +
      (a.username.toLowerCase().startsWith(searchLower) ? 1 : 0)
    );
    const bScore = (
      (b.fullName.toLowerCase().startsWith(searchLower) ? 3 : 0) +
      (b.email.toLowerCase().startsWith(searchLower) ? 2 : 0) +
      (b.username.toLowerCase().startsWith(searchLower) ? 1 : 0)
    );
    return bScore - aScore || a.fullName.localeCompare(b.fullName);
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản Lý Gói Tháng
          </h1>
          <p className="text-muted-foreground mt-2">
            Tạo và quản lý gói tháng cho người dùng (1.000.000 VNĐ/ngày)
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              data-testid="button-create-package"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo Gói Tháng
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-create-package">
            <DialogHeader>
              <DialogTitle>Tạo Gói Tháng Mới</DialogTitle>
              <DialogDescription>
                Tạo gói tháng cho người dùng. Mỗi gói cung cấp 1.000.000 VNĐ mỗi ngày trong 30 ngày.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-search">Tìm Kiếm Người Dùng</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="user-search"
                    type="text"
                    placeholder="Nhập tên, email hoặc username..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    data-testid="input-user-search"
                    className="pl-10 mb-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="user-select">Chọn Người Dùng</Label>
                <select
                  id="user-select"
                  className="w-full p-2 border rounded-md bg-background"
                  size={Math.min(filteredUsers.length + 1, 6)}
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  data-testid="select-user"
                >
                  <option value="">
                    {userSearchTerm 
                      ? `-- ${filteredUsers.length} người dùng được tìm thấy --` 
                      : `-- Chọn từ ${users.length} người dùng --`
                    }
                  </option>
                  {filteredUsers.map((user) => {
                    const hasPackage = packagesByUser[user.id];
                    const activePackage = hasPackage?.find((p) => p.isActive);
                    return (
                      <option key={user.id} value={user.id}>
                        {activePackage ? '📦' : '👤'} {user.fullName} | {user.email} | {formatCurrency(user.balance)}
                        {activePackage ? ' (Có gói tháng)' : ''}
                      </option>
                    );
                  })}
                </select>
                {filteredUsers.length === 0 && userSearchTerm && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Không tìm thấy người dùng nào với từ khóa "{userSearchTerm}"
                    </p>
                  </div>
                )}
                {filteredUsers.length > 0 && userSearchTerm && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      ✅ Tìm thấy {filteredUsers.length} người dùng phù hợp
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="package-count">Số Lượng Gói</Label>
                <div className="flex space-x-2">
                  <Input
                    id="package-count"
                    type="number"
                    min="1"
                    max="12"
                    value={packageCount}
                    onChange={(e) => setPackageCount(Number(e.target.value))}
                    data-testid="input-package-count"
                    className="flex-1"
                  />
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPackageCount(1)}
                      className={packageCount === 1 ? 'bg-purple-100 dark:bg-purple-900' : ''}
                    >
                      1
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPackageCount(3)}
                      className={packageCount === 3 ? 'bg-purple-100 dark:bg-purple-900' : ''}
                    >
                      3
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPackageCount(6)}
                      className={packageCount === 6 ? 'bg-purple-100 dark:bg-purple-900' : ''}
                    >
                      6
                    </Button>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💰 {packageCount} gói = {30 * packageCount} ngày = {formatCurrency((1000000 * packageCount).toString())} tổng credit
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreatePackage}
                disabled={createPackageMutation.isPending}
                className="w-full"
                data-testid="button-confirm-create"
              >
                {createPackageMutation.isPending ? 'Đang tạo...' : 'Tạo Gói Tháng'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng Gói</p>
                <p className="text-xl font-bold">{packages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Users Có Gói</p>
                <p className="text-xl font-bold">{Object.keys(packagesByUser).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Gói Đang Hoạt Động</p>
                <p className="text-xl font-bold">{packages.filter((p) => p.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Credit/Ngày</p>
                <p className="text-xl font-bold">
                  {formatCurrency((packages.filter((p) => p.isActive).length * 1000000).toString())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages by User */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Gói Tháng Theo Người Dùng</h2>
        {packagesLoading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : Object.keys(packagesByUser).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có gói tháng nào được tạo</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(packagesByUser).map(([userId, userPackages]) => {
            const user = getUserById(Number(userId));
            const activePackage = userPackages.find((p) => p.isActive);
            
            return (
              <Card key={userId} className={cn(
                "border-2",
                activePackage ? "border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-800"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>{user?.fullName || 'User không tồn tại'}</span>
                        {activePackage && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Đang hoạt động
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {user?.email} • Số dư: {user ? formatCurrency(user.balance) : 'N/A'}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddPackage(Number(userId), 1)}
                        disabled={addPackageMutation.isPending}
                        data-testid={`button-add-package-${userId}`}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        +1 Gói
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddPackage(Number(userId), 3)}
                        disabled={addPackageMutation.isPending}
                        data-testid={`button-add-packages-${userId}`}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        +3 Gói
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(userPackages as MonthlyPackage[]).map((pkg) => (
                      <div 
                        key={pkg.id} 
                        className={cn(
                          "p-3 rounded-md border",
                          pkg.isActive 
                            ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                            : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
                        )}
                        data-testid={`package-${pkg.id}`}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Số gói</p>
                            <p className="font-medium">{pkg.packageCount} gói</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Ngày còn lại</p>
                            <p className="font-medium">{pkg.totalDaysRemaining} ngày</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Hết hạn</p>
                            <p className="font-medium">{formatDate(pkg.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Credit cuối</p>
                            <p className="font-medium">
                              {pkg.lastCreditDate ? formatDate(pkg.lastCreditDate) : 'Chưa có'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}