import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Phone, CreditCard, User, Settings, Menu, X, LogOut, Zap, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useState } from 'react';

interface NavigationProps {
  user: any;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', icon: Activity, label: 'Dashboard', color: 'text-glow-purple' },
    { path: '/calls', icon: Phone, label: 'Cuộc Gọi', color: 'text-glow-cyan' },
    { path: '/payment', icon: CreditCard, label: 'Nạp Tiền', color: 'text-glow-emerald' },
    { path: '/account', icon: User, label: 'Tài Khoản', color: 'text-glow-orange' },
  ];

  if (user.role === 'admin') {
    navigationItems.push(
      { path: '/admin', icon: Settings, label: 'Quản Trị', color: 'text-red-400' }
    );
  }

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <>
      {/* Premium Navigation Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border-b border-purple-500/20 shadow-2xl shadow-purple-500/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Premium Logo & Brand */}
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => setLocation('/')}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse-glow">
                  <Phone className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg blur opacity-30 animate-pulse"></div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                BombCall
              </h1>
            </motion.div>

            {/* Compact Premium Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    onClick={() => setLocation(item.path)}
                    variant="ghost"
                    size="sm"
                    className={`btn-premium group relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/50 shadow-lg shadow-purple-500/20 text-white' 
                        : 'hover:bg-gradient-to-r hover:from-slate-800/60 hover:to-slate-700/60 hover:border-slate-600/30 border border-transparent'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 transition-colors ${
                      isActive(item.path) ? 'text-purple-300' : 'text-slate-400 group-hover:text-white'
                    }`} />
                    <span className={`text-sm font-medium transition-colors ${
                      isActive(item.path) ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {item.label}
                    </span>
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 rounded-lg border border-purple-500/30"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
            </nav>

            {/* Compact User Profile & Actions */}
            <div className="flex items-center space-x-3">
              {/* Compact Balance Display */}
              <motion.div 
                className="hidden sm:block"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Badge className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-glow-emerald border border-emerald-500/40 px-2 py-1 text-xs font-semibold shadow-lg shadow-emerald-500/20">
                  <Wallet className="w-3 h-3 mr-1" />
                  {Number(user.balance).toLocaleString()} VNĐ
                </Badge>
              </motion.div>

              {/* Compact User Avatar */}
              <motion.div 
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 text-white text-xs font-bold">
                      {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur opacity-30 animate-pulse"></div>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {user.fullName}
                  </p>
                </div>
              </motion.div>

              {/* Compact Mobile Menu Button */}
              <Button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="md:hidden btn-premium p-2 rounded-lg bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/30 hover:from-purple-600/20 hover:to-cyan-600/20"
              >
                {mobileMenuOpen ? 
                  <X className="w-4 h-4 text-white" /> : 
                  <Menu className="w-4 h-4 text-white" />
                }
              </Button>

              {/* Compact Logout Button */}
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="btn-premium p-2 rounded-lg bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 hover:from-red-600/30 hover:to-pink-600/30 text-red-400 hover:text-red-300 shadow-lg shadow-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-purple-500/20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-lg"
          >
            <div className="px-4 py-6 space-y-3">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => {
                      setLocation(item.path);
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className={`w-full justify-start btn-premium flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/50 text-white' 
                        : 'hover:bg-gradient-to-r hover:from-slate-800/60 hover:to-slate-700/60 hover:border-slate-600/30 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                      isActive(item.path) 
                        ? 'from-purple-500 to-cyan-500' 
                        : 'from-slate-700 to-slate-600'
                    } flex items-center justify-center`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">{item.label}</span>
                  </Button>
                </motion.div>
              ))}
              
              {/* Mobile Balance */}
              <div className="pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-xl border border-emerald-500/20">
                  <span className="text-sm font-semibold text-slate-300">Số dư hiện tại:</span>
                  <Badge className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-glow-emerald border border-emerald-500/40">
                    <Wallet className="w-3 h-3 mr-1" />
                    {Number(user.balance).toLocaleString()} VNĐ
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>
    </>
  );
};

export default Navigation;