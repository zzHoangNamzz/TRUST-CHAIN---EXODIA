import React from 'react';
import { Palette, Shield, Wifi, Database, HardDrive, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  theme: string;
  setTheme: (theme: string) => void;
  isConnected: boolean;
  currentUserHash: string;
}

export default function Settings({ theme, setTheme, isConnected, currentUserHash }: Props) {
  const themes = [
    { id: 'default', label: 'Giao diện Sáng', color: 'bg-white' },
    { id: 'dark', label: 'Giao diện Tối', color: 'bg-slate-900' },
    { id: 'tet', label: 'Chủ đề Tết Nguyên Đán', color: 'bg-red-600' },
    { id: 'midautumn', label: 'Chủ đề Trung Thu', color: 'bg-amber-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-bg-surface border border-border-color rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Cá nhân hóa Giao diện</h2>
          </div>
          
          <div className="space-y-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all min-h-[56px] ${
                  theme === t.id 
                    ? 'border-primary bg-primary/5 shadow-inner' 
                    : 'border-border-color hover:bg-bg-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border border-black/10 ${t.color}`} />
                  <span className="font-medium">{t.label}</span>
                </div>
                {theme === t.id && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-bg-surface border border-border-color rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Trạng thái Hệ thống</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border-color">
              <div className="flex items-center gap-3">
                <Wifi className={`w-5 h-5 ${isConnected ? 'text-success' : 'text-error'}`} />
                <span className="text-sm font-medium">Kết nối Real-time</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${isConnected ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border-color">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Cơ sở dữ liệu Cloud</span>
              </div>
              <span className="text-xs text-text-muted">SQLite + Socket.io</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-base rounded-xl border border-border-color">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Bộ nhớ đệm Offline</span>
              </div>
              <span className="text-xs text-text-muted">IndexedDB Active</span>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-primary animate-spin-slow" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Auto-Resume Sync</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Hệ thống đang tự động theo dõi trạng thái mạng. Mọi dữ liệu niêm phong (Sealed Packages) sẽ được đẩy lên ngay khi có kết nối.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-surface border border-border-color rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Thông tin Định danh (phoneHash)</h3>
        <div className="bg-bg-base p-4 rounded-xl border border-border-color font-mono text-sm break-all">
          {currentUserHash}
        </div>
      </motion.div>
    </div>
  );
}
