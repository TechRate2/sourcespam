import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const { register, isRegisterLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    register({
      fullName: formData.fullName,
      email: formData.email,
      username: formData.username,
      password: formData.password,
    });
    onClose();
  };

  const handleSwitchToLogin = () => {
    setFormData({
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
    onSwitchToLogin();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card rounded-2xl p-8 glow-border max-w-md w-full mx-4 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors duration-300"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-400 glow-text mb-2">Đăng Ký</h2>
            <p className="text-slate-300">Tạo tài khoản mới để bắt đầu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-slate-300 mb-2">Họ và tên</Label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400 transition-all duration-300"
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            
            <div>
              <Label className="block text-slate-300 mb-2">Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400 transition-all duration-300"
                placeholder="Nhập email"
                required
              />
            </div>
            
            <div>
              <Label className="block text-slate-300 mb-2">Username</Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400 transition-all duration-300"
                placeholder="Nhập username"
                required
              />
            </div>
            
            <div>
              <Label className="block text-slate-300 mb-2">Mật khẩu</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400 transition-all duration-300"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            
            <div>
              <Label className="block text-slate-300 mb-2">Xác nhận mật khẩu</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-slate-400 transition-all duration-300"
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isRegisterLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg neon-button transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {isRegisterLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleSwitchToLogin}
              className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
            >
              Đã có tài khoản? Đăng nhập
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
