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
    drinkShopName: '',
    drinkItems: [],
    snackShopName: '',
    snackItems: [],
    departmentMembers: [],
    isActive: false,
  });
  const [orders, setOrders] = useState<OrderDetail[]>([]);

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
    if (error) alert('失敗: ' + error.message);
    else alert('點餐成功！');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 頂部標題 */}
        <header className="flex flex-col items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <IconComponents.Coffee className="w-10 h-10 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-800">TeaTime 下午茶訂購器</h1>
          </div>

          {/* 恢復大按鈕切換 UI */}
          <div className="flex bg-white rounded-lg shadow-sm p-1 border">
            <button 
              onClick={() => setRole(Role.HOST)}
              className={`px-6 py-2 rounded-md font-medium transition ${role === Role.HOST ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              團購主模式
            </button>
            <button 
              onClick={() => setRole(Role.PARTICIPANT)}
              className={`px-6 py-2 rounded-md font-medium transition ${role === Role.PARTICIPANT ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              參加者模式
            </button>
          </div>
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