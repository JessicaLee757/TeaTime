import React, { useState, useEffect } from 'react';
import { Role, SessionConfig, OrderDetail } from './types';
import { Icons as IconComponents } from './constants';
import { supabase } from './supabaseClient';
import HostSetup from './components/HostSetup';
import HostDashboard from './components/HostDashboard';
import ParticipantOrder from './components/ParticipantOrder';
// 注意：請確認你的檔案名稱，若報錯請檢查是否有 s (ParticipantsSummary)
import ParticipantsSummary from './components/ParticipantSummary';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.HOST);
  const [config, setConfig] = useState<SessionConfig>({
    drinkShopName: '',
    drinkItems: [],
    snackShopName: '',
    snackItems: [],
    departmentMembers: [],
    isActive: false,
  });
  const [orders, setOrders] = useState<OrderDetail[]>([]);

  // 抓取 Supabase 訂單資料
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*');
      if (data) {
        const formatted: any[] = data.map((o: any) => ({
          ...o,
          memberName: o.member_name,
          itemName: o.item_name
        }));
        setOrders(formatted);
      }
    };
    fetchOrders();
  }, []);

  const handleOrderSubmit = async (newOrder: any) => {
    const { error } = await supabase
      .from('orders')
      .insert([
        {
          member_name: newOrder.memberName || newOrder.member_name,
          item_name: newOrder.itemName || newOrder.item_name,
          price: newOrder.price,
          notes: newOrder.notes,
        },
      ]);

    if (error) alert('失敗: ' + error.message);
    else alert('成功！');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* 頂部導航欄：保持簡潔 */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg shadow-sm">
              <IconComponents.Coffee className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">TeaTime</h1>
          </div>

          {/* 右上角質感知切換器 */}
          <div className="flex items-center gap-3 bg-white border px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mode</span>
            <div className="h-4 w-px bg-gray-200"></div>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value as Role)}
              className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={Role.HOST}>團購主模式</option>
              <option value={Role.PARTICIPANT}>參加者模式</option>
            </select>
          </div>
        </header>

        {/* 內容區域 */}
        <main>
          {role === Role.HOST ? (
            <div className="animate-in fade-in duration-500">
              {!config.isActive ? (
                <HostSetup onSave={(newConfig) => setConfig({ ...newConfig, isActive: true })} />
              ) : (
                <div className="space-y-8">
                  <HostDashboard orders={orders} config={config} />
                  <ParticipantsSummary orders={orders} members={config.departmentMembers} />
                </div>
              )}
            </div>
          ) : (
            /* 參加者模式：若未開團則顯示提示 */
            <div className="animate-in fade-in duration-500">
              {!config.isActive ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <IconComponents.Coffee className="w-12 h-12 text-gray-300" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-800">還沒開始團購喔！</h2>
                  <p className="text-gray-400 text-sm mt-1">請等待團購主發起本週下午茶</p>
                </div>
              ) : (
                <ParticipantOrder config={config} onSubmit={handleOrderSubmit} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;