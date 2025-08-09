import React from 'react';
import { motion } from 'framer-motion';
import Navigation from './navigation';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
  user: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, user }) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      
      // Clear any stored tokens
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
      });
      
      // Reload to reset application state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload even if logout request fails
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pro-bg">
      {/* Navigation Header */}
      <Navigation user={user} onLogout={handleLogout} />
      
      {/* Main Content Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Animated Content Wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>

      {/* Background Enhancement */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-cyan-900/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/3 rounded-full blur-3xl animate-pulse-glow" />
      </div>
    </div>
  );
};

export default MainLayout;