import React from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onEndSession: () => void;
}

const HostDashboard: React.FC<Props> = ({ config, orders, onEndSession }) => {
  // 💡 直接統計訂單內容
  const stats = orders.reduce((acc: any, curr: any) => {
    if (!acc[curr.itemName]) acc[curr.itemName] = { count: 0, price: curr.price, total: 0 };
    acc[curr.itemName].count += 1;
    acc[curr.itemName].total += curr.price;
    return acc;
  }, {});

  const grandTotal = Object.values(stats).reduce((acc: any, curr: any) => acc + curr.total, 0);
  const orderedNames = new Set(orders.map(o => o.userName));
  const missingMembers = config.departmentMembers.filter(m => !orderedNames.has(m));

  return (
    <div className="space-y-6 mb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
        <h2 className="text-xl font-bold">後台管理 ({config.drinkShopName})</h2>
        <button onClick={onEndSession} className="text-red-500 border border-red-200 px-4 py-2 rounded-lg">結束並清除</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-bold mb-4 text-blue-600 flex items-center">
            <span className="mr-2"><Icons.Coffee /></span> 品項統計
          </h3>
          <div className="space-y-3">
            {Object.keys(stats).map(name => (
              <div key={name} className="flex justify-between border-b pb-2">
                <span>{name}</span>
                <span className="font-bold">x {stats[name].count} (${stats[name].total})</span>
              </div>
            ))}
            <div className="pt-4 text-xl font-bold flex justify-between">
              <span>總金額</span>
              <span className="text-blue-600">${grandTotal}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="text-lg font-bold mb-4 text-orange-600 flex items-center">
            <span className="mr-2"><Icons.Alert /></span> 尚未點餐 ({missingMembers.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingMembers.map(m => (
              <span key={m} className="bg-orange-50 px-3 py-1 rounded-full text-sm text-orange-700">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;