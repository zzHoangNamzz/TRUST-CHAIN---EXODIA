import React, { useState } from 'react';
import { SmartBlock } from '../types';
import { Truck, UploadCloud, Lock, CheckCircle2, Package, Banknote, Camera } from 'lucide-react';
import { compressImage } from '../utils/image';
import { motion, AnimatePresence } from 'motion/react';
import { generateSHA256 } from '../utils/crypto';

interface Props {
  blocks: SmartBlock[];
  updateBlock: (block: SmartBlock) => void;
  currentUserHash: string;
}

export default function Delivery({ blocks, updateBlock, currentUserHash }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const deliveryBlocks = blocks.filter(b => b.state === 'Funded' || b.state === 'InProgress');

  const handleSelectBlock = (id: number) => {
    setSelectedBlock(id);
    // Scroll to the upload section on mobile
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAssign = (id: number) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      const nickname = window.prompt("Nhập nickname của bạn (để dễ quản lý, sẽ được mã hóa sau khi hoàn thành):", "Tình nguyện viên");
      if (nickname) {
        updateBlock({ ...block, state: 'InProgress', volunteerHash: currentUserHash, volunteerNickname: nickname });
        handleSelectBlock(id);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setPreview(compressedBase64);
      } catch (error) {
        console.error("Lỗi nén ảnh:", error);
        alert("Không thể xử lý ảnh này. Vui lòng thử ảnh khác nhỏ hơn.");
      }
    }
  };

  const handleSealPackage = async () => {
    if (!selectedBlock || !preview) return;
    setIsHashing(true);
    
    try {
      // Hashing thực địa: Tạo dấu vân tay cho bằng chứng offline
      const mockHash = await generateSHA256(preview + Date.now());
      
      const block = blocks.find(b => b.id === selectedBlock);
      if (block) {
        updateBlock({
          ...block,
          imageUrl: preview,
          offlineDataHash: mockHash,
          sealedHash: mockHash // Using the same hash for sealed package identification
        });
      }
      
      setPreview(null);
      setSelectedBlock(null);
      alert("Đã tạo Gói Niêm phong (Sealed Package) thành công! Sẵn sàng để AI Oracle xác thực.");
    } catch (error) {
      console.error("Hashing error:", error);
    } finally {
      setIsHashing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold">Giao hàng & Bằng chứng</h2>
        <p className="text-text-muted">Dành cho tình nguyện viên cập nhật hình ảnh thực địa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Nhiệm vụ khả dụng</h3>
          {deliveryBlocks.length === 0 ? (
            <div className="bg-bg-surface border border-border-color rounded-2xl p-8 text-center text-text-muted">
              Không có chiến dịch nào đang chờ giao hàng.
            </div>
          ) : (
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {deliveryBlocks.map(block => {
                  const confirmedDonations = block.donations?.filter(d => d.status === 'confirmed') || [];
                  const moneyTotal = confirmedDonations.filter(d => d.type === 'money').reduce((sum, d) => sum + d.amount, 0);
                  const items = confirmedDonations.filter(d => d.type === 'item');

                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={block.id} 
                      className={`bg-bg-surface rounded-2xl border p-5 transition-colors cursor-pointer ${selectedBlock === block.id ? 'border-primary ring-1 ring-primary' : 'border-border-color hover:border-primary/50'}`} 
                      onClick={() => {
                        if (block.state === 'InProgress' && block.volunteerHash === currentUserHash) {
                          handleSelectBlock(block.id);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{block.title}</h4>
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${block.state === 'Funded' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                      {block.state === 'Funded' ? 'Chờ nhận' : 'Đang giao'}
                    </span>
                  </div>
                  
                  <div className="bg-bg-base rounded-xl p-4 mb-4 border border-border-color space-y-3">
                    <h5 className="text-xs font-bold uppercase text-text-muted">Cần phân phát:</h5>
                    {moneyTotal > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Banknote className="w-4 h-4 text-success" />
                        <span className="font-medium">{moneyTotal.toLocaleString()} đ</span> (Tiền mặt/Chuyển khoản)
                      </div>
                    )}
                    {items.length > 0 && (
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-warning" />
                            <span className="font-medium">{item.itemName}</span>
                            <span className="text-xs text-text-muted">({item.amount.toLocaleString()} đ)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {block.state === 'Funded' ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAssign(block.id); }}
                      className="w-full bg-bg-base border border-border-color hover:bg-primary hover:text-white hover:border-primary py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" /> Nhận nhiệm vụ này
                    </button>
                  ) : block.volunteerHash === currentUserHash ? (
                    <div className="text-sm text-success flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Bạn đang thực hiện nhiệm vụ này ({block.volunteerNickname})
                    </div>
                  ) : (
                    <div className="text-sm text-text-muted">Đang được thực hiện bởi: {block.volunteerNickname || 'Người khác'}</div>
                  )}
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <div className="space-y-4" id="upload-section">
          <h3 className="font-semibold text-lg">Tải lên Bằng chứng (Offline-First)</h3>
          <div className={`bg-bg-surface border border-border-color rounded-2xl p-6 shadow-sm ${!selectedBlock ? 'opacity-50 pointer-events-none' : ''}`}>
            {!selectedBlock ? (
              <div className="text-center text-text-muted py-8">
                Vui lòng chọn một nhiệm vụ đang giao để tải ảnh lên.
              </div>
            ) : !preview ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-border-color rounded-xl p-6 text-center hover:bg-bg-hover transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-camera"
                  />
                  <label htmlFor="image-camera" className="cursor-pointer flex flex-col items-center">
                    <Camera className="w-10 h-10 text-text-muted mb-3" />
                    <span className="font-medium text-primary">Chụp ảnh</span>
                    <span className="text-xs text-text-muted mt-2 hidden sm:block">Mở camera thiết bị</span>
                  </label>
                </div>
                <div className="border-2 border-dashed border-border-color rounded-xl p-6 text-center hover:bg-bg-hover transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-10 h-10 text-text-muted mb-3" />
                    <span className="font-medium text-primary">Thư viện</span>
                    <span className="text-xs text-text-muted mt-2 hidden sm:block">Tải ảnh có sẵn</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border-color">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => setPreview(null)}
                    className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm"
                  >
                    Thay đổi
                  </button>
                </div>
                
                <button
                  onClick={handleSealPackage}
                  disabled={isHashing}
                  className="w-full bg-warning hover:bg-yellow-600 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isHashing ? (
                    <><Lock className="w-5 h-5 animate-pulse" /> Đang mã hóa & Niêm phong...</>
                  ) : (
                    <><Lock className="w-5 h-5" /> Niêm phong Gói dữ liệu (Offline Hash)</>
                  )}
                </button>
                <p className="text-xs text-center text-text-muted">
                  Mô phỏng: Tạo mã băm SHA-256 cục bộ trước khi đồng bộ lên máy chủ.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

