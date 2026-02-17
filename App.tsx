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

  // 1. 載入活動中的團購設定 (對應新欄位)
  useEffect(() => {
    if (isParticipantLink) setRole(Role.PARTICIPANT);
    const loadActiveSession = async () => {
      try {
        const { data } = await supabase.from('sessions').select('*').eq('is_active', true).maybeSingle();
        if (data) {
          setConfig({
            drinkShopName: data.shop_name || '飲料店',
            drinkItems: data.drink_menu_data || [], // 對應新欄位
            snackShopName: data.snack_shop_name || '點心店',
            snackItems: data.snack_menu_data || [], // 對應新欄位
            departmentMembers: data.members || [],
            isActive: true,
          });
        }
      } catch (err) { console.error(err); }
    };
    loadActiveSession();
  }, [isParticipantLink]);

  // 2. 載入點餐訂單
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

  // 3. 處理團購主發起團購 (寫入分開的欄位)
  const handleStartSession = async (newConfig: SessionConfig) => {
    try {
      const { error } = await supabase.from('sessions').insert([{
        shop_name: newConfig.drinkShopName,
        snack_shop_name: newConfig.snackShopName,
        drink_menu_data: newConfig.drinkItems, // 飲料專用
        snack_menu_data: newConfig.snackItems,  // 點心專用
        members: newConfig.departmentMembers,
        is_active: true
      }]);
      if (error) throw error;
      setConfig({ ...newConfig, isActive: true });
      alert('雲端分類開團成功！');
    } catch (err: any) { alert(err.message); }
  };

  const handleEndSession = async () => {
    if (!window.confirm("確定要結束嗎？")) return;
    await supabase.from('sessions').update({ is_active: false }).eq('is_active', true);
    await supabase.from('orders').delete().neq('id', '0');
    window.location.reload();
  };

  const handleOrderSubmit = async (newOrder: any) => {
    try {
      const { data: sessionData } = await supabase.from('sessions').select('id').eq('is_active', true).maybeSingle();
      const { error } = await supabase.from('orders').insert([{
        member_name: newOrder.memberName,
        item_name: newOrder.itemName,
        price: Number(newOrder.price),
        notes: newOrder.notes,
        session_id: sessionData?.id
      }]);
      if (error) throw error;
      alert('點餐成功！');
      window.location.reload(); 
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-orange-600">TeaTime</h1>
        {!isParticipantLink && (
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="border rounded-full px-3 py-1">
            <option value={Role.HOST}>團購主模式</option>
            <option value={Role.PARTICIPANT}>參加者模式</option>
          </select>
        )}
      </header>
      <main className="max-w-4xl mx-auto">
        {role === Role.HOST ? (
          !config.isActive ? <HostSetup onCreate={handleStartSession} /> : 
          <><HostDashboard orders={orders} config={config} onEndSession={handleEndSession} /><ParticipantSummary orders={orders} members={config.departmentMembers} /></>
        ) : (
          !config.isActive ? <div className="text-center p-20">尚未開團</div> : 
          <ParticipantOrder config={config} orders={orders} onSubmit={handleOrderSubmit} />
        )}
      </main>
    </div>
  );
};

export default App;