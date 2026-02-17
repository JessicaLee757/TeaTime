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

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*');
    if (data) {
      setOrders(data.map((o: any) => ({
        id: o.id, // 💡 新增 ID 以便刪除
        userName: o.member_name,
        memberName: o.member_name,
        itemName: o.item_name,
        price: o.price,
        notes: o.notes
      })));
    }
  };

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
      } catch (err) { console.error(err); }
    };
    loadActiveSession();
    fetchOrders();
  }, [isParticipantLink]);

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
    } catch (err: any) { alert(err.message); }
  };

  const handleEndSession = async () => {
    if (!window.confirm("確定要結束嗎？")) return;
    await supabase.from('sessions').update({ is_active: false }).eq('is_active', true);
    await supabase.from('orders').delete().neq('id', '0');
    window.location.reload();
  };

  // 💡 團主刪除特定人訂單功能
  const handleDeleteOrder = async (memberName: string) => {
    if (!window.confirm(`確定要刪除 ${memberName} 的所有點餐紀錄嗎？`)) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('member_name', memberName);
      if (error) throw error;
      await fetchOrders(); // 💡 重新抓取資料，上方加總會自動更新
    } catch (err: any) { alert('刪除失敗：' + err.message); }
  };

  const handleOrderSubmit = async (newOrder: any) => {
    try {
      const { data: sessionData } = await supabase.from('sessions').select('id').eq('is_active', true).maybeSingle();
      await supabase.from('orders').insert([{
        member_name: newOrder.memberName,
        item_name: newOrder.itemName,
        price: Number(newOrder.price),
        notes: newOrder.notes,
        session_id: sessionData?.id
      }]);
      await fetchOrders();
    } catch (err: any) { throw err; }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold text-orange-600">TeaTime</h1>
          {!isParticipantLink && (
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="border rounded-full px-3 py-1 bg-white">
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
                {/* 💡 傳入刪除功能 */}
                <ParticipantSummary orders={orders} members={config.departmentMembers} onDelete={handleDeleteOrder} />
              </div>
            )
          ) : (
            !config.isActive ? <div className="text-center p-20 bg-white border">尚未開始團購</div> : (
              <ParticipantOrder config={config} orders={orders} onSubmit={handleOrderSubmit} />
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default App;