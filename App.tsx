import React, { useState, useEffect } from 'react';
import { Role, SessionConfig, OrderDetail } from './types';
// 使用你原本專案就有的 Icons 工具，避免安裝外部套件失敗的問題
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

  // 一鍵重整功能：當畫面當掉或需要手動更新時使用
  const handleReset = () => {
    if (window.confirm("確定要重整頁面並重新載入資料嗎？")) {
      window.location.reload();
    }
  };

  // 1. 初始化：從 Supabase 抓取進行中的團購資料
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'participant') {
      setRole(Role.PARTICIPANT);
    }

    const loadActiveSession = async () => {
      try {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('is_active', true)
          .order('id', { ascending: false })
          .maybeSingle(); // 抓取最新一筆活動中的團購

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
        console.error("載入團購失敗", err);
      }
    };
    loadActiveSession();
  }, []);

  // 2. 定期載入訂單列表
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

  // 3. 團購主發起團購：存入 Supabase 雲端
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
      alert('雲端開團成功！同事現在看得到了。');
    } catch (err: any) {
      alert('開團失敗：' + err.message);
    }
  };

  // 4. 處理點餐送出
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
            <div className="bg-orange-500 p-2 rounded-lg shadow-sm text-white">
              <IconComponents.Coffee size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">TeaTime</h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
              title="重啟程式"
            >
              <IconComponents.Users size={20} />
            </button>

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
          </div>
        </header>

        <main>
          {role === Role.HOST ? (
            <div className="animate-in fade-in duration-500">
              {!config.isActive ? (
                <HostSetup onSave={handleStartSession} />
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
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <IconComponents.Coffee size={40} className="text-gray-300" />
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