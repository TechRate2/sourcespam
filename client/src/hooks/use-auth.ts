import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { autoAuthCleanup } from '@/lib/auto-auth-cleanup';

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  balance: string;
  callsRemaining: number;
  plan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    // Try to get token from localStorage
    const storedToken = localStorage.getItem('accessToken');
    
    // If no token and we're on production domain, check for deployment
    if (!storedToken && window.location.hostname.includes('.replit.app')) {
      console.log('Production deployment detected - no stored token found');
    }
    
    return storedToken;
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize auto-cleanup system
  useEffect(() => {
    // Khởi tạo auto cleanup system
    autoAuthCleanup.initializeAutoCleanup();
    autoAuthCleanup.detectSystemUpdates();
    
    // Force clear invalid tokens on load
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken && storedToken !== token) {
      autoAuthCleanup.clearAllAuthData();
      setToken(null);
      queryClient.clear();
    }
  }, []);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!token,
    retry: false,
    refetchInterval: 10000, // Refresh user data every 10 seconds for real-time balance updates
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token expired or invalid - use auto cleanup
          autoAuthCleanup.clearAllAuthData();
          setToken(null);
          queryClient.clear();
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      return await response.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { login: string; password: string }) => {
      const data = await apiRequest('POST', '/api/auth/login', credentials);
      return data as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setToken(data.accessToken);
      queryClient.setQueryData(['/api/auth/me'], data.user);
      // Refresh admin users list for real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${data.user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi đăng nhập",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      username: string;
      password: string;
      fullName: string;
    }) => {
      const data = await apiRequest('POST', '/api/auth/register', userData);
      return data as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setToken(data.accessToken);
      queryClient.setQueryData(['/api/auth/me'], data.user);
      // Refresh admin users list for real-time updates
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Đăng ký thành công",
        description: `Chào mừng ${data.user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi đăng ký",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    console.log('🚪 LOGOUT FUNCTION CALLED - Starting logout process...');
    
    // Clear auth data và redirect về landing page
    const performLogout = async () => {
      console.log('🚪 Logout started, token exists:', !!token);
      console.log('🚪 Token value preview:', token ? token.substring(0, 20) + '...' : 'null');
      
      try {
        // Always call logout API regardless of token
        console.log('📡 Calling logout API (no auth required)...');
        const response = await apiRequest('POST', '/api/auth/logout');
        console.log('✅ Logout API success, response:', response.status);
      } catch (error) {
        // Ignore API errors, proceed with local cleanup
        console.log('❌ Logout API failed, but continuing:', error);
      }
      
      // Always clear local state
      console.log('🧹 Clearing localStorage...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      console.log('🧹 Clearing sessionStorage...');
      sessionStorage.clear();
      
      console.log('🧹 Clearing auth cleanup...');
      autoAuthCleanup.clearAllAuthData();
      
      console.log('🧹 Setting token to null...');
      setToken(null);
      
      console.log('🧹 Clearing query cache...');
      queryClient.clear();
      
      // Show success message
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
      
      console.log('🔄 Preparing redirect...');
      
      // Clear browser cache
      if ('caches' in window) {
        console.log('🧹 Clearing service worker caches...');
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Force refresh to landing page immediately
      const redirectUrl = '/?logout=true&_t=' + Date.now();
      console.log('🔄 Redirecting to:', redirectUrl);
      window.location.replace(redirectUrl);
    };
    
    performLogout();
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('accessToken');
      setToken(newToken);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isAuthenticated: !!user,
  };
}
