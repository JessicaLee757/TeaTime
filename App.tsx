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
    if (window.confirm("確定要重整頁面嗎？")) window.location.reload();
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
          setConfig({
            drinkShopName: data.shop_name || '未命名店家',
            drinkItems: data.menu_data || [],
            snackShopName: '',
            snackItems: [],
            // 讀取你在 sessions 表中補齊的 members 欄位
            departmentMembers: data.members || [], 
            isActive: true,
          });
        }
      } catch (err) {
        console.error("載入失敗:", err);
      }
    };
    loadActiveSession();
  }, [isParticipantLink]);

  // 2. 載入訂單 (確保欄位對應正確)
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*');
      if (data) {
        setOrders(data.map((o: any) => ({
          ...o,
          memberName: o.member_name, // 將資料庫的下底線轉回前端用的駝峰式
          itemName: o.item_name
        })));
      }
    };
    fetchOrders();
  }, []);

  // 3. 處理團購主發起團購：存入 sessions 表
  const handleStartSession = async (newConfig: SessionConfig) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .insert([{
          shop_name: newConfig.drinkShopName,
          menu_data: newConfig.drinkItems,
          members: newConfig.departmentMembers, // 存入名單陣列
          is_active: true
        }]);

      if (error) throw error;
      setConfig({ ...newConfig, isActive: true });
      alert('雲端開團成功！');
    } catch (err: any) {
      alert('開團失敗：' + err.message);
    }
  };

  // 4. 處理結束團購：清除訂單與關閉 session
  const handleEndSession = async () => {
    if (!window.confirm("確定要結束本次團購嗎？這會清除所有點餐資料。")) return;
    try {
      await supabase.from('sessions').update({ is_active: false }).eq('is_active', true);
      // 清除 orders 表中的所有紀錄
      await supabase.from('orders').delete().neq('id', '0'); 
      
      setConfig({ drinkShopName: '', drinkItems: [], snackShopName: '', snackItems: [], departmentMembers: [], isActive: false });
      setOrders([]);
      alert('已結束團購！');
    } catch (err: any) { alert('清除失敗：' + err.message); }
  };

  // 5. 處理參加者點餐：寫入 orders 表
  const handleOrderSubmit = async (newOrder: any) => {
    try {
      const { error } = await supabase.from('orders').insert([{
        member_name: newOrder.memberName, // 這裡要對應 Supabase 的欄位名稱
        item_name: newOrder.itemName,     // 這裡要對應 Supabase 的欄位名稱
        price: newOrder.price,
        notes: newOrder.notes || '',
        session_id: 'active' // 標註這是當前團購的訂單
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
              {/* 加入防白畫面判斷：確保有資料才渲染點餐組件 */}
              {!config.isActive || config.drinkItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border text-center">
                  <IconComponents.Coffee size={40} className="text-gray-300 mb-4" />
                  <h2 className="text-lg font-medium text-gray-800">還沒開始團購喔！</h2>
                  <p className="text-gray-400 text-sm mt-1">請等待團購主發起，或嘗試重新整理。</p>
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