import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Shield, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/ui/navbar';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    subject: 'Tư vấn dịch vụ'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Gửi thành công!",
      description: "Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.",
    });
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      subject: 'Tư vấn dịch vụ'
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Hotline 24/7',
      value: '+84 901 234 567',
      description: 'Hỗ trợ kỹ thuật và tư vấn',
      color: 'text-emerald-400'
    },
    {
      icon: Mail,
      title: 'Email hỗ trợ',
      value: 'support@twiliopro.com',
      description: 'Phản hồi trong vòng 2 giờ',
      color: 'text-blue-400'
    },
    {
      icon: MapPin,
      title: 'Địa chỉ văn phòng',
      value: 'Tầng 15, Tòa nhà FPT, Quận 1, TP.HCM',
      description: 'Thứ 2 - Thứ 6: 8:00 - 18:00',
      color: 'text-purple-400'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      value: 'Chat trực tuyến',
      description: 'Phản hồi tức thì',
      color: 'text-cyan-400'
    }
  ];

  const subjects = [
    'Tư vấn dịch vụ',
    'Hỗ trợ kỹ thuật',
    'Báo giá dịch vụ',
    'Đối tác hợp tác',
    'Khiếu nại dịch vụ',
    'Khác'
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-16 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-purple-600 mb-6">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Đội ngũ chuyên gia sẵn sàng hỗ trợ bạn 24/7. Liên hệ ngay để được tư vấn 
              giải pháp cuộc gọi tự động tối ưu nhất cho doanh nghiệp.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="feature-card-premium">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <info.icon className={`w-6 h-6 ${info.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {info.title}
                          </h3>
                          <p className={`font-semibold ${info.color} mb-1`}>
                            {info.value}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="feature-card-premium">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Bảo Mật Tuyệt Đối
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Thông tin của bạn được mã hóa và bảo vệ theo tiêu chuẩn quốc tế
                    </p>
                    <div className="flex justify-center space-x-2 mt-4">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-semibold">ISO 27001</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="feature-card-premium">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-purple-400 glow-text">
                    Gửi Tin Nhắn Cho Chúng Tôi
                  </CardTitle>
                  <p className="text-slate-300">
                    Điền thông tin bên dưới và chúng tôi sẽ liên hệ với bạn sớm nhất
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">
                          Họ và tên *
                        </label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nhập họ và tên"
                          className="premium-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Nhập địa chỉ email"
                          className="premium-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">
                          Số điện thoại
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Nhập số điện thoại"
                          className="premium-input"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2">
                          Công ty
                        </label>
                        <Input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Tên công ty"
                          className="premium-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-purple-300 font-semibold mb-2">
                        Chủ đề
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="premium-input w-full"
                      >
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-purple-300 font-semibold mb-2">
                        Nội dung tin nhắn *
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Mô tả chi tiết nhu cầu của bạn..."
                        className="premium-input min-h-[120px]"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 neon-button text-lg font-semibold py-3"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Đang gửi...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-5 h-5 mr-2" />
                          Gửi Tin Nhắn
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <Card className="feature-card-premium">
              <CardContent className="p-8">
                <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Cam Kết Phản Hồi Nhanh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-emerald-400 mb-2">2 giờ</div>
                    <div className="text-slate-300">Email hỗ trợ</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">30 giây</div>
                    <div className="text-slate-300">Live chat</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
                    <div className="text-slate-300">Hotline hỗ trợ</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}