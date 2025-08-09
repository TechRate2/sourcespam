import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe,
  Headphones,
  Check,
  Star,
  Award,
  Clock,
  ChevronRight,
  Play,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Activity,
  Layers,
  Database,
  Lock,
  Satellite,
  Code2,
  Timer,
  Rocket,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/ui/navbar';
import LoginModal from '@/components/auth/login-modal';
import RegisterModal from '@/components/auth/register-modal';

// Call Simulation Demo Component - Premium Professional
const CallSimulationDemo = () => {
  const [activeCall, setActiveCall] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const callData = [
    { 
      from: '+12706771201', 
      to: '+84903123456', 
      status: 'Gọi lần 15 - Không nghe máy', 
      duration: '00:30',
      color: 'from-red-500 to-red-600',
      intensity: 'HIGH'
    },
    { 
      from: '+16163008970', 
      to: '+84905987654', 
      status: 'Gọi liên tục - Nhắc nợ', 
      duration: '01:45',
      color: 'from-orange-500 to-red-500',
      intensity: 'EXTREME'
    },
    { 
      from: '+12622952475', 
      to: '+84911234567', 
      status: 'Auto retry - Không thể thoát', 
      duration: '00:12',
      color: 'from-yellow-500 to-orange-500',
      intensity: 'MEDIUM'
    }
  ];

  React.useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setActiveCall((prev) => (prev + 1) % callData.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, callData.length]);

  return (
    <div className="relative w-full max-w-sm md:max-w-md mx-auto">
      {/* Phone Device Frame - Responsive */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-slate-700/50 animate-phone-pulse border-glow">
        <div className="bg-gradient-to-br from-slate-900 to-black rounded-xl md:rounded-2xl p-4 md:p-6 min-h-[400px] md:min-h-[500px]">
          
          {/* Header - Responsive */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center border-glow-cyan">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base md:text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">BombCall</h3>
                <p className="text-cyan-400 text-xs text-glow-cyan">Gọi Điện Tự Động</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium text-glow">ONLINE</span>
            </div>
          </div>

          {/* Intense Call Stats - Psychological Pressure */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-gradient-to-r from-red-500/30 to-red-600/30 rounded-lg md:rounded-xl p-3 md:p-4 border border-red-500/50 animate-pulse">
              <div className="text-lg md:text-2xl font-bold text-red-300 animate-pulse">47,382</div>
              <div className="text-red-200 text-xs font-bold">Cuộc gọi không dứt</div>
            </div>
            <div className="bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-lg md:rounded-xl p-3 md:p-4 border border-orange-500/50 animate-pulse">
              <div className="text-lg md:text-2xl font-bold text-orange-300 animate-pulse">∞</div>
              <div className="text-orange-200 text-xs font-bold">Gọi lại tự động</div>
            </div>
          </div>

          {/* Active Calls List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h4 className="text-white font-semibold text-sm md:text-base text-glow">Cuộc Gọi Đang Hoạt Động</h4>
              <div className="flex items-center space-x-1 md:space-x-2">
                <Activity className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                <span className="text-cyan-400 text-xs md:text-sm text-glow-cyan">{callData.length} Active</span>
              </div>
            </div>

            {callData.map((call, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: activeCall === index ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`
                  relative overflow-hidden rounded-lg md:rounded-xl p-3 md:p-4 border transition-all duration-300
                  ${activeCall === index 
                    ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border-red-400/80 shadow-lg shadow-red-400/50 animate-pulse' 
                    : 'bg-slate-800/50 border-slate-700/50'
                  }
                `}
              >
                {/* Intense Animated Background */}
                {activeCall === index && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse" />
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${call.color} ${activeCall === index ? 'animate-ping' : 'animate-pulse'}`} />
                      <span className="text-white text-xs md:text-sm font-bold text-glow">
                        {call.from} → {call.to}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        call.intensity === 'HIGH' ? 'bg-red-500/30 text-red-300' :
                        call.intensity === 'EXTREME' ? 'bg-red-600/40 text-red-200 animate-pulse' :
                        'bg-orange-500/30 text-orange-300'
                      }`}>
                        {call.intensity}
                      </span>
                      <span className="text-xs md:text-sm text-slate-300 font-mono text-glow">
                        {call.duration}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs md:text-sm text-slate-300 text-glow-hover">
                    <span className={`font-bold bg-gradient-to-r ${call.color} bg-clip-text text-transparent ${call.intensity === 'EXTREME' ? 'animate-pulse' : ''}`}>
                      {call.status}
                    </span>
                  </div>
                </div>

                {/* Warning indicator for extreme calls */}
                {call.intensity === 'EXTREME' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Control Buttons - Responsive */}
          <div className="flex items-center justify-center space-x-3 md:space-x-4 mt-6 md:mt-8">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-medium text-sm md:text-base transition-all duration-200 border-glow text-glow ${
                isRunning 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              }`}
            >
              {isRunning ? 'Tạm dừng' : 'Tiếp tục'}
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
          animate={{
            x: [0, Math.random() * 50 - 25, 0],
            y: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`
          }}
        />
      ))}
    </div>
  );
};

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // XORA-style navigation items
  const navItems = [
    { label: 'TÍNH NĂNG', href: '#features' },
    { label: 'BẢNG GIÁ', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'TẢI XUỐNG', href: '#download' }
  ];

  // Powerful stats showing system intensity
  const heroStats = [
    { number: '50K+', label: 'Cuộc gọi/giờ không dứt', gradient: 'from-red-500 to-red-600' },
    { number: '24/7', label: 'Gọi không ngừng nghỉ', gradient: 'from-orange-500 to-red-500' },
    { number: '100%', label: 'Tỷ lệ theo đuổi', gradient: 'from-yellow-500 to-orange-500' },
    { number: '∞', label: 'Gọi lại vô hạn', gradient: 'from-purple-500 to-pink-500' }
  ];

  const features = [
    {
      icon: Phone,
      title: 'Gọi Liên Tục Không Dứt',
      description: 'Hệ thống auto-retry thông minh có thể gọi lại hàng trăm lần cho đến khi bên kia bắt máy. Rotation DID để tránh bị block.',
      gradient: 'from-red-500 to-orange-500',
      iconBg: 'from-red-400/20 to-orange-400/20'
    },
    {
      icon: Target,
      title: 'Theo Đuổi Không Thể Thoát',
      description: 'Chế độ "Nhắc Nợ Agressive" với khả năng gọi từ nhiều số khác nhau, thời gian khác nhau. Không thể bỏ qua hoặc thoát.',
      gradient: 'from-yellow-500 to-red-500', 
      iconBg: 'from-yellow-400/20 to-red-400/20'
    }
  ];

  // 3D Icon components theo phong cách XORA
  const Icon3D = ({ children, gradient, className = "" }: { children: React.ReactNode; gradient: string; className?: string }) => (
    <div className={`relative group ${className}`}>
      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} p-5 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
        <div className="relative z-10 text-white">
          {children}
        </div>
      </div>
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`} />
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* XORA-style 3D Background với Multi-layer Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
        {/* Layer 1: Base cosmic background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900 to-slate-900" />
        
        {/* Layer 2: Dynamic floating orbs like XORA */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-blue-500/20 via-cyan-500/30 to-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Layer 3: Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] animate-pulse" />
      </div>

      {/* Navigation Bar - Ultra Premium Professional */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-2xl border-b border-slate-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between">
            {/* Compact Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                {/* Main Logo */}
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 shadow-lg shadow-purple-500/25">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                {/* Subtle Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-all duration-300" />
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-lg md:text-xl font-bold leading-none bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    BombCall
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                  </div>
                </div>
                <span className="text-xs bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent font-medium tracking-wide hidden sm:block">
                  Auto Calling System
                </span>
              </div>
            </div>

            {/* Spacer - No Navigation Menu */}
            <div className="hidden lg:block flex-1" />

            {/* Compact Login Button */}
            <div className="flex items-center">
              <Button
                onClick={() => setShowLogin(true)}
                className="relative group px-4 md:px-6 py-2.5 font-semibold text-white rounded-xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg"
                data-testid="button-login"
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/15 group-hover:to-purple-500/15 transition-all duration-300" />
                
                {/* Border */}
                <div className="absolute inset-0 border border-slate-600/50 group-hover:border-cyan-400/50 rounded-xl transition-all duration-300" />
                
                {/* Subtle Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                {/* Content */}
                <span className="relative z-10 flex items-center space-x-2 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse" />
                  <span className="font-bold tracking-wide">ĐĂNG NHẬP</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced Responsive */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center px-5 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 backdrop-blur-xl">
              <Sparkles className="w-5 h-5 text-cyan-400 mr-3" />
              <span className="text-sm font-semibold text-gray-200 tracking-wide">CUỘC GỌI KHÔNG NGỪNG NGHỈ - KHÔNG THỂ BỎ QUA</span>
            </div>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-tight text-glow">
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">BombCall</span>
                <span className="bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent text-glow-hover">
                  Gọi Điện Tự Động
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-2xl text-glow-hover">
                <span className="text-red-400 font-bold">GỌI LIÊN TỤC, KHÔNG DỪNG</span> - Hệ thống auto-dialer mạnh mẽ với khả năng 
                <span className="text-yellow-400 font-bold"> gọi lại tự động, theo đuổi nợ, nhắc nhở liên tục</span>. 
                Rotation SIM thông minh để <span className="text-cyan-400 font-bold">KHÔNG BAO GIỜ BỊ CHẶN</span>.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4"
            >
              <Button
                onClick={() => setShowRegister(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 sm:px-6 md:px-8 py-3 md:py-4 text-sm sm:text-base md:text-lg font-bold rounded-xl shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-200 border-glow text-glow-hover"
                data-testid="button-try-now"
              >
                <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                BẮT ĐẦU MIỄN PHÍ
              </Button>
              <Button
                variant="outline"
                className="px-4 sm:px-6 md:px-8 py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold border-2 border-slate-600 text-white hover:bg-slate-800/50 rounded-xl border-glow text-glow-hover"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                XEM TÍNH NĂNG
              </Button>
            </motion.div>

            {/* Responsive Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pt-4 sm:pt-6 md:pt-8">
              {heroStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-block px-3 md:px-4 py-2 rounded-lg bg-gradient-to-r ${stat.gradient} mb-2 md:mb-3 shadow-lg border-glow`}>
                    <span className="text-base md:text-xl font-bold text-white text-glow">{stat.number}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 font-medium leading-tight text-glow-hover">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call Simulation Demo - Premium Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <CallSimulationDemo />
          </motion.div>
        </div>
      </section>

      {/* Project Information Section - Responsive */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 text-glow-white">
                Sức Mạnh <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent text-glow-cyan">Không Thể Cưỡng Lại</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed card-text-glow px-4">
                <span className="text-red-400 font-bold">Hệ thống gọi aggressive chuyên nghiệp</span> - Thiết kế để 
                <span className="text-yellow-400 font-bold"> làm phiền liên tục, nhắc nợ không ngừng</span> và 
                <span className="text-orange-400 font-bold">theo đuổi mục tiêu đến cùng</span>
              </p>
            </motion.div>
          </div>

          {/* Responsive Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 md:mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative bg-gradient-to-r from-cyan-400/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-4 border border-cyan-400/30 overflow-hidden hover:border-cyan-400/60 transition-all duration-300 premium-card-glow h-24">
                  {/* Bright Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 group-hover:from-cyan-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(6,182,212,0.15),transparent_50%)] group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Horizontal Content */}
                  <div className="relative z-10 flex items-center space-x-4 h-full">
                    {/* Compact 4D Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.iconBg} shadow-xl icon-4d icon-4d-glow transition-all duration-300`}>
                        <div className="absolute inset-0.5 rounded-lg bg-gradient-to-br from-white/20 to-transparent" />
                        <feature.icon className="w-6 h-6 text-white relative z-10 drop-shadow-md" />
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-60" />
                      </div>
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.iconBg} blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300 scale-105`} />
                    </div>
                    
                    {/* Compact Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors duration-300 card-title-glow truncate">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 text-sm leading-tight group-hover:text-gray-200 transition-colors duration-300 card-text-glow line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Bright Bottom Accent */}
                  <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${feature.gradient} group-hover:w-full transition-all duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Premium Technical Specifications - Clean & Professional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-purple-500/10"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5" />
            
            <div className="relative p-6 md:p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 text-glow">
                  Thông Số Kỹ Thuật
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mx-auto" />
              </div>
              
              {/* Professional Technical Specifications - Account Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { 
                    label: 'Twilio SDK', 
                    value: 'v4.19.3', 
                    desc: 'API tích hợp chuyên nghiệp',
                    icon: Rocket,
                    cardClass: 'card-purple'
                  },
                  { 
                    label: 'DID Rotation', 
                    value: 'Tự động', 
                    desc: 'Luân phiên thông minh',
                    icon: RefreshCw,
                    cardClass: 'card-emerald'
                  },
                  { 
                    label: 'Concurrent Users', 
                    value: 'Không giới hạn', 
                    desc: 'Đa người dùng cùng lúc',
                    icon: Users,
                    cardClass: 'card-blue'
                  },
                  { 
                    label: 'Database', 
                    value: 'PostgreSQL', 
                    desc: 'Lưu trữ đáng tin cậy',
                    icon: Database,
                    cardClass: 'card-orange'
                  },
                  { 
                    label: 'Authentication', 
                    value: 'JWT + bcryptjs', 
                    desc: 'Bảo mật enterprise',
                    icon: Lock,
                    cardClass: 'card-red'
                  },
                  { 
                    label: 'Real-time Monitor', 
                    value: 'WebSocket', 
                    desc: 'Theo dõi trực tiếp',
                    icon: Satellite,
                    cardClass: 'card-cyan'
                  }
                ].map((spec, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className={`premium-card ${spec.cardClass}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          {/* Professional Icon with gradient background */}
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            spec.cardClass === 'card-purple' ? 'bg-gradient-to-r from-purple-600 to-violet-600' :
                            spec.cardClass === 'card-emerald' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' :
                            spec.cardClass === 'card-blue' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                            spec.cardClass === 'card-orange' ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                            spec.cardClass === 'card-red' ? 'bg-gradient-to-r from-red-600 to-pink-600' :
                            'bg-gradient-to-r from-cyan-600 to-blue-600'
                          }`}>
                            <spec.icon className="w-6 h-6 text-white" />
                          </div>
                          
                          {/* Content with proper spacing */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold text-sm ${
                                spec.cardClass === 'card-purple' ? 'text-glow-purple' :
                                spec.cardClass === 'card-emerald' ? 'text-glow-emerald' :
                                spec.cardClass === 'card-blue' ? 'text-cyan-400' :
                                spec.cardClass === 'card-orange' ? 'text-glow-orange' :
                                spec.cardClass === 'card-red' ? 'text-red-400' :
                                'text-glow-cyan'
                              }`}>
                                {spec.label}
                              </h4>
                            </div>
                            <p className="text-slate-400 text-xs mb-2">{spec.desc}</p>
                            <p className="text-slate-100 font-medium text-sm">{spec.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Power Features Section - Responsive */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-900/50 to-red-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                <span className="text-red-400">SỨC MẠNH</span> Không Thể <span className="text-yellow-400">CƯỠNG LẠI</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
                Hệ thống được thiết kế đặc biệt để <span className="text-red-400 font-bold">GỌI LIÊN TỤC, KHÔNG DỪNG</span> 
                với khả năng <span className="text-yellow-400 font-bold">THEO ĐUỔI MỤC TIÊU ĐẾN CÙNG</span>
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Target,
                title: "GỌI LẠI VÔ HẠN",
                desc: "Auto-retry không giới hạn cho đến khi bên kia bắt máy",
                stats: "∞ lần gọi lại",
                color: "red",
                intensity: "EXTREME"
              },
              {
                icon: Clock,
                title: "24/7 KHÔNG NGHỈ",
                desc: "Gọi liên tục mọi lúc, mọi nơi - không có giờ nghỉ",
                stats: "24/7 hoạt động",
                color: "orange",
                intensity: "HIGH"
              },
              {
                icon: RefreshCw,
                title: "ĐỔI SỐ THÔNG MINH",
                desc: "Rotation DID tự động để tránh bị block hoàn toàn",
                stats: "1000+ DID pool",
                color: "yellow",
                intensity: "MEDIUM"
              },
              {
                icon: Zap,
                title: "AGGRESSIVE MODE",
                desc: "Chế độ nhắc nợ cường độ cao - không thể thoát",
                stats: "Max pressure",
                color: "red",
                intensity: "EXTREME"
              },
              {
                icon: Globe,
                title: "ĐA KÊNH ĐỒNG THỜI",
                desc: "Gọi từ nhiều số khác nhau cùng một lúc",
                stats: "50+ concurrent",
                color: "orange",
                intensity: "HIGH"
              },
              {
                icon: TrendingUp,
                title: "TỶ LỆ THÀNH CÔNG 100%",
                desc: "Không bao giờ bỏ cuộc cho đến khi đạt mục tiêu",
                stats: "100% persistence",
                color: "yellow",
                intensity: "HIGH"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <Card className={`premium-card hover:scale-105 transition-all duration-300 ${
                  feature.color === 'red' ? 'border-red-500/50 hover:border-red-400/80' :
                  feature.color === 'orange' ? 'border-orange-500/50 hover:border-orange-400/80' :
                  'border-yellow-500/50 hover:border-yellow-400/80'
                } ${feature.intensity === 'EXTREME' ? 'animate-pulse' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                        feature.color === 'red' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                        feature.color === 'orange' ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                        'bg-gradient-to-r from-yellow-600 to-orange-600'
                      }`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        feature.intensity === 'EXTREME' ? 'bg-red-600/40 text-red-200 animate-pulse' :
                        feature.intensity === 'HIGH' ? 'bg-orange-500/40 text-orange-200' :
                        'bg-yellow-500/40 text-yellow-200'
                      }`}>
                        {feature.intensity}
                      </span>
                    </div>
                    
                    <h3 className={`text-lg font-bold mb-2 ${
                      feature.color === 'red' ? 'text-red-300' :
                      feature.color === 'orange' ? 'text-orange-300' :
                      'text-yellow-300'
                    }`}>
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                      {feature.desc}
                    </p>
                    
                    <div className={`text-xs font-mono font-bold ${
                      feature.color === 'red' ? 'text-red-400' :
                      feature.color === 'orange' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`}>
                      {feature.stats}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Warning Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 backdrop-blur-xl">
              <Target className="w-5 h-5 text-red-400 mr-3 animate-pulse" />
              <span className="text-sm font-bold text-red-200">
                ⚠️ HỆ THỐNG CÓ THỂ GỌI LIÊN TỤC KHÔNG DỪNG - SỬ DỤNG CÓ TRÁCH NHIỆM
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Responsive Contact Section */}
      <footer className="relative py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left - Project Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">BombCall</h3>
                    <p className="text-cyan-400 text-sm">Professional Auto Calling System</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-300">Về Dự Án</h4>
                  <p className="text-gray-400 leading-relaxed">
                    BombCall là nền tảng gọi điện tự động chuyên nghiệp được phát triển với công nghệ Twilio tiên tiến. 
                    Hệ thống được thiết kế để cung cấp giải pháp outbound calling mạnh mẽ với khả năng auto-retry, 
                    DID rotation và theo dõi real-time.
                  </p>
                  
                  <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30">
                    <Target className="w-4 h-4 text-red-400 mr-2" />
                    <span className="text-red-300 text-sm font-medium">
                      Chuyên dụng cho nhắc nợ & marketing aggressive
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="premium-card bg-gradient-to-br from-slate-800/80 to-slate-900/80">
                <CardContent className="p-8">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Users className="w-5 h-5 text-cyan-400 mr-2" />
                    Thông Tin Liên Hệ
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Chủ Dự Án</h5>
                      <p className="text-gray-300">
                        <span className="text-white font-medium">Vietnam Development Team</span><br />
                        Chuyên phát triển giải pháp Telecom & VoIP
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">Nguồn & License</h5>
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm">
                          ✅ <span className="text-white">Open Source</span> - Có thể tùy chỉnh
                        </p>
                        <p className="text-gray-300 text-sm">
                          ✅ <span className="text-white">Commercial License</span> - Sử dụng thương mại
                        </p>
                        <p className="text-gray-300 text-sm">
                          ✅ <span className="text-white">Full Source Code</span> - Giao toàn bộ code
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">Hỗ Trợ Kỹ Thuật</h5>
                      <div className="space-y-2">
                        <p className="text-gray-300 text-sm flex items-center">
                          <Globe className="w-4 h-4 text-cyan-400 mr-2" />
                          Website: <span className="text-white ml-1">contact@bombcall.vn</span>
                        </p>
                        <p className="text-gray-300 text-sm flex items-center">
                          <Phone className="w-4 h-4 text-blue-400 mr-2" />
                          Telegram: <span className="text-white ml-1">t.me/sivip69</span>
                        </p>
                        <p className="text-gray-300 text-sm flex items-center">
                          <Users className="w-4 h-4 text-purple-400 mr-2" />
                          Channel: <span className="text-white ml-1">t.me/sivipclub</span>
                        </p>
                        <p className="text-gray-300 text-sm flex items-center">
                          <Clock className="w-4 h-4 text-purple-400 mr-2" />
                          Support: <span className="text-white ml-1">24/7 Online</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Bottom Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-slate-700/50 text-center"
          >
            <p className="text-gray-400 text-sm">
              © 2024 <span className="text-white font-medium">BombCall System</span>. 
              Phát triển bởi <span className="text-cyan-400">Vietnam Dev Team</span>. 
              Sử dụng có trách nhiệm và tuân thủ pháp luật.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      <RegisterModal 
        isOpen={showRegister} 
        onClose={() => setShowRegister(false)} 
        onSwitchToLogin={() => {
          setShowRegister(false);  
          setShowLogin(true);
        }}
      />
    </div>
  );
}