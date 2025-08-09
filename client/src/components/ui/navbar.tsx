import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Users, 
  Wallet, 
  Phone, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Show navbar even when not logged in on production
  if (!user) {
    const isProductionDomain = window.location.hostname.includes('.replit.app');
    if (!isProductionDomain) return null;
    
    // Show minimal navbar for login on production
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">NEXUS Auto Calling</span>
              </div>
            </Link>
            <div className="text-cyan-400 text-sm">
              Cần đăng nhập để sử dụng
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const isAdmin = user.role === 'admin';

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      adminOnly: false 
    },
    { 
      href: '/admin', 
      label: 'Admin Panel', 
      icon: Shield,
      adminOnly: true 
    },
    { 
      href: isAdmin ? '/admin/payment' : '/payment', 
      label: 'Nạp Tiền', 
      icon: Wallet,
      adminOnly: false 
    },
    { 
      href: '/account', 
      label: 'Tài Khoản', 
      icon: Settings,
      adminOnly: false 
    },
    { 
      href: '/contact', 
      label: 'Liên Hệ', 
      icon: Phone,
      adminOnly: false 
    },
  ];

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const isActive = (href: string) => {
    if (href === '/dashboard' && location === '/') return true;
    return location === href;
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">TwilioPro</span>
              </div>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-purple-600/20 text-purple-300 shadow-lg shadow-purple-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                      {isActive(item.href) && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg border border-purple-500/30"
                          transition={{ type: "spring", duration: 0.3 }}
                        />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu với Simple Logout */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">{user.fullName}</span>
                  {isAdmin && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-2 py-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <div className="text-slate-400 text-xs">
                  {parseInt(user.balance).toLocaleString()} VNĐ
                </div>
              </div>

              {/* CRITICAL FIX: Simple Direct Logout Button */}
              <Button
                type="button"
                onClick={() => {
                  console.log('🚪 DIRECT LOGOUT TRIGGERED');
                  // Force immediate logout with window location
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/';
                }}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-3 h-3 text-white" />
                </div>
                <span className="text-lg font-bold text-white">TwilioPro</span>
              </div>
            </Link>

            {/* User Balance & Menu Button */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-white text-sm font-medium">
                  {parseInt(user.balance).toLocaleString()} VNĐ
                </div>
                {isAdmin && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1">
                    Admin
                  </Badge>
                )}
              </div>
              
              <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="ghost"
                size="sm"
                className="text-slate-300"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800"
          >
            <div className="px-4 py-4 space-y-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? 'bg-purple-600/20 text-purple-300'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="text-slate-300 text-sm mb-3">
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-slate-400 text-xs">@{user.username}</div>
                </div>
                
                <Button
                  type="button"
                  onClick={() => {
                    console.log('🚪 MOBILE DIRECT LOGOUT TRIGGERED');
                    // Force immediate logout with window location
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setIsOpen(false);
                    window.location.href = '/';
                  }}
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default Navbar;