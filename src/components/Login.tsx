import React, { useState } from 'react';
import { Shield, User, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  onLogin: (hash: string) => void;
}

export default function Login({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      // Create a simple pseudo-hash based on the name for the demo
      // In a real app, this would be a proper cryptographic hash or wallet address
      const timestamp = new Date().getTime().toString(16);
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const mockHash = `0x${cleanName}${timestamp}a1b2c3d4e5f6`.substring(0, 42).padEnd(42, '0');
      
      // Simulate network delay for better UX
      setTimeout(() => {
        onLogin(mockHash);
      }, 800);
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-bg-base flex flex-col items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in duration-500 overflow-hidden">
      <div className="w-full max-w-md bg-bg-surface rounded-2xl shadow-lg border border-border-color p-5 sm:p-8 relative flex flex-col max-h-full overflow-y-auto">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        
        <div className="flex flex-col items-center mb-4 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">TRUST-CHAIN</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 sm:mt-2 text-center">
            Nền tảng thiện nguyện minh bạch bằng Blockchain & AI
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Tạo định danh ẩn danh</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-border-color rounded-xl bg-bg-base text-text-base text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
                placeholder="Nhập tên hoặc biệt danh của bạn"
                required
                autoFocus
                maxLength={30}
              />
            </div>
            <p className="text-[10px] sm:text-xs text-text-muted mt-1 sm:mt-2 leading-tight">
              Tên của bạn sẽ được băm (hashing) một chiều để tạo ra một địa chỉ ví ẩn danh duy nhất trên chuỗi khối.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-primary hover:bg-secondary text-white font-medium py-2.5 sm:py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Đang tạo định danh...</>
            ) : (
              <>Truy cập hệ thống <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>
            )}
          </button>
          
          <div className="mt-2 sm:mt-4 text-center flex flex-col gap-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border-color"></div>
              <span className="flex-shrink-0 mx-4 text-text-muted text-xs">HOẶC</span>
              <div className="flex-grow border-t border-border-color"></div>
            </div>

            <button 
              type="button" 
              onClick={() => {
                const randomId = Math.floor(Math.random() * 1000000).toString(16);
                onLogin(`0xanon${randomId}a1b2c3d4e5f6`.padEnd(42, '0'));
              }}
              className="w-full bg-bg-hover text-text-base font-medium py-2.5 sm:py-3 rounded-xl transition-colors text-sm sm:text-base border border-border-color hover:border-primary"
            >
              Đăng nhập ẩn danh ngẫu nhiên
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-4 sm:mt-8 text-center text-[10px] sm:text-xs text-text-muted max-w-md px-4">
        Bằng việc tiếp tục, bạn đồng ý với việc hệ thống sẽ tạo một Định danh Ẩn danh (Smart Block Hash) đại diện cho bạn trên mạng lưới.
      </div>
    </div>
  );
}
