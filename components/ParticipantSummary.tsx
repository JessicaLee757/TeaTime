import React from 'react';
import { OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  orders: any[];
  members: string[];
}

const ParticipantSummary: React.FC<Props> = ({ orders, members }) => {
  // 💡 核心邏輯：依據成員名稱進行分組
  const groupedOrders = orders.reduce((acc: any, order: any) => {
    const name = order.memberName || order.member_name;
    if (!acc[name]) {
      acc[name] = {
        name: name,
        items: []
      };
    }
    acc[name].items.push({
      itemName: order.itemName || order.item_name,
      notes: order.notes,
      price: order.price
    });
    return acc;
  }, {});

  const orderList = Object.values(groupedOrders);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
          <Icons.Users />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          當週點餐一覽 (目前 {orderList.length} 人)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderList.map((group: any) => (
          <div key={group.name} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col">
            {/* 成員姓名 */}
            <div className="font-bold text-gray-800 border-b pb-2 mb-3 flex justify-between items-center">
              <span>{group.name}</span>
              <span className="text-xs text-gray-400 font-normal">
                共 {group.items.length} 品項
              </span>
            </div>

            {/* 該成員的所有品項清單 */}
            <div className="space-y-3">
              {group.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="mt-1 text-orange-500">
                    {/* 簡單判斷：備註包含'點心'或是特定品項則換圖標 */}
                    {item.notes === '點心' ? <Icons.Check /> : <Icons.Coffee />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {item.itemName}
                    </div>
                    {item.notes && item.notes !== '點心' && (
                      <div className="text-[10px] text-gray-400">
                        備註：{item.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 個人小計 */}
            <div className="mt-auto pt-3 text-right text-xs font-bold text-orange-600">
              小計: ${group.items.reduce((sum: number, i: any) => sum + i.price, 0)}
            </div>
          </div>
        ))}

        {orderList.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400 italic">
            尚未有任何點餐紀錄
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSummary;