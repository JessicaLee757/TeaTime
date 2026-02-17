import React from 'react';
import { SessionConfig } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onEndSession: () => void;
}

const HostDashboard: React.FC<Props> = ({ config, orders, onEndSession }) => {
  const drinkNames = new Set(config.drinkItems?.map(i => i.name) || []);
  const snackNames = new Set(config.snackItems?.map(i => i.name) || []);

  const drinkStats = (orders || []).filter(o => drinkNames.has(o.itemName)).reduce((acc: any, curr: any) => {
    if (!acc[curr.itemName]) acc[curr.itemName] = { count: 0, total: 0 };
    acc[curr.itemName].count += 1;
    acc[curr.itemName].total += (Number(curr.price) || 0);
    return acc;
  }, {});

  const snackStats = (orders || []).filter(o => snackNames.has(o.itemName)).reduce((acc: any, curr: any) => {
    if (!acc[curr.itemName]) acc[curr.itemName] = { count: 0, total: 0 };
    acc[curr.itemName].count += 1;
    acc[curr.itemName].total += (Number(curr.price) || 0);
    return acc;
  }, {});

  const drinkTotal = Object.values(drinkStats).reduce<number>((acc, curr: any) => acc + (curr.total || 0), 0);
  const snackTotal = Object.values(snackStats).reduce<number>((acc, curr: any) => acc + (curr.total || 0), 0);

  const orderedNames = new Set(orders.map(o => o.userName || o.memberName));
  const missingMembers = (config.departmentMembers || []).filter(m => !orderedNames.has(m));

  const copyLink = () => {
    const link = `https://tea-time-u72l.vercel.app/?mode=participant`;
    navigator.clipboard.writeText(link);
    alert('跟團連結已複製！');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">團購後台管理</h2>
        <div className="flex gap-2">
          <button onClick={copyLink} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-bold text-sm transition-colors">複製跟團連結</button>
          <button onClick={onEndSession} className="text-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">結束團購</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2"><Icons.Coffee /> 飲料：{config.drinkShopName}</h3>
          {Object.keys(drinkStats).map(name => (
            <div key={name} className="flex justify-between text-sm border-b pb-1 mb-1">
              <span>{name}</span>
              <span className="font-bold">x {drinkStats[name].count} (${drinkStats[name].total})</span>
            </div>
          ))}
          <div className="pt-2 font-bold text-blue-700 flex justify-between"><span>小計</span><span>${drinkTotal}</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <h3 className="font-bold text-pink-600 mb-4 flex items-center gap-2"><Icons.Check /> 點心：{config.snackShopName}</h3>
          {Object.keys(snackStats).map(name => (
            <div key={name} className="flex justify-between text-sm border-b pb-1 mb-1">
              <span>{name}</span>
              <span className="font-bold">x {snackStats[name].count} (${snackStats[name].total})</span>
            </div>
          ))}
          <div className="pt-2 font-bold text-pink-700 flex justify-between"><span>小計</span><span>${snackTotal}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border-2 border-orange-500 flex justify-between items-center shadow-lg">
          <h3 className="text-2xl font-black text-gray-800">全團總計</h3>
          <span className="text-4xl font-black text-orange-600">${drinkTotal + snackTotal}</span>
        </div>
        
        {/* 💡 需求 1：改為淺橘底 */}
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm">
          <h3 className="text-xs font-bold text-orange-800 mb-3 uppercase tracking-widest opacity-70">尚未點餐 ({missingMembers.length})</h3>
          <div className="flex flex-wrap gap-2">
            {missingMembers.length > 0 ? (
              missingMembers.map(m => (
                <span key={m} className="px-2 py-1 bg-white text-orange-700 rounded-md text-xs font-medium border border-orange-200">{m}</span>
              ))
            ) : (
              <span className="text-green-600 font-bold text-sm flex items-center gap-1">✨ 全員已點餐！</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;