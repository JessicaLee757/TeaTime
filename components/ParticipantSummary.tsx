import React from 'react';
import { Icons } from '../constants';

interface Props {
  orders: any[];
  members: string[];
  onDelete: (name: string) => void;
}

const ParticipantSummary: React.FC<Props> = ({ orders, onDelete }) => {
  const groupedOrders = orders.reduce((acc: any, order: any) => {
    const name = order.memberName || order.member_name;
    if (!acc[name]) acc[name] = { name, items: [] };
    acc[name].items.push({ itemName: order.itemName, notes: order.notes, price: order.price });
    return acc;
  }, {});

  const orderList = Object.values(groupedOrders);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6 text-gray-400">
        <Icons.Users size={20} />
        <h2 className="text-xl font-bold text-gray-800">當週點餐一覽 ({orderList.length} 人)</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orderList.map((group: any) => (
          <div key={group.name} className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 relative transition-all hover:shadow-md">
            {/* 💡 需求 2：改成垃圾桶圖示 */}
            <button 
              onClick={() => onDelete(group.name)} 
              className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
              title="刪除紀錄"
            >
              {/* 直接使用 Alert 當作刪除標記，若想更像垃圾桶可使用現有組件的簡約風格 */}
              <Icons.Alert size={18} />
            </button>

            <div className="font-bold text-lg text-gray-800 mb-4 pr-8 border-b border-gray-100 pb-2">
              {group.name}
            </div>

            <div className="space-y-3">
              {group.items.map((item: any, idx: number) => (
                /* 💡 需求 3：Icon 與文字水平對齊 */
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center">
                    {item.itemName.includes('不') ? (
                      <span className="text-gray-300 text-xs">✕</span>
                    ) : (
                      <div className="text-orange-500">
                        {item.itemName.includes('飲') || !item.notes?.includes('點心') ? <Icons.Coffee size={14} /> : <Icons.Check size={14} />}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center leading-none">
                    <div className={`text-sm font-medium ${item.itemName.includes('不') ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                      {item.itemName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-right">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                應收 ${group.items.reduce((sum: number, i: any) => sum + i.price, 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantSummary;