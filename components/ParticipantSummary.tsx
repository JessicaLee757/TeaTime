import React from 'react';
import { OrderDetail, SessionConfig } from '../types';
import { Icons } from '../constants';

// 修改這裡：讓參數名稱與 App.tsx 傳進來的一致
interface Props {
  orders: OrderDetail[];
  members: string[]; // 改為接收 members 陣列
}

// 修改這裡：接收 members
const ParticipantSummary: React.FC<Props> = ({ orders, members }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-500"><Icons.Users /></span>
        當週點餐一覽 (目前 {orders.length} 人)
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((o, idx) => {
          // 注意：這裡因為沒有傳入 config 了，如果需要顯示飲料名稱，
          // 建議直接在 App.tsx 處理好格式或把 config 傳進來。
          // 暫時將 drinkInfo 邏輯簡化避免報錯
          return (
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-shadow">
              <div className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">{o.memberName}</div>
              <div className="space-y-1">
                <div className="flex items-start text-xs text-blue-700">
                   <span className="mt-0.5 mr-1 text-blue-400 opacity-70"><Icons.Coffee /></span>
                   <span>{o.itemName}</span> {/* 直接顯示品名 */}
                </div>
                {o.notes && <div className="text-[10px] text-gray-400 italic">備註：{o.notes}</div>}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400 italic">
            沙發空空的，快來搶頭香點餐！
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantSummary;