import React, { useState } from 'react';
import { SmartBlock, Donation, DonationType } from '../types';
import { Heart, Plus, Target, Check, X, UploadCloud, Image as ImageIcon, Package, Banknote, Loader2, ShieldAlert, ShieldCheck, Camera, CheckCircle2, Truck, Lock } from 'lucide-react';
import { compressImage } from '../utils/image';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  blocks: SmartBlock[];
  addBlock: (block: SmartBlock) => void;
  updateBlock: (block: SmartBlock) => void;
  currentUserHash: string;
}

export default function Campaigns({ blocks, addBlock, updateBlock, currentUserHash }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Donate Modal State
  const [donateBlockId, setDonateBlockId] = useState<number | null>(null);
  const [donateType, setDonateType] = useState<DonationType>('money');
  const [donateAmount, setDonateAmount] = useState('');
  const [donateItemName, setDonateItemName] = useState('');
  const [donateProof, setDonateProof] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Nén ảnh phía client (giảm từ 5MB+ xuống còn ~100KB)
        // Tránh lỗi treo trình duyệt trên điện thoại yếu khi chuyển sang Base64
        const compressedBase64 = await compressImage(file);
        setDonateProof(compressedBase64);
      } catch (error) {
        console.error("Lỗi nén ảnh:", error);
        alert("Không thể xử lý ảnh này. Vui lòng thử ảnh khác nhỏ hơn.");
      }
    }
  };

  const submitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donateBlockId || !donateAmount || !donateProof) return;
    if (donateType === 'item' && !donateItemName) return;

    const newDonation: Donation = {
      id: Math.random().toString(36).substr(2, 9),
      donorHash: currentUserHash,
      type: donateType,
      amount: parseInt(donateAmount),
      itemName: donateType === 'item' ? donateItemName : undefined,
      proofImage: donateProof,
      status: 'pending'
    };

    const blockToUpdate = blocks.find(b => b.id === donateBlockId);
    if (blockToUpdate) {
      updateBlock({ ...blockToUpdate, donations: [...blockToUpdate.donations, newDonation] });
    }

    setDonateBlockId(null);
    setDonateType('money');
    setDonateAmount('');
    setDonateItemName('');
    setDonateProof(null);
  };

  const handleConfirmDonation = (blockId: number, donationId: string, isApproved: boolean) => {
    const blockToUpdate = blocks.find(b => b.id === blockId);
    if (blockToUpdate) {
      const updatedDonations = blockToUpdate.donations.map(d => {
        if (d.id === donationId) {
          return { ...d, status: isApproved ? 'confirmed' : 'rejected' } as Donation;
        }
        return d;
      });

      // Recalculate current amount
      const newAmount = updatedDonations
        .filter(d => d.status === 'confirmed')
        .reduce((sum, d) => sum + d.amount, 0);

      updateBlock({
        ...blockToUpdate,
        donations: updatedDonations,
        currentAmount: newAmount,
        state: newAmount >= blockToUpdate.targetAmount ? 'Funded' : blockToUpdate.state
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chiến dịch Quyên góp</h2>
          <p className="text-text-muted">Tham gia đóng góp vào các Smart Block minh bạch.</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Open', 'Funded', 'InProgress', 'Verified', 'Locked'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === status 
                ? 'bg-primary text-white' 
                : 'bg-bg-surface border border-border-color text-text-muted hover:bg-bg-hover'
            }`}
          >
            {status === 'All' ? 'Tất cả' : 
             status === 'Open' ? 'Đang gọi vốn' : 
             status === 'Funded' ? 'Đã đủ vốn' : 
             status === 'InProgress' ? 'Đang giao hàng' : 
             status === 'Verified' ? 'Đã xác thực' : 
             status === 'Locked' ? 'Đã giải ngân' : status}
          </button>
        ))}
      </div>

      {/* Donate Modal */}
      {donateBlockId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Quyên góp</h3>
              <button onClick={() => setDonateBlockId(null)} className="p-2 hover:bg-bg-hover rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitDonation} className="space-y-5">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDonateType('money')}
                  className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${donateType === 'money' ? 'border-primary bg-primary/10 text-primary' : 'border-border-color text-text-muted hover:bg-bg-hover'}`}
                >
                  <Banknote className="w-6 h-6" />
                  <span className="font-medium text-sm">Tiền mặt / CK</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDonateType('item')}
                  className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${donateType === 'item' ? 'border-primary bg-primary/10 text-primary' : 'border-border-color text-text-muted hover:bg-bg-hover'}`}
                >
                  <Package className="w-6 h-6" />
                  <span className="font-medium text-sm">Hiện vật</span>
                </button>
              </div>

              {donateType === 'item' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Tên hiện vật</label>
                  <input 
                    type="text" 
                    value={donateItemName}
                    onChange={(e) => setDonateItemName(e.target.value)}
                    className="w-full bg-bg-base border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="VD: 100 thùng mì tôm..."
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  {donateType === 'money' ? 'Số tiền (VNĐ)' : 'Giá trị quy đổi ước tính (VNĐ)'}
                </label>
                <input 
                  type="number" 
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  className="w-full bg-bg-base border border-border-color rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="VD: 500000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Bằng chứng ({donateType === 'money' ? 'Biên lai chuyển khoản' : 'Ảnh chụp hiện vật'})
                </label>
                {!donateProof ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-border-color rounded-xl p-4 text-center hover:bg-bg-hover transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                        id="proof-camera"
                      />
                      <label htmlFor="proof-camera" className="cursor-pointer flex flex-col items-center">
                        <Camera className="w-8 h-8 text-text-muted mb-2" />
                        <span className="text-sm font-medium text-primary">Chụp ảnh</span>
                      </label>
                    </div>
                    <div className="border-2 border-dashed border-border-color rounded-xl p-4 text-center hover:bg-bg-hover transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="proof-upload"
                      />
                      <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                        <UploadCloud className="w-8 h-8 text-text-muted mb-2" />
                        <span className="text-sm font-medium text-primary">Thư viện</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border-color">
                    <img src={donateProof} alt="Proof" className="w-full h-32 object-cover" />
                    <button 
                      type="button"
                      onClick={() => setDonateProof(null)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={!donateAmount || !donateProof || (donateType === 'item' && !donateItemName)}
                className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-secondary transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                Gửi yêu cầu xác nhận
              </button>
            </form>
          </div>
        </div>
      )}

      {blocks.length === 0 ? (
        <div className="bg-bg-surface border border-border-color rounded-2xl p-12 text-center text-text-muted">
          Chưa có chiến dịch nào. Hãy là người đầu tiên tạo chiến dịch!
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {(filterStatus === 'All' ? blocks : blocks.filter(b => b.state === filterStatus)).length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full bg-bg-surface border border-border-color rounded-2xl p-12 text-center text-text-muted"
              >
                Không có chiến dịch nào phù hợp với bộ lọc này.
              </motion.div>
            ) : (
              (filterStatus === 'All' ? blocks : blocks.filter(b => b.state === filterStatus)).map(block => {
                const isCreator = block.donorHash === currentUserHash;
                const pendingDonations = block.donations?.filter(d => d.status === 'pending') || [];

                return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={block.id} 
                  className="bg-bg-surface rounded-2xl border border-border-color overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        block.state === 'Open' ? 'bg-warning/10 text-warning' : 
                        block.state === 'Funded' ? 'bg-success/10 text-success' : 
                        'bg-primary/10 text-primary'
                      }`}>
                        {block.state === 'Open' ? 'Đang gọi vốn' : block.state === 'Funded' ? 'Đã đủ vốn' : block.state}
                      </span>
                      {block.syncStatus === 'Pending' && (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-error/10 text-error flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                          Pending Sync
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-text-muted" title="Người tạo">
                      {block.donorHash.substring(0, 10)}...
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{block.title}</h3>
                  {block.volunteerNickname && (
                    <div className="text-xs text-text-muted mb-2 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Tình nguyện viên: {block.volunteerNickname}
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Đã quyên góp</span>
                      <span className="font-medium">{block.currentAmount.toLocaleString()} đ</span>
                    </div>
                    <div className="w-full bg-bg-base rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((block.currentAmount / block.targetAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>0 đ</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3"/> {block.targetAmount.toLocaleString()} đ</span>
                    </div>
                  </div>

                  {/* Delivery Proof */}
                  {block.imageUrl && (
                    <div className="mt-6 pt-4 border-t border-border-color">
                      <h4 className="text-sm font-bold mb-3 text-primary flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Bằng chứng phân phát
                      </h4>
                      <div className="bg-bg-base p-3 rounded-lg border border-border-color text-sm">
                        <img src={block.imageUrl} alt="Delivery Proof" className="w-full h-32 object-cover rounded border border-border-color cursor-pointer hover:opacity-80" onClick={() => window.open(block.imageUrl, '_blank')} />
                        {block.state === 'Verified' ? (
                          <div className="mt-2 text-xs text-success flex items-center gap-1 font-medium">
                            <ShieldCheck className="w-4 h-4" /> Đã được hệ thống xác thực hợp lệ
                          </div>
                        ) : block.state === 'Locked' ? (
                          <div className="mt-2 text-xs text-text-muted flex items-center gap-1 font-medium">
                            <Lock className="w-4 h-4" /> Đã giải ngân & Khóa
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-warning flex items-center gap-1 font-medium">
                            <ShieldAlert className="w-4 h-4" /> Đang chờ hệ thống xác thực
                          </div>
                        )}

                        {/* Manual Verification by Creator */}
                        {block.state === 'InProgress' && isCreator && (
                          <div className="mt-3 pt-3 border-t border-border-color flex gap-2">
                            <button 
                              onClick={() => updateBlock({ ...block, state: 'Locked', volunteerNickname: undefined })}
                              className="flex-1 bg-success text-white py-2 rounded-lg text-xs font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Duyệt thủ công & Giải ngân
                            </button>
                            <button 
                              onClick={() => updateBlock({ ...block, state: 'InProgress', imageUrl: undefined, offlineDataHash: undefined })}
                              className="flex-1 bg-error text-white py-2 rounded-lg text-xs font-medium hover:bg-error/90 transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" /> Yêu cầu chụp lại
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Confirmed Donations */}
                  {block.donations && block.donations.filter(d => d.status === 'confirmed').length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border-color">
                      <h4 className="text-sm font-bold mb-3 text-success flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã xác nhận ({block.donations.filter(d => d.status === 'confirmed').length})
                      </h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                        {block.donations.filter(d => d.status === 'confirmed').map(d => (
                          <div key={d.id} className="bg-bg-base p-3 rounded-lg border border-border-color text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium">{d.type === 'money' ? 'Tiền mặt' : d.itemName}</span>
                                <div className="text-xs text-text-muted">{d.amount.toLocaleString()} đ</div>
                              </div>
                              <span className="text-[10px] font-mono text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">
                                {d.donorHash.substring(0, 8)}...
                              </span>
                            </div>
                            <img src={d.proofImage} alt="Proof" className="w-full h-16 object-cover rounded border border-border-color cursor-pointer hover:opacity-80" onClick={() => window.open(d.proofImage, '_blank')} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Donations for Creator or Donor */}
                  {(isCreator || pendingDonations.some(d => d.donorHash === currentUserHash)) && pendingDonations.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border-color">
                      <h4 className="text-sm font-bold mb-3 text-warning flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                        {isCreator ? `Chờ bạn xác nhận (${pendingDonations.length})` : `Đang chờ xác nhận (${pendingDonations.filter(d => d.donorHash === currentUserHash).length})`}
                      </h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                        {pendingDonations.filter(d => isCreator || d.donorHash === currentUserHash).map(d => (
                          <div key={d.id} className="bg-bg-base p-3 rounded-lg border border-border-color text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium">{d.type === 'money' ? 'Tiền mặt' : d.itemName}</span>
                                <div className="text-xs text-text-muted">{d.amount.toLocaleString()} đ</div>
                              </div>
                              <div className="flex gap-1">
                                {isCreator ? (
                                  <>
                                    <button onClick={() => handleConfirmDonation(block.id, d.id, true)} className="p-1 bg-success/10 text-success rounded hover:bg-success hover:text-white transition-colors">
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleConfirmDonation(block.id, d.id, false)} className="p-1 bg-error/10 text-error rounded hover:bg-error hover:text-white transition-colors">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-warning italic">Đang chờ duyệt</span>
                                )}
                              </div>
                            </div>
                            <img src={d.proofImage} alt="Proof" className="w-full h-16 object-cover rounded border border-border-color cursor-pointer hover:opacity-80" onClick={() => window.open(d.proofImage, '_blank')} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-border-color bg-bg-base/50">
                  {block.state === 'Open' ? (
                    <button 
                      onClick={() => setDonateBlockId(block.id)}
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" /> Quyên góp ngay
                    </button>
                  ) : block.state === 'Verified' && isCreator ? (
                    <button 
                      onClick={() => updateBlock({ ...block, state: 'Locked', volunteerNickname: undefined })}
                      className="w-full bg-success text-white hover:bg-success/90 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Xác nhận hoàn thành & Giải ngân
                    </button>
                  ) : (
                    <button disabled className="w-full bg-bg-hover text-text-muted py-2.5 rounded-xl font-medium cursor-not-allowed">
                      {block.state === 'Funded' ? 'Đã đủ vốn' : 
                       block.state === 'InProgress' ? (block.imageUrl ? 'Chờ xác thực ảnh giao hàng' : 'Đang giao hàng') : 
                       block.state === 'Verified' ? 'Chờ người tạo xác nhận' : 
                       block.state === 'Locked' ? 'Đã giải ngân' : 'Đã đóng'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
            })
          )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
