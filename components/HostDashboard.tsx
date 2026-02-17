import React from 'react';
import { SessionConfig } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onEndSession: () => void;
}

const HostDashboard: React.FC<Props> = ({ config, orders, onEndSession }) => {
  // 1. 建立分類名稱對照表 (確保 null 安全)
  const drinkNames = new Set(config.drinkItems?.map(i => i.name) || []);
  const snackNames = new Set(config.snackItems?.map(i => i.name) || []);

  // 2. 統計飲料邏輯
  const drinkStats = (orders || []).filter(o => drinkNames.has(o.itemName)).reduce((acc: any, curr: any) => {
    if (!acc[curr.itemName]) acc[curr.itemName] = { count: 0, total: 0 };
    acc[curr.itemName].count += 1;
    acc[curr.itemName].total += (Number(curr.price) || 0);
    return acc;
  }, {});

  // 3. 統計點心邏輯
  const snackStats = (orders || []).filter(o => snackNames.has(o.itemName)).reduce((acc: any, curr: any) => {
    if (!acc[curr.itemName]) acc[curr.itemName] = { count: 0, total: 0 };
    acc[curr.itemName].count += 1;
    acc[curr.itemName].total += (Number(curr.price) || 0);
    return acc;
  }, {});

  // 💡 修正型別錯誤：使用 <number> 泛型明確指定 reduce 的結果
  const drinkTotal = Object.values(drinkStats).reduce<number>(
    (acc, curr: any) => acc + (Number(curr.total) || 0), 
    0
  );

  const snackTotal = Object.values(snackStats).reduce<number>(
    (acc, curr: any) => acc + (Number(curr.total) || 0), 
    0
  );
  
  const orderedNames = new Set(orders.map(o => o.userName || o.memberName));
  const missingMembers = (config.departmentMembers || []).filter(m => !orderedNames.has(m));

  return (
    <div className="space-y-6 mb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">團購管理後台</h2>
          <p className="text-sm text-gray-500">當前統計明細</p>
        </div>
        <button 
          onClick={onEndSession} 
          className="text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          結束本次團購
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 飲料區塊 (藍色系) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <h3 className="text-lg font-bold mb-4 text-blue-600 flex items-center">
            <span className="mr-2"><Icons.Coffee /></span> 飲料統計 ({config.drinkShopName || '未設定'})
          </h3>
          <div className="space-y-2">
            {Object.keys(drinkStats).length === 0 ? (
              <p className="text-gray-400 text-sm italic">尚無飲料訂單</p>
            ) : (
              Object.keys(drinkStats).map(name => (
                <div key={name} className="flex justify-between text-sm border-b border-blue-50 pb-1">
                  <span>{name}</span>
                  <span className="font-bold">x {drinkStats[name].count} (${drinkStats[name].total})</span>
                </div>
              ))
            )}
            <div className="pt-3 font-bold text-blue-700 flex justify-between border-t border-blue-100 mt-2">
              <span>飲料小計</span>
              <span>${drinkTotal}</span>
            </div>
          </div>
        </div>

        {/* 點心區塊 (粉色系) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <h3 className="text-lg font-bold mb-4 text-pink-600 flex items-center">
            <span className="mr-2"><Icons.Check /></span> 點心統計 ({config.snackShopName || '未設定'})
          </h3>
          <div className="space-y-2">
            {Object.keys(snackStats).length === 0 ? (
              <p className="text-gray-400 text-sm italic">尚無點心訂單</p>
            ) : (
              Object.keys(snackStats).map(name => (
                <div key={name} className="flex justify-between text-sm border-b border-pink-50 pb-1">
                  <span>{name}</span>
                  <span className="font-bold">x {snackStats[name].count} (${snackStats[name].total})</span>
                </div>
              ))
            )}
            <div className="pt-3 font-bold text-pink-700 flex justify-between border-t border-pink-100 mt-2">
              <span>點心小計</span>
              <span>${snackTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 總結算區塊 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200 bg-gradient-to-r from-white to-orange-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-700 text-lg">全團總結算</h3>
            <p className="text-xs text-gray-400">包含飲料與點心總額</p>
          </div>
          {/* ✅ 這裡現在不會有紅線報錯了 */}
          <div className="text-3xl font-black text-orange-600">
            ${drinkTotal + snackTotal}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-bold text-gray-500">尚未點餐 ({missingMembers.length})：</span>
            {missingMembers.length === 0 ? (
              <span className="text-sm text-green-600 font-bold">全員已點餐完畢！</span>
            ) : (
              missingMembers.map(m => (
                <span key={m} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">{m}</span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;