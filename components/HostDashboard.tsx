import React, { useState } from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: OrderDetail[];
  onEndSession: () => void; // 修正參數名稱
}

const HostDashboard: React.FC<Props> = ({ config, orders, onEndSession }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const hasDrinks = config.drinkShopName && config.drinkItems.length > 0;
  const drinkStats = config.drinkItems.map(item => ({ ...item, count: orders.filter(o => o.drinkId === item.id).length })).filter(s => s.count > 0);
  const totalDrinkCost = drinkStats.reduce((acc, curr) => acc + (curr.price * curr.count), 0);
  const orderedNames = new Set(orders.map(o => o.userName));
  const missingMembers = config.departmentMembers.filter(m => !orderedNames.has(m));

  const handleCopyLink = () => {
    const url = new URL(window.location.origin);
    url.searchParams.set('mode', 'participant');
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">後台管理</h2>
          <p className="text-sm text-gray-500">當前統計數據</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button onClick={handleCopyLink} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${copySuccess ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
            <span className="mr-2">{copySuccess ? <Icons.Check /> : <Icons.Users />}</span>
            {copySuccess ? '連結已複製！' : '複製跟團連結'}
          </button>
          <button onClick={onEndSession} className="flex-1 sm:flex-none text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-4 py-2 rounded-lg transition-colors">
            結束並清除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasDrinks && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center text-blue-600"><span className="mr-2"><Icons.Coffee /></span> 飲料統計 ({config.drinkShopName})</h3>
            <div className="space-y-3">
              {drinkStats.map(s => (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex flex-col"><span className="font-medium">{s.name}</span><span className="text-[10px] text-gray-400">{s.sugarIceConfig}</span></div>
                  <span className="text-blue-600 font-bold">x {s.count} <span className="text-gray-400 font-normal text-xs ml-2">(${s.price * s.count})</span></span>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between font-bold text-lg"><span>總金額</span><span className="text-blue-700">${totalDrinkCost}</span></div>
            </div>
          </div>
        )}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center text-orange-600"><span className="mr-2"><Icons.Alert /></span> 尚未點餐 ({missingMembers.length})</h3>
          <ul className="space-y-2">
            {missingMembers.map(m => (
              <li key={m} className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>{m}
              </li>
            ))}
            {missingMembers.length === 0 && <li className="text-green-600 text-sm flex items-center"><Icons.Check /> <span className="ml-2">全員已點餐！</span></li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;