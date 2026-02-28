import React from 'react';
import { SmartBlock } from '../types';
import { ShieldAlert, ShieldCheck, Check, X } from 'lucide-react';

interface Props {
  blocks: SmartBlock[];
  updateBlock: (block: SmartBlock) => void;
}

export default function Verification({ blocks, updateBlock }: Props) {
  const pendingBlocks = blocks.filter(b => b.state === 'InProgress' && b.imageUrl);
  const verifiedBlocks = blocks.filter(b => b.state === 'Verified' || b.state === 'Completed' || b.state === 'Locked');

  const handleApprove = (block: SmartBlock) => {
    updateBlock({
      ...block,
      state: 'Verified'
    });
  };

  const handleReject = (block: SmartBlock) => {
    updateBlock({
      ...block,
      state: 'InProgress',
      imageUrl: undefined,
      offlineDataHash: undefined
    });
  };

  const handleComplete = (id: number) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      updateBlock({ ...block, state: 'Locked' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold">Xác thực Giao hàng</h2>
        <p className="text-text-muted">Kiểm tra và phê duyệt các bằng chứng giao hàng từ tình nguyện viên.</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-warning" /> Chờ xác thực
        </h3>
        {pendingBlocks.length === 0 ? (
          <div className="bg-bg-surface border border-border-color rounded-2xl p-8 text-center text-text-muted">
            Không có dữ liệu nào đang chờ xác thực.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingBlocks.map(block => (
              <div key={block.id} className="bg-bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <img src={block.imageUrl} alt="Proof" className="w-full h-48 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-bold mb-2">{block.title}</h4>
                  <div className="text-xs font-mono bg-bg-base p-2 rounded mb-4 truncate" title={block.offlineDataHash}>
                    Hash: {block.offlineDataHash}
                  </div>
                  
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => handleApprove(block)}
                      className="flex-1 bg-success text-white font-medium py-2.5 rounded-xl hover:bg-success/90 transition-colors text-sm flex justify-center items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Hợp lệ
                    </button>
                    <button
                      onClick={() => handleReject(block)}
                      className="flex-1 bg-error text-white font-medium py-2.5 rounded-xl hover:bg-error/90 transition-colors text-sm flex justify-center items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" /> Đã xác thực & Khóa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verifiedBlocks.map(block => (
            <div key={block.id} className="bg-bg-surface border border-border-color rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold">{block.title}</h4>
                <span className={`px-2 py-1 text-xs font-bold rounded-md ${block.state === 'Locked' ? 'bg-text-muted text-white' : 'bg-success/10 text-success'}`}>
                  {block.state === 'Locked' ? 'Đã Khóa Vĩnh Viễn' : 'Đã Xác Thực'}
                </span>
              </div>
              
              <div className="flex gap-4 mb-4">
                {block.imageUrl && <img src={block.imageUrl} alt="Proof" className="w-24 h-24 object-cover rounded-lg border border-border-color" />}
                <div className="flex-1 flex items-center">
                  <div className="text-success font-bold text-sm flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Bằng chứng đã được phê duyệt
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border-color">
                {block.state === 'Verified' ? (
                  <div className="text-center text-sm text-warning font-medium bg-warning/10 p-2 rounded">
                    Chờ người tạo chiến dịch xác nhận giải ngân
                  </div>
                ) : (
                  <div className="text-center text-sm text-text-muted font-mono bg-bg-base p-2 rounded">
                    Block ID: {block.id} | Đã Giải Ngân
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
