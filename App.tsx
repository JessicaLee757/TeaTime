import React, { useState, useEffect } from 'react';
import { Role, SessionConfig, OrderDetail } from './types';
import { Icons as IconComponents } from './constants';
import { supabase } from './supabaseClient';
import HostSetup from './components/HostSetup';
import HostDashboard from './components/HostDashboard';
import ParticipantOrder from './components/ParticipantOrder';
import ParticipantsSummary from './components/ParticipantSummary';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.HOST);
  const [config, setConfig] = useState<SessionConfig>({
    drinkShopName: '', drinkItems: [], snackShopName: '', snackItems: [],
    departmentMembers: [], isActive: false,
  });
  const [orders, setOrders] = useState<OrderDetail[]>([]);

  // 1. 初始化：檢查網址參數並載入雲端菜單
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'participant') {
      setRole(Role.PARTICIPANT);
    }

    const loadMenu = async () => {
      try {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();
        
        if (data) {
          setConfig({
            drinkShopName: data.shop_name,
            drinkItems: data.menu_data || [],
            snackShopName: '', snackItems: [],
            departmentMembers: [], isActive: true,
          });
        }
      } catch (e) { console.error("載入菜單失敗", e); }
    };
    loadMenu();
  }, []);

  // 2. 載入訂單
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

  // 3. 處理開始團購
  const handleStartSession = async (newConfig: any) => {
    const { error } = await supabase.from('sessions').insert([{
      shop_name: newConfig.drinkShopName,
      menu_data: newConfig.drinkItems,
      is_active: true
    }]);

    if (error) {
      alert("開團失敗：" + error.message);
    } else {
      setConfig({ ...newConfig, isActive: true });
      alert("開團成功！");
    }
  };

  const handleOrderSubmit = async (newOrder: any) => {
    const { error } = await supabase.from('orders').insert([{
      member_name: newOrder.memberName,
      item_name: newOrder.itemName,
      price: newOrder.price,
      notes: newOrder.notes,
    }]);
    if (error) alert('點餐失敗'); else alert('點餐成功！');
  };

  const isLocked = new URLSearchParams(window.location.search).get('mode') === 'participant';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">下午茶團購統計器</h1>
          {!isLocked && (
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="border p-2 rounded">
              <option value={Role.HOST}>團購主</option>
              <option value={Role.PARTICIPANT}>參加者</option>
            </select>
          )}
        </header>

        {role === Role.HOST ? (
          <div className="space-y-6">
            {!config.isActive ? (
              <HostSetup onSave={handleStartSession} />
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