import React from 'react';
import { Palette, Smartphone, Zap, Layers, Image as ImageIcon } from 'lucide-react';

export default function FrontendArch() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-warning/10 rounded-xl">
          <Palette className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Kiến trúc Frontend & UX</h2>
          <p className="text-text-muted">Tối ưu hóa cho thiết bị cấu hình thấp, giao diện linh hoạt và khả năng ngoại tuyến.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-base p-6 rounded-2xl border border-border-color shadow-sm hover:shadow-md transition-shadow">
          <Smartphone className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Ưu tiên Di động & Native</h3>
          <p className="text-sm text-text-muted">
            Ưu tiên các thành phần gốc (như select và input HTML tiêu chuẩn) thay vì các dropdown JS nặng nề để giảm thiểu mức sử dụng RAM trên các điện thoại thông minh cấu hình thấp.
          </p>
        </div>

        <div className="bg-bg-base p-6 rounded-2xl border border-border-color shadow-sm hover:shadow-md transition-shadow">
          <ImageIcon className="w-8 h-8 text-secondary mb-4" />
          <h3 className="font-bold text-lg mb-2">Đồ họa Vector & SVG</h3>
          <p className="text-sm text-text-muted">
            Thay thế các tài nguyên PNG/JPG nặng bằng đồ họa vector có thể thay đổi kích thước (SVG) sử dụng Lucide React, giảm dung lượng tải ban đầu lên đến 80%.
          </p>
        </div>

        <div className="bg-bg-base p-6 rounded-2xl border border-border-color shadow-sm hover:shadow-md transition-shadow">
          <Zap className="w-8 h-8 text-warning mb-4" />
          <h3 className="font-bold text-lg mb-2">Tải chậm & Hiệu năng</h3>
          <p className="text-sm text-text-muted">
            Triển khai React.lazy() để chia nhỏ route. Các hiệu ứng chuyển động được giữ ở mức cơ bản với CSS transitions (fade-in) thay vì các engine JS vật lý phức tạp để tránh giật lag khung hình.
          </p>
        </div>

        <div className="bg-bg-base p-6 rounded-2xl border border-border-color shadow-sm hover:shadow-md transition-shadow">
          <Layers className="w-8 h-8 text-success mb-4" />
          <h3 className="font-bold text-lg mb-2">Giao diện Linh hoạt</h3>
          <p className="text-sm text-text-muted">
            Sử dụng Biến CSS Toàn cục (<code className="bg-bg-hover px-1 rounded text-xs">@theme</code> trong Tailwind v4) để chuyển đổi toàn bộ bảng màu ngay lập tức mà không cần tải lại các thành phần.
          </p>
        </div>
      </div>

      <div className="mt-12 bg-bg-base rounded-2xl border border-border-color overflow-hidden">
        <div className="p-6 border-b border-border-color">
          <h3 className="font-bold text-xl">Ví dụ Triển khai Giao diện</h3>
          <p className="text-sm text-text-muted mt-1">Cách các biến CSS vận hành hệ thống giao diện linh hoạt.</p>
        </div>
        <div className="p-6 bg-[#1e1e1e] overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300">
            <code>{`:root {
  /* Giao diện Mặc định (Tin cậy, Sạch sẽ, Xanh/Trắng) */
  --primary: #2563eb;
  --bg-base: #f8fafc;
  --text-base: #0f172a;
}

[data-theme="tet"] {
  /* Giao diện Tết (Lễ hội, Ấm áp, Đỏ/Vàng) */
  --primary: #dc2626;
  --bg-base: #fff1f2;
  --text-base: #7f1d1d;
}

[data-theme="midautumn"] {
  /* Giao diện Trung Thu (Bầu trời đêm, Mặt trăng, Xanh đen/Vàng) */
  --primary: #fcd34d;
  --bg-base: #0f172a;
  --text-base: #f8fafc;
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
