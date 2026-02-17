import React from 'react';
import { Icons } from '../constants';

interface Props {
  orders: any[];
  members: string[];
  onDelete: (name: string) => void;
}

const ParticipantSummary: React.FC<Props> = ({ orders, onDelete }) => {
  const groupedOrders = orders.reduce((acc: any, order: any) => {
    const name = order.memberName;
    if (!acc[name]) acc[name] = { name, items: [] };
    acc[name].items.push({ itemName: order.itemName, notes: order.notes, price: order.price });
    return acc;
  }, {});

  const orderList = Object.values(groupedOrders);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-gray-100 p-2 rounded-lg text-gray-600"><Icons.Users /></div>
        <h2 className="text-xl font-bold text-gray-800">當週點餐一覽 ({orderList.length} 人)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderList.map((group: any) => (
          <div key={group.name} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 relative">
            {/* 💡 需求 2：刪除按鈕常駐 (移除 opacity-0) */}
            <button 
              onClick={() => onDelete(group.name)} 
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white hover:bg-red-600 transition-colors z-10"
              title="刪除此人點單"
            >
              <Icons.Alert size={14} />
            </button>

            <div className="font-bold text-gray-800 border-b pb-2 mb-3 flex justify-between items-center pr-4">
              <span>{group.name}</span>
            </div>

            <div className="space-y-2">
              {group.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-1">
                    {item.itemName.includes('不') ? (
                      <span className="text-gray-300 text-[10px]">❌</span>
                    ) : (
                      <span className="text-green-500 text-[10px]">✅</span>
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${item.itemName.includes('不') ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                      {item.itemName}
                    </div>
                    {item.notes && item.notes !== '無' && item.notes !== '點心' && (
                      <div className="text-[10px] text-gray-400">({item.notes})</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-200/50 text-right">
              <span className="text-xs font-bold text-orange-600">
                應收: ${group.items.reduce((sum: number, i: any) => sum + i.price, 0)}
              </span>
            </div>
          </div>
        ))}

        {orderList.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400 italic">尚未有任何點餐紀錄</div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSummary;