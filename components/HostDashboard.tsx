import React from 'react';
import { SessionConfig } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onEndSession: () => void;
}

const HostDashboard: React.FC<Props> = ({ config, orders, onEndSession }) => {
  // 建立名稱索引以進行分類
  const drinkNames = new Set(config.drinkItems?.map(i => i.name) || []);
  const snackNames = new Set(config.snackItems?.map(i => i.name) || []);

  // 1. 飲料統計邏輯
  const drinkStats = (orders || []).filter(o => drinkNames.has(o.itemName)).reduce((acc: any, curr: any) => {
    if (!acc[curr.itemName]) acc[curr.itemName] = { count: 0, total: 0 };
    acc[curr.itemName].count += 1;
    acc[curr.itemName].total += (Number(curr.price) || 0);
    return acc;
  }, {});

  // 2. 點心統計邏輯
  const snackStats = (orders || []).filter(o => snackNames.has(o.itemName)).reduce((acc: any, curr: any) => {
    if (!acc[curr.itemName]) acc[curr.itemName] = { count: 0, total: 0 };
    acc[curr.itemName].count += 1;
    acc[curr.itemName].total += (Number(curr.price) || 0);
    return acc;
  }, {});

  // 💡 修正 TypeScript 型別報錯
  const drinkTotal = Object.values(drinkStats).reduce<number>((acc, curr: any) => acc + (curr.total || 0), 0);
  const snackTotal = Object.values(snackStats).reduce<number>((acc, curr: any) => acc + (curr.total || 0), 0);
  
  const orderedNames = new Set(orders.map(o => o.userName || o.memberName));
  const missingMembers = (config.departmentMembers || []).filter(m => !orderedNames.has(m));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">後台管理</h2>
        <button onClick={onEndSession} className="text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">結束團購</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 飲料區塊 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-blue-600 flex items-center">
            <span className="mr-2"><Icons.Coffee /></span> 飲料：{config.drinkShopName}
          </h3>
          <div className="space-y-2">
            {Object.keys(drinkStats).map(name => (
              <div key={name} className="flex justify-between text-sm border-b pb-1">
                <span>{name}</span>
                <span className="font-bold">x {drinkStats[name].count} (${drinkStats[name].total})</span>
              </div>
            ))}
            <div className="pt-2 font-bold text-blue-700 flex justify-between">
              <span>飲料小計</span>
              <span>${drinkTotal}</span>
            </div>
          </div>
        </div>

        {/* 點心區塊 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <h3 className="text-lg font-bold mb-4 text-pink-600 flex items-center">
            <span className="mr-2"><Icons.Check /></span> 點心：{config.snackShopName}
          </h3>
          <div className="space-y-2">
            {Object.keys(snackStats).map(name => (
              <div key={name} className="flex justify-between text-sm border-b pb-1">
                <span>{name}</span>
                <span className="font-bold">x {snackStats[name].count} (${snackStats[name].total})</span>
              </div>
            ))}
            <div className="pt-2 font-bold text-pink-700 flex justify-between">
              <span>點心小計</span>
              <span>${snackTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 總結算 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-lg">全團總計</h3>
          <span className="text-3xl font-black text-orange-600">${drinkTotal + snackTotal}</span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
          <strong>尚未點餐 ({missingMembers.length})：</strong>
          <span className="text-gray-500">{missingMembers.join(', ') || '全體已點餐！'}</span>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;