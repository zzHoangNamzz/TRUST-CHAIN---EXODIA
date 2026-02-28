export type BlockState = 'Open' | 'Funded' | 'InProgress' | 'Verified' | 'Completed' | 'Locked';
export type SyncStatus = 'Synced' | 'Pending';

export type DonationType = 'money' | 'item';
export type DonationStatus = 'pending' | 'confirmed' | 'rejected';

export interface Donation {
  id: string;
  donorHash: string;
  type: DonationType;
  amount: number; // Giá trị quy đổi ra VNĐ
  itemName?: string; // Tên hiện vật (nếu có)
  proofImage: string; // Ảnh bằng chứng (biên lai hoặc ảnh hiện vật)
  status: DonationStatus;
  aiAssessment?: string; // Đánh giá của AI (dành cho hiện vật)
  aiValid?: boolean; // Kết quả đánh giá của AI
  syncStatus?: SyncStatus;
  sealedHash?: string;
}

export interface SmartBlock {
  id: number;
  title: string;
  donorHash: string;
  volunteerHash?: string;
  volunteerNickname?: string; // Tên hiển thị của tình nguyện viên khi đang giao hàng
  recipientHash?: string;
  targetAmount: number;
  currentAmount: number;
  state: BlockState;
  offlineDataHash?: string;
  trustScore?: number;
  imageUrl?: string;
  aiReasoning?: string;
  itemsDetected?: string[];
  donations: Donation[];
  syncStatus?: SyncStatus;
  sealedHash?: string;
}

export interface UserSettings {
  userHash: string;
  theme: string;
  lastSync: number;
}
