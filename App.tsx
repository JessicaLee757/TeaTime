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
    drinkShopName: '', drinkItems: [], snackShopName: '', snackItems: [],
    departmentMembers: [], isActive: false,
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
        const { data } = await supabase.from('sessions').select('*').eq('is_active', true).maybeSingle();
        if (data) {
          setConfig({
            drinkShopName: data.shop_name,
            drinkItems: data.drink_menu_data || [],
            snackShopName: data.snack_shop_name,
            snackItems: data.snack_menu_data || [],
            departmentMembers: data.members || [],
            isActive: true,
          });
        }
      } catch (err) { console.error("載入失敗:", err); }
    };
    loadActiveSession();
  }, [isParticipantLink]);

  // 2. 載入訂單 (對應後台顯示用的欄位)
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase.from('orders').select('*');
      if (data) {
        setOrders(data.map((o: any) => ({
          userName: o.member_name,
          memberName: o.member_name,
          itemName: o.item_name,
          price: o.price,
          notes: o.notes
        })));
      }
    };
    fetchOrders();
  }, []);

  // 3. 處理團購主發起團購
  const handleStartSession = async (newConfig: SessionConfig) => {
    try {
      const { error } = await supabase.from('sessions').insert([{
        shop_name: newConfig.drinkShopName,
        snack_shop_name: newConfig.snackShopName,
        drink_menu_data: newConfig.drinkItems,
        snack_menu_data: newConfig.snackItems,
        members: newConfig.departmentMembers,
        is_active: true
      }]);
      if (error) throw error;
      setConfig({ ...newConfig, isActive: true });
      alert('分類開團成功！');
    } catch (err: any) { alert('開團失敗：' + err.message); }
  };

  // 4. 結束團購
  const handleEndSession = async () => {
    if (!window.confirm("確定要結束本次團購嗎？這會清除點餐紀錄。")) return;
    try {
      await supabase.from('sessions').update({ is_active: false }).eq('is_active', true);
      await supabase.from('orders').delete().neq('id', '0'); 
      window.location.reload();
    } catch (err: any) { alert('清除失敗：' + err.message); }
  };

  // 5. 處理參加者點餐 (修正：動態抓取 bigint 型別的 ID)
  const handleOrderSubmit = async (newOrder: any) => {
    try {
      const { data: sessionData } = await supabase.from('sessions').select('id').eq('is_active', true).maybeSingle();
      if (!sessionData) throw new Error("找不到活動中的團購");

      const { error } = await supabase.from('orders').insert([{
        member_name: newOrder.memberName,
        item_name: newOrder.itemName,
        price: Number(newOrder.price),
        notes: newOrder.notes || '',
        session_id: sessionData.id // 傳入真實 ID
      }]);
      if (error) throw error;
      alert('點餐成功！');
      window.location.reload(); 
    } catch (err: any) { alert('送出失敗：' + err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <IconComponents.Coffee size={24} className="text-orange-600" />
            <h1 className="text-xl font-bold text-orange-600">TeaTime</h1>
          </div>
          {!isParticipantLink && (
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="border rounded-full px-3 py-1 bg-white shadow-sm">
              <option value={Role.HOST}>團購主模式</option>
              <option value={Role.PARTICIPANT}>參加者模式</option>
            </select>
          )}
        </header>

        <main>
          {role === Role.HOST ? (
            !config.isActive ? <HostSetup onCreate={handleStartSession} /> : (
              <div className="space-y-8">
                <HostDashboard orders={orders} config={config} onEndSession={handleEndSession} />
                <ParticipantSummary orders={orders} members={config.departmentMembers} />
              </div>
            )
          ) : (
            !config.isActive ? <div className="text-center p-20 bg-white rounded-2xl border">還沒開始團購喔！</div> : (
              <ParticipantOrder config={config} orders={orders} onSubmit={handleOrderSubmit} />
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default App;