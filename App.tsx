
import React, { useState, useEffect } from 'react';
import { Role, SessionConfig, OrderDetail } from './types';
import { Icons as IconComponents } from './constants';
import HostSetup from './components/HostSetup';
import HostDashboard from './components/HostDashboard';
import ParticipantOrder from './components/ParticipantOrder';
import ParticipantSummary from './components/ParticipantSummary';

const STORAGE_KEY = 'teatime_app_state';

const initialConfig: SessionConfig = {
  drinkShopName: '',
  drinkItems: [],
  snackShopName: '',
  snackItems: [],
  departmentMembers: [],
  isActive: false,
};

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.HOST); // 預設為團主，方便開始設定
  const [config, setConfig] = useState<SessionConfig>(initialConfig);
  const [orders, setOrders] = useState<OrderDetail[]>([]);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.orders) setOrders(parsed.orders);
        // 如果已經有進行中的團購，預設跳轉到跟團者模式，或是保持目前的 Role
        if (parsed.config?.isActive) {
          // 可以在這裡決定是否自動切換角色
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, orders }));
  }, [config, orders]);

  const handleCreateSession = (newConfig: SessionConfig) => {
    setConfig(newConfig);
    setOrders([]); // Clear previous orders
    setRole(Role.PARTICIPANT); // 建立成功後自動切換到跟團者模式方便預覽
  };

  const handleSubmitOrder = (order: OrderDetail) => {
    setOrders(prev => {
      const filtered = prev.filter(o => o.userName !== order.userName);
      return [...filtered, order];
    });
  };

  const handleReset = () => {
    if (confirm('確定要結束並清除目前的開團嗎？這將會刪除所有訂單數據。')) {
      setConfig(initialConfig);
      setOrders([]);
      setRole(Role.HOST);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <IconComponents.Coffee />
            </div>
            <h1 className="text-xl font-bold text-gray-800">TeaTime</h1>
          </div>
          
          {/* Role Switcher - 永久顯示，讓使用者可以隨時切換角色 */}
          <nav className="flex bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setRole(Role.HOST)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === Role.HOST ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              團主模式
            </button>
            <button
              onClick={() => setRole(Role.PARTICIPANT)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === Role.PARTICIPANT ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              跟團者模式
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {role === Role.HOST ? (
          !config.isActive ? (
            <HostSetup onCreate={handleCreateSession} />
          ) : (
            <HostDashboard config={config} orders={orders} onReset={handleReset} />
          )
        ) : (
          !config.isActive ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center p-6 bg-orange-50 rounded-full mb-6 text-orange-500">
                <IconComponents.Alert />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">目前沒有開團喔！</h2>
              <p className="text-gray-500">請切換至「團主模式」開啟本週的下午茶訂購。</p>
              <button 
                onClick={() => setRole(Role.HOST)}
                className="mt-6 text-orange-600 font-bold hover:underline"
              >
                前往開團 &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
               <ParticipantOrder 
                  config={config} 
                  orders={orders} 
                  onSubmit={handleSubmitOrder} 
               />
               <ParticipantSummary orders={orders} config={config} />
            </div>
          )
        )}
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-400 text-sm">
          TeaTime Afternoon Tea Ordering Tool &copy; {new Date().getFullYear()}
          <div className="mt-1 text-[10px] opacity-50">隨時切換上方標籤以管理或參與團購</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
