import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const { login: authenticate, isLoginLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticate({ login, password });
    onClose();
  };

  const handleSwitchToRegister = () => {
    setLogin('');
    setPassword('');
    onSwitchToRegister();
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
            <h2 className="text-3xl font-bold text-cyan-400 glow-text mb-2">Đăng Nhập</h2>
            <p className="text-slate-300">Truy cập vào dashboard của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="block text-slate-300 mb-2">Email hoặc Username</Label>
              <Input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400 transition-all duration-300"
                placeholder="Nhập email hoặc username"
                required
              />
            </div>
            
            <div>
              <Label className="block text-slate-300 mb-2">Mật khẩu</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 glow-border rounded-lg focus:ring-2 focus:ring-cyan-500 text-white placeholder-slate-400 transition-all duration-300"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoginLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg neon-button transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {isLoginLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleSwitchToRegister}
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
            >
              Chưa có tài khoản? Đăng ký ngay
            </button>
          </div>


        </motion.div>
      </div>
    </AnimatePresence>
  );
}
