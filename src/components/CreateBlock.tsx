import React, { useState } from 'react';
import { Plus, Target, Info, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { SmartBlock } from '../types';
import { generateSHA256 } from '../utils/crypto';

interface Props {
  addBlock: (block: SmartBlock) => void;
  currentUserHash: string;
}

export default function CreateBlock({ addBlock, currentUserHash }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;

    setIsCreating(true);
    const id = Date.now();
    
    // Hashing thực địa: Tạo dấu vân tay cho block ngay trên trình duyệt
    const dataToHash = `${newTitle}-${newTarget}-${currentUserHash}-${id}`;
    const sealedHash = await generateSHA256(dataToHash);

    const newBlock: SmartBlock = {
      id,
      title: newTitle,
      donorHash: currentUserHash,
      targetAmount: parseInt(newTarget),
      currentAmount: 0,
      state: 'Open',
      donations: [],
      sealedHash: sealedHash,
      syncStatus: 'Synced' // Will be updated by App.tsx logic if offline
    };

    addBlock(newBlock);
    setNewTitle('');
    setNewTarget('');
    setIsCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-surface border border-border-color rounded-2xl p-8 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Tạo Block Chiến Dịch Mới</h2>
            <p className="text-text-muted text-sm">Khởi tạo một chuỗi cứu trợ minh bạch trên Blockchain</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Tên chiến dịch
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ví dụ: Cứu trợ bão lũ miền Trung 2024"
              className="w-full px-4 py-3 border border-border-color rounded-xl bg-bg-base text-text-base focus:ring-2 focus:ring-primary outline-none transition-shadow min-h-[48px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Mục tiêu quyên góp (VNĐ)
            </label>
            <input
              type="number"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="Ví dụ: 100000000"
              className="w-full px-4 py-3 border border-border-color rounded-xl bg-bg-base text-text-base focus:ring-2 focus:ring-primary outline-none transition-shadow min-h-[48px]"
              required
            />
          </div>

          <div className="bg-bg-base p-4 rounded-xl border border-border-color flex items-start gap-3">
            <Shield className="w-5 h-5 text-success mt-0.5" />
            <div className="text-xs text-text-muted leading-relaxed">
              Dữ liệu sẽ được <strong>Niêm phong (Sealed)</strong> bằng thuật toán SHA-256 ngay trên thiết bị của bạn trước khi gửi lên hệ thống để đảm bảo tính toàn vẹn tuyệt đối.
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-secondary transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 min-h-[56px]"
          >
            {isCreating ? "Đang khởi tạo..." : "KHỞI TẠO BLOCK"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
