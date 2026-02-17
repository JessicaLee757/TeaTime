import React, { useState, useEffect } from 'react';
import { Role, SessionConfig, OrderDetail } from './types';
// 使用內建 Icons，確保不依賴安裝失敗的外部套件
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

  // 判斷是否為跟團連結
  const isParticipantLink = new URLSearchParams(window.location.search).get('mode') === 'participant';

  const handleReset = () => {
    if (window.confirm("確定要重整並重新載入資料嗎？")) {
      window.location.reload();
    }
  };

  // 1. 初始化：根據網址設定角色，並從雲端抓取資料
  useEffect(() => {
    if (isParticipantLink) {
      setRole(Role.PARTICIPANT);
    }

    const loadActiveSession = async () => {
      try {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: false })
          .maybeSingle();

        if (data) {
          setConfig({
            drinkShopName: data.shop_name,
            drinkItems: data.menu_data || [],
            snackShopName: '',
            snackItems: [],
            departmentMembers: [],
            isActive: true,
          });
        }
      } catch (err) {
        console.error("載入失敗", err);
      }
    };
    loadActiveSession();
  }, [isParticipantLink]);

  // 2. 抓取訂單清單
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

  // 3. 處理團購主開團
  const handleStartSession = async (newConfig: SessionConfig) => {
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
      alert('雲端開團成功！');
    } catch (err: any) {
      alert('開團失敗：' + err.message);
    }
  };

  // 4. 處理點餐
  const handleOrderSubmit = async (newOrder: any) => {
    try {
      const { error } = await supabase.from('orders').insert([{
        member_name: newOrder.memberName || newOrder.member_name,
        item_name: newOrder.itemName || newOrder.item_name,
        price: newOrder.price,
        notes: newOrder.notes,
      }]);
      if (error) throw error;
      alert('點餐成功！');
      window.location.reload();
    } catch (err: any) {
      alert('送出失敗：' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <IconComponents.Coffee size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight text-orange-600">TeaTime</h1>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="p-2 text-gray-400 hover:text-orange-500">
              <IconComponents.Users size={20} />
            </button>

            {/* 同事連結模式下隱藏選單 */}
            {!isParticipantLink && (
              <div className="flex items-center gap-3 bg-white border px-3 py-1.5 rounded-full shadow-sm ml-2">
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="text-sm font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value={Role.HOST}>團購主模式</option>
                  <option value={Role.PARTICIPANT}>參加者模式</option>
                </select>
              </div>
            )}
          </div>
        </header>

        <main>
          {role === Role.HOST ? (
            <div className="animate-in fade-in duration-500">
              {!config.isActive ? (
                /* 修正點：使用 onCreate */
                <HostSetup onCreate={handleStartSession} />
              ) : (
                <div className="space-y-8">
                  <HostDashboard orders={orders} config={config} />
                  <ParticipantSummary orders={orders} members={config.departmentMembers} />
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {!config.isActive ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border text-center">
                  <IconComponents.Coffee size={40} className="text-gray-300 mb-4" />
                  <h2 className="text-lg font-medium text-gray-800">還沒開始團購喔！</h2>
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