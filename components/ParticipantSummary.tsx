import React from 'react';
import { Icons } from '../constants';

interface Props {
  orders: any[];
  members: string[];
  onDelete: (name: string) => void; // 💡 需求 3：刪除功能
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
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Icons.Users /> 當週點餐一覽 ({orderList.length} 人)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderList.map((group: any) => (
          <div key={group.name} className="p-4 bg-gray-50/50 rounded-xl border relative group">
            {/* 💡 需求 3：刪除按鈕 */}
            <button onClick={() => onDelete(group.name)} className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Icons.Alert size={16} />
            </button>
            <div className="font-bold text-gray-800 border-b pb-2 mb-3">{group.name}</div>
            <div className="space-y-2">
              {group.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 italic">
                  {/* 💡 需求 2：不喝/不吃也會顯示出來 */}
                  {item.itemName === '不喝飲料' || item.itemName === '不吃點心' ? (
                    <span className="opacity-50">❌ {item.itemName}</span>
                  ) : (
                    <span>✅ {item.itemName}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantSummary;