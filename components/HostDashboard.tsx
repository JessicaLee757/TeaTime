
import React, { useState } from 'react';
import { SessionConfig, OrderDetail, DrinkItem, SnackItem } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: OrderDetail[];
  onReset: () => void;
}

const HostDashboard: React.FC<Props> = ({ config, orders, onReset }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Calculations
  const hasDrinks = config.drinkShopName && config.drinkItems.length > 0;
  const hasSnacks = config.snackShopName && config.snackItems.length > 0;

  const drinkStats = config.drinkItems.map(item => ({
    ...item,
    count: orders.filter(o => o.drinkId === item.id).length,
  })).filter(s => s.count > 0);

  const snackStats = config.snackItems.map(item => ({
    ...item,
    count: orders.filter(o => o.snackId === item.id).length,
  })).filter(s => s.count > 0);

  const totalDrinkCost = drinkStats.reduce((acc, curr) => acc + (curr.price * curr.count), 0);
  const totalSnackCost = snackStats.reduce((acc, curr) => acc + (curr.price * curr.count), 0);

  const orderedNames = new Set(orders.map(o => o.userName));
  const missingMembers = config.departmentMembers.filter(m => !orderedNames.has(m));

  // Copy Link Logic
  const handleCopyLink = () => {
    // Generate clean link (without admin params)
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    url.searchParams.delete('mode');
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // CSV Export Logic
  const handleExportCSV = () => {
    let csvContent = "";
    
    csvContent += "=== 統計總覽 ===\n";
    if (hasDrinks) {
      csvContent += `飲料店家: ${config.drinkShopName}\n`;
      csvContent += "品項,客製化,數量,單價,小計\n";
      drinkStats.forEach(s => {
        csvContent += `${s.name},${s.sugarIceConfig},${s.count},${s.price},${s.price * s.count}\n`;
      });
      csvContent += `飲料總計,,, ,${totalDrinkCost}\n\n`;
    }

    if (hasSnacks) {
      csvContent += `點心店家: ${config.snackShopName}\n`;
      csvContent += "品項, ,數量,單價,小計\n";
      snackStats.forEach(s => {
        csvContent += `${s.name}, ,${s.count},${s.price},${s.price * s.count}\n`;
      });
      csvContent += `點心總計,,, ,${totalSnackCost}\n\n`;
    }

    csvContent += `全團總金額,,, ,${totalDrinkCost + totalSnackCost}\n\n`;

    csvContent += "=== 訂餐明細 ===\n";
    csvContent += "姓名,飲料品項,客製化需求,點心品項,金額\n";
    orders.forEach(o => {
      const d = config.drinkItems.find(i => i.id === o.drinkId);
      const s = config.snackItems.find(i => i.id === o.snackId);
      const price = (d?.price || 0) + (s?.price || 0);
      csvContent += `${o.userName},${d?.name || "-"},${d?.sugarIceConfig || "-"},${s?.name || "-"},${price}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TeaTime_Order_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">後台管理</h2>
          <p className="text-sm text-gray-500">當前統計數據</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyLink}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
              copySuccess ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            <span className="mr-2">{copySuccess ? <Icons.Check /> : <Icons.Users />}</span>
            {copySuccess ? '連結已複製！' : '複製跟團連結'}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
          >
            <span className="mr-2"><Icons.Download /></span>
            匯出 CSV
          </button>
          <button
            onClick={onReset}
            className="flex-1 sm:flex-none text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-4 py-2 rounded-lg"
          >
            結束並清除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Summary for Drinks */}
        {hasDrinks && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center text-blue-600">
              <span className="mr-2"><Icons.Coffee /></span> 飲料統計 ({config.drinkShopName})
            </h3>
            <div className="space-y-3">
              {drinkStats.length === 0 ? <p className="text-gray-400 text-sm">暫無人點餐</p> : drinkStats.map(s => (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-[10px] text-gray-400">{s.sugarIceConfig}</span>
                  </div>
                  <span className="text-blue-600 font-bold">x {s.count} <span className="text-gray-400 font-normal text-xs ml-2">(${s.price * s.count})</span></span>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between font-bold text-lg">
                <span>飲料總金額</span>
                <span className="text-blue-700">${totalDrinkCost}</span>
              </div>
            </div>
          </div>
        )}

        {/* Total Summary for Snacks */}
        {hasSnacks && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center text-pink-600">
              <span className="mr-2"><Icons.Cake /></span> 點心統計 ({config.snackShopName})
            </h3>
            <div className="space-y-3">
              {snackStats.length === 0 ? <p className="text-gray-400 text-sm">暫無人點餐</p> : snackStats.map(s => (
                <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-pink-600 font-bold">x {s.count} <span className="text-gray-400 font-normal text-xs ml-2">(${s.price * s.count})</span></span>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t border-gray-200 flex justify-between font-bold text-lg">
                <span>點心總金額</span>
                <span className="text-pink-700">${totalSnackCost}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Lists */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2"><Icons.Users /></span> 訂餐明細
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50 rounded-lg">
                <tr>
                  <th className="px-4 py-2">姓名</th>
                  {hasDrinks && <th className="px-4 py-2">飲料</th>}
                  {hasDrinks && <th className="px-4 py-2">客製化 (預設)</th>}
                  {hasSnacks && <th className="px-4 py-2">點心</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o, idx) => {
                  const drinkInfo = config.drinkItems.find(i => i.id === o.drinkId);
                  return (
                    <tr key={idx} className="text-sm">
                      <td className="px-4 py-3 font-medium text-gray-900">{o.userName}</td>
                      {hasDrinks && (
                        <td className="px-4 py-3 text-blue-600 font-medium">
                          {drinkInfo?.name || '-'}
                        </td>
                      )}
                      {hasDrinks && (
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {drinkInfo?.sugarIceConfig || '-'}
                        </td>
                      )}
                      {hasSnacks && (
                        <td className="px-4 py-3 text-pink-600">
                          {config.snackItems.find(i => i.id === o.snackId)?.name || '-'}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={1 + (hasDrinks ? 2 : 0) + (hasSnacks ? 1 : 0)} className="px-4 py-8 text-center text-gray-400">目前尚無人點餐</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center text-orange-600">
            <span className="mr-2"><Icons.Alert /></span> 尚未點餐 ({missingMembers.length})
          </h3>
          <ul className="space-y-2">
            {missingMembers.map(m => (
              <li key={m} className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                {m}
              </li>
            ))}
            {missingMembers.length === 0 && (
              <li className="text-green-600 text-sm flex items-center">
                <Icons.Check /> <span className="ml-2">全員已點餐！</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
