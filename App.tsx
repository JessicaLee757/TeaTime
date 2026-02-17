import React, { useState, useEffect } from 'react';
import { Role, SessionConfig, OrderDetail } from './types';
import { Icons as IconComponents } from './constants';
import { supabase } from './supabaseClient';
import HostSetup from './components/HostSetup';
import HostDashboard from './components/HostDashboard';
import ParticipantOrder from './components/ParticipantOrder';
import ParticipantsSummary from './components/ParticipantSummary';

const App: React.FC = () => {
  // 1. 初始化狀態
  const [role, setRole] = useState<Role>(Role.HOST);
  const [config, setConfig] = useState<SessionConfig>({
    drinkShopName: '', drinkItems: [], snackShopName: '', snackItems: [],
    departmentMembers: [], isActive: false,
  });
  const [orders, setOrders] = useState<OrderDetail[]>([]);

  // 2. 偵測網址參數 (放在 useEffect 裡比較保險)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'participant') {
      setRole(Role.PARTICIPANT);
    }
  }, []);

  // 3. 抓取資料庫訂單
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*');
      if (data) {
        setOrders(data.map((o: any) => ({
          ...o,
          memberName: o.member_name,
          itemName: o.item_name
        })));
      }
    };
    fetchOrders();
  }, []);

  const handleOrderSubmit = async (newOrder: any) => {
    const { error } = await supabase.from('orders').insert([{
      member_name: newOrder.memberName,
      item_name: newOrder.itemName,
      price: newOrder.price,
      notes: newOrder.notes,
    }]);
    if (error) alert('送出失敗'); else alert('送出成功！');
  };

  const isLocked = new URLSearchParams(window.location.search).get('mode') === 'participant';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">下午茶團購統計器</h1>
          {/* 只有在非鎖定狀態下才顯示選單 */}
          {!isLocked && (
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value={Role.HOST}>團購主</option>
              <option value={Role.PARTICIPANT}>參加者</option>
            </select>
          )}
        </header>

        {role === Role.HOST ? (
          <div className="space-y-6">
            {!config.isActive ? (
              <HostSetup onSave={(newConfig) => setConfig({ ...newConfig, isActive: true })} />
            ) : (
              <>
                <HostDashboard orders={orders} config={config} />
                <ParticipantsSummary orders={orders} members={config.departmentMembers} />
              </>
            )}
          </div>
        ) : (
          <ParticipantOrder config={config} onSubmit={handleOrderSubmit} />
        )}
      </div>
    </div>
  );
};

export default App;