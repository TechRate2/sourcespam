import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center animate-glow">
                <Phone className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold glow-text text-cyan-400">BombCall</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Hệ thống gọi điện tự động chuyên nghiệp với công nghệ Twilio. 
              Giải pháp toàn diện cho doanh nghiệp hiện đại.
            </p>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-purple-400 glow-text">Dịch Vụ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Gọi Điện Tự Động</a></li>
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Quản Lý Twilio</a></li>
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Thống Kê Chi Tiết</a></li>
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">API Tích Hợp</a></li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-emerald-400 glow-text">Hỗ Trợ</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Tài Liệu API</a></li>
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Hướng Dẫn</a></li>
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Liên Hệ</a></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-yellow-400 glow-text">Liên Hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-300">1900 xxx xxx</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">support@twiliocallpro.vn</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300">TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-slate-700/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-slate-400 text-sm">
            © 2024 TwilioCall Pro. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-slate-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-400 animate-pulse" />
            <span>in Vietnam</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
