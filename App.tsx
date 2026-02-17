import React, { useState, useEffect } from 'react';
import { Role, SessionConfig, OrderDetail } from './types';
import { Icons as IconComponents } from './constants'; 
import { supabase } from './supabaseClient';
import HostSetup from './components/HostSetup';
import HostDashboard from './components/HostDashboard';
import ParticipantOrder from './components/ParticipantOrder';
import ParticipantSummary from './components/ParticipantSummary';

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

  const isParticipantLink = new URLSearchParams(window.location.search).get('mode') === 'participant';

  const handleReset = () => {
    if (window.confirm("確定要重整頁面並重新載入資料嗎？")) window.location.reload();
  };

  // 1. 初始化：載入進行中的團購資料
  useEffect(() => {
    if (isParticipantLink) setRole(Role.PARTICIPANT);

    const loadActiveSession = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: false })
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // 💡 關鍵修正：給予預設值，防止渲染時 undefined 導致白畫面
          setConfig({
            drinkShopName: data.shop_name || '未命名店家',
            drinkItems: data.menu_data || [],
            snackShopName: '',
            snackItems: [],
            // 如果你的 sessions 表沒存名單，這裡先給個預設名單防止報錯
            departmentMembers: data.members || ['請團購主重新設定名單'], 
            isActive: true,
          });
        }
      } catch (err) {
        console.error("雲端資料讀取失敗:", err);
      }
    };
    loadActiveSession();
  }, [isParticipantLink]);

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

  // 3. 處理開始團購：存入 Supabase
  const handleStartSession = async (newConfig: SessionConfig) => {
    try {
      // 💡 這裡把成員名單也存進去，確保跟團者看得到
      const { error } = await supabase
        .from('sessions')
        .insert([{
          shop_name: newConfig.drinkShopName,
          menu_data: newConfig.drinkItems,
          members: newConfig.departmentMembers, // 確保你有在 Supabase 建立 members 欄位 (jsonb)
          is_active: true
        }]);

      if (error) throw error;
      setConfig({ ...newConfig, isActive: true });
      alert('雲端開團成功！');
    } catch (err: any) {
      alert('開團失敗：' + err.message);
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm("確定要結束本次團購嗎？")) return;
    try {
      await supabase.from('sessions').update({ is_active: false }).eq('is_active', true);
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      setConfig({ drinkShopName: '', drinkItems: [], snackShopName: '', snackItems: [], departmentMembers: [], isActive: false });
      setOrders([]);
      alert('已結束團購！');
    } catch (err: any) { alert('清除失敗：' + err.message); }
  };

  const handleOrderSubmit = async (newOrder: any) => {
    try {
      const { error } = await supabase.from('orders').insert([{
        member_name: newOrder.memberName,
        item_name: newOrder.itemName,
        price: newOrder.price,
        notes: newOrder.notes,
      }]);
      if (error) throw error;
      alert('點餐成功！');
      window.location.reload();
    } catch (err: any) { alert('送出失敗：' + err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <IconComponents.Coffee size={24} />
            </div>
            <h1 className="text-xl font-bold text-orange-600">TeaTime</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="p-2 text-gray-400 hover:text-orange-500">
              <IconComponents.Users size={20} />
            </button>
            {!isParticipantLink && (
              <div className="flex items-center gap-3 bg-white border px-3 py-1.5 rounded-full shadow-sm ml-2">
                <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer">
                  <option value={Role.HOST}>團購主模式</option>
                  <option value={Role.PARTICIPANT}>參加者模式</option>
                </select>
              </div>
            )}
          </div>
        </header>

        <main>
          {role === Role.HOST ? (
            <div>
              {!config.isActive ? (
                <HostSetup onCreate={handleStartSession} />
              ) : (
                <div className="space-y-8">
                  <HostDashboard orders={orders} config={config} onEndSession={handleEndSession} />
                  <ParticipantSummary orders={orders} members={config.departmentMembers} />
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* 💡 跟團者防白畫面邏輯 */}
              {!config.isActive || config.drinkItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border text-center">
                  <IconComponents.Coffee size={40} className="text-gray-300 mb-4" />
                  <h2 className="text-lg font-medium text-gray-800">暫無進行中的團購</h2>
                  <p className="text-gray-400 text-sm mt-1">或是菜單資料正在載入中...</p>
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