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

  // 1. 自動偵測網址參數與載入雲端菜單
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'participant') setRole(Role.PARTICIPANT);

    const loadActiveSession = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setConfig({
          drinkShopName: data.shop_name,
          drinkItems: data.menu_data,
          snackShopName: '', // 暫時合併處理
          snackItems: [],
          departmentMembers: [],
          isActive: true,
        });
      }
    };
    loadActiveSession();
  }, []);

  // 2. 抓取訂單資料
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

  // 3. 團購主點擊「開始團購」的處理邏輯
  const handleStartSession = async (newConfig: any) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .insert([{
          shop_name: newConfig.drinkShopName,
          menu_data: newConfig.drinkItems,
          is_active: true
        }]);

      if (error) throw error;

      setConfig({ ...newConfig, isActive: true });
      alert('雲端開團成功！同事現在可以看到菜單了。');
    } catch (err: any) {
      console.error(err);
      alert('開團失敗，請檢查 Supabase 欄位是否正確：' + err.message);
    }
  };

  const handleOrderSubmit = async (newOrder: any) => {
    const { error } = await supabase.from('orders').insert([{
      member_name: newOrder.memberName,
      item_name: newOrder.itemName,
      price: newOrder.price,
      notes: newOrder.notes,
    }]);
    if (error) alert('送出失敗'); else alert('點餐成功！');
  };

  const isLocked = new URLSearchParams(window.location.search).get('mode') === 'participant';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">下午茶團購統計器</h1>
          {!isLocked && (
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="border p-2 rounded shadow-sm">
              <option value={Role.HOST}>團購主 (Host)</option>
              <option value={Role.PARTICIPANT}>參加者 (Participant)</option>
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