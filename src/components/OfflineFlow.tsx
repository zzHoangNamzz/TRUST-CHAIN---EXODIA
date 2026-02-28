import React from 'react';
import { WifiOff, Database, ShieldCheck, UploadCloud, Smartphone, ArrowRight, Server, FileLock2 } from 'lucide-react';

export default function OfflineFlow() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-error/10 rounded-xl">
          <WifiOff className="w-6 h-6 text-error" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Gói Niêm phong Ưu tiên Ngoại tuyến</h2>
          <p className="text-text-muted">Đảm bảo tính toàn vẹn dữ liệu và ngăn chặn gian lận ngay cả khi không có kết nối internet.</p>
        </div>
      </div>

      <div className="bg-bg-base border border-border-color rounded-2xl p-8 shadow-sm">
        <h3 className="font-bold text-xl mb-8 text-center">Quy trình Niêm phong & Đồng bộ Dữ liệu</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative">
          
          {/* Step 1: Offline Capture */}
          <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
            <div className="w-20 h-20 rounded-full bg-bg-surface border-4 border-error flex items-center justify-center mb-4 shadow-md">
              <Smartphone className="w-8 h-8 text-error" />
            </div>
            <h4 className="font-bold text-lg mb-2">1. Chụp Ngoại tuyến</h4>
            <p className="text-sm text-text-muted">
              Tình nguyện viên chụp ảnh/quay video. Ứng dụng ghi lại tọa độ GPS và dấu thời gian an toàn ngay trên thiết bị.
            </p>
          </div>

          <ArrowRight className="w-8 h-8 text-text-muted hidden md:block" />
          <div className="h-8 w-px bg-text-muted md:hidden"></div>

          {/* Step 2: Sealed Package */}
          <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
            <div className="w-20 h-20 rounded-full bg-bg-surface border-4 border-warning flex items-center justify-center mb-4 shadow-md relative">
              <FileLock2 className="w-8 h-8 text-warning" />
              <div className="absolute -top-2 -right-2 bg-warning text-white text-xs font-bold px-2 py-1 rounded-full">
                SHA-256
              </div>
            </div>
            <h4 className="font-bold text-lg mb-2">2. Băm Dữ liệu Cục bộ</h4>
            <p className="text-sm text-text-muted">
              Ứng dụng tạo ra một "Gói Niêm phong" bằng cách băm (hashing) phương tiện + siêu dữ liệu ngay lập tức để ngăn chặn can thiệp.
            </p>
          </div>

          <ArrowRight className="w-8 h-8 text-text-muted hidden md:block" />
          <div className="h-8 w-px bg-text-muted md:hidden"></div>

          {/* Step 3: Online Sync */}
          <div className="flex flex-col items-center text-center w-full md:w-1/3 relative z-10">
            <div className="w-20 h-20 rounded-full bg-bg-surface border-4 border-success flex items-center justify-center mb-4 shadow-md">
              <Server className="w-8 h-8 text-success" />
            </div>
            <h4 className="font-bold text-lg mb-2">3. Đồng bộ Trực tuyến</h4>
            <p className="text-sm text-text-muted">
              Khi có mạng trở lại, gói dữ liệu được tải lên. Máy chủ xác minh Mã băm khớp nhau trước khi gửi đến AI Oracle.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-bg-base p-6 rounded-2xl border border-border-color shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-lg">Lưu trữ Cục bộ (IndexedDB)</h3>
          </div>
          <p className="text-sm text-text-muted">
            Gói Niêm phong (Phương tiện Base64 + Siêu dữ liệu + Mã băm) được lưu trữ an toàn trong IndexedDB của trình duyệt. 
            Điều này cho phép tình nguyện viên ở các khu vực hẻo lánh tiếp tục làm việc mà không bị gián đoạn.
          </p>
        </div>

        <div className="bg-bg-base p-6 rounded-2xl border border-border-color shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-success" />
            <h3 className="font-bold text-lg">Xác minh Chống Giả mạo</h3>
          </div>
          <p className="text-sm text-text-muted">
            Nếu người dùng cố gắng sửa đổi ảnh bằng ứng dụng khác trước khi đồng bộ, mã băm mới sẽ không khớp với mã băm ngoại tuyến ban đầu và giao dịch sẽ bị Hợp đồng Thông minh từ chối.
          </p>
        </div>
      </div>
    </div>
  );
}
