import React, { useState, useEffect } from 'react';
import { Shield, Heart, Truck, ShieldCheck, Palette, LogOut, Search, Wifi, WifiOff, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Campaigns from './components/Campaigns';
import Delivery from './components/Delivery';
import Verification from './components/Verification';
import CreateBlock from './components/CreateBlock';
import Settings from './components/Settings';
import Login from './components/Login';
import { SmartBlock, SyncStatus, UserSettings } from './types';
import { io, Socket } from 'socket.io-client';
import { savePendingSync, getPendingSyncs, removePendingSync } from './utils/db';

export default function App() {
  const [currentUserHash, setCurrentUserHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [theme, setTheme] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [blocks, setBlocks] = useState<SmartBlock[]>([]);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Connect to Socket.io server with fallback transports
    const newSocket = io({
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      
      // Sync offline data when reconnected
      if (currentUserHash) {
        newSocket.emit("user_login", currentUserHash);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    newSocket.on("user_settings", (settings: UserSettings) => {
      if (settings.theme) setTheme(settings.theme);
    });

    newSocket.on("init_data", (initialBlocks: SmartBlock[]) => {
      processBlocks(initialBlocks);
    });

    newSocket.on("block_added", (newBlock: SmartBlock) => {
      setBlocks(prev => {
        if (prev.find(b => b.id === newBlock.id)) return prev;
        
        // Lazy Sync: Mobile only loads blocks user is involved in
        const isCurrentlyMobile = window.innerWidth <= 768;
        if (isCurrentlyMobile && currentUserHash) {
          const isRelated = newBlock.donorHash === currentUserHash || 
                            newBlock.volunteerHash === currentUserHash || 
                            newBlock.recipientHash === currentUserHash ||
                            newBlock.donations.some(d => d.donorHash === currentUserHash);
          if (!isRelated) return prev;
        }
        
        return [newBlock, ...prev].sort((a, b) => b.id - a.id);
      });
    });

    newSocket.on("block_updated", (updatedBlock: SmartBlock) => {
      setBlocks(prev => {
        // Lazy Sync: Mobile only loads blocks user is involved in
        const isCurrentlyMobile = window.innerWidth <= 768;
        if (isCurrentlyMobile && currentUserHash) {
          const isRelated = updatedBlock.donorHash === currentUserHash || 
                            updatedBlock.volunteerHash === currentUserHash || 
                            updatedBlock.recipientHash === currentUserHash ||
                            updatedBlock.donations.some(d => d.donorHash === currentUserHash);
          if (!isRelated) {
            // Remove if it's no longer related
            return prev.filter(b => b.id !== updatedBlock.id);
          }
        }

        const exists = prev.find(b => b.id === updatedBlock.id);
        if (exists) {
          return prev.map(b => b.id === updatedBlock.id ? updatedBlock : b).sort((a, b) => b.id - a.id);
        } else {
          return [updatedBlock, ...prev].sort((a, b) => b.id - a.id);
        }
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserHash]);

  const processBlocks = (allBlocks: SmartBlock[]) => {
    setBlocks(allBlocks.sort((a, b) => b.id - a.id));
  };

  const addBlock = async (block: SmartBlock) => {
    const newBlock = { 
      ...block, 
      syncStatus: isConnected ? 'Synced' : 'Pending' as SyncStatus
    };

    // Optimistic Update
    setBlocks(prev => {
      if (prev.find(b => b.id === block.id)) return prev;
      return [newBlock, ...prev].sort((a, b) => b.id - a.id);
    });
    
    if (socket && socket.connected) {
      socket.emit("add_block", newBlock);
    } else {
      // Lưu vào IndexedDB (Sealed Package) khi mất mạng
      await savePendingSync({ id: newBlock.id, type: 'add', data: newBlock });
      console.log("Dữ liệu đã được niêm phong vào IndexedDB");
    }
  };

  const updateBlock = async (block: SmartBlock) => {
    const updatedBlock = { 
      ...block, 
      syncStatus: isConnected ? 'Synced' : 'Pending' as SyncStatus
    };

    // Optimistic Update
    setBlocks(prev => prev.map(b => b.id === block.id ? updatedBlock : b).sort((a, b) => b.id - a.id));
    
    if (socket && socket.connected) {
      socket.emit("update_block", updatedBlock);
    } else {
      // Lưu vào IndexedDB (Sealed Package) khi mất mạng
      await savePendingSync({ id: updatedBlock.id, type: 'update', data: updatedBlock });
      console.log("Bản cập nhật đã được niêm phong vào IndexedDB");
    }
  };

  const syncData = async () => {
    if (!socket || !socket.connected) return;
    
    // 1. Đồng bộ từ IndexedDB trước
    const pendingSyncs = await getPendingSyncs();
    if (pendingSyncs.length > 0) {
      console.log(`Đang đẩy ${pendingSyncs.length} gói dữ liệu niêm phong từ IndexedDB...`);
      for (const sync of pendingSyncs) {
        const event = sync.type === 'add' ? 'add_block' : 'update_block';
        socket.emit(event, { ...sync.data, syncStatus: 'Synced' });
        await removePendingSync(sync.id);
      }
    }

    // 2. Đồng bộ các block đang có trạng thái Pending trong state (nếu có)
    const pendingBlocks = blocks.filter(b => b.syncStatus === 'Pending');
    if (pendingBlocks.length === 0) return;

    console.log(`Đang đồng bộ ${pendingBlocks.length} dữ liệu ngoại tuyến...`);

    for (const block of pendingBlocks) {
      // BƯỚC 1: Ưu tiên đồng bộ Metadata & Sealed Hash lên "Blockchain" (Server) trước
      // Để xác lập quyền ưu tiên và tính toàn vẹn của dữ liệu
      const metadataOnly = { ...block, imageUrl: undefined, donations: block.donations.map(d => ({ ...d, proofImage: '' })) };
      socket.emit("update_block", { ...metadataOnly, syncStatus: 'Synced' });

      // BƯỚC 2: Sau đó mới tải các tệp tin nặng (ảnh) lên Cloud Storage (Server)
      // Giả lập độ trễ tải tệp tin
      setTimeout(() => {
        socket.emit("update_block", { ...block, syncStatus: 'Synced' });
      }, 1000);
    }
  };

  useEffect(() => {
    if (isConnected) {
      syncData();
    }
  }, [isConnected]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Sync theme to server
    if (socket && socket.connected && currentUserHash) {
      socket.emit("update_settings", { 
        userHash: currentUserHash, 
        settings: { theme, lastSync: Date.now() } 
      });
    }
  }, [theme, currentUserHash, isConnected]);

  const handleLogout = () => {
    setCurrentUserHash(null);
  };

  const filteredBlocks = blocks.filter(block => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      block.title.toLowerCase().includes(query) ||
      block.id.toString().includes(query) ||
      block.donorHash.toLowerCase().includes(query) ||
      block.donations?.some(d => d.donorHash.toLowerCase().includes(query) || (d.itemName && d.itemName.toLowerCase().includes(query)))
    );
  });

  if (!currentUserHash) {
    return <Login onLogin={setCurrentUserHash} />;
  }

  const tabs = [
    { id: 'create', label: 'Tạo Block', icon: Plus },
    { id: 'campaigns', label: 'Show Block', icon: Heart },
    { id: 'delivery', label: 'Cập nhật', icon: Truck },
    { id: 'settings', label: 'Cấu hình', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-bg-base text-text-base transition-colors duration-300 font-sans pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-color shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl tracking-tight hidden sm:block">TRUST-CHAIN</span>
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500 ml-2" title="Đã kết nối đồng bộ" />
            ) : (
              <WifiOff className="w-4 h-4 text-error ml-2" title="Mất kết nối" />
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-text-muted hover:bg-bg-hover'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Tìm chiến dịch, mã hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-border-color rounded-xl bg-bg-base text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow w-48 lg:w-64"
              />
            </div>
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs text-text-muted">Định danh của bạn</span>
              <span className="text-sm font-mono font-medium" title={currentUserHash}>
                {currentUserHash.substring(0, 10)}...
              </span>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-bg-surface border border-border-color text-text-base text-sm rounded-lg focus:ring-2 focus:ring-primary outline-none block p-2 cursor-pointer"
            >
              <option value="default">Sáng</option>
              <option value="dark">Tối</option>
              <option value="tet">Tết</option>
              <option value="midautumn">Trung Thu</option>
            </select>
            <button 
              onClick={handleLogout}
              className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 bg-bg-surface border-b border-border-color sticky top-16 z-40">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Tìm chiến dịch, mã hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-border-color rounded-xl bg-bg-base text-text-base text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'create' && <CreateBlock addBlock={addBlock} currentUserHash={currentUserHash} />}
            {activeTab === 'campaigns' && <Campaigns blocks={filteredBlocks} addBlock={addBlock} updateBlock={updateBlock} currentUserHash={currentUserHash} />}
            {activeTab === 'delivery' && <Delivery blocks={filteredBlocks} updateBlock={updateBlock} currentUserHash={currentUserHash} />}
            {activeTab === 'settings' && <Settings theme={theme} setTheme={setTheme} isConnected={isConnected} currentUserHash={currentUserHash} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border-color flex justify-around p-3 z-50 pb-safe">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-text-muted'
            }`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-primary/20' : ''}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
