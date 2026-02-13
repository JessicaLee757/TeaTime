
import React from 'react';
import { OrderDetail, SessionConfig } from '../types';
import { Icons } from '../constants';

interface Props {
  orders: OrderDetail[];
  config: SessionConfig;
}

const ParticipantSummary: React.FC<Props> = ({ orders, config }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="bg-gray-100 p-2 rounded-lg mr-3 text-gray-500"><Icons.Users /></span>
        當週點餐一覽 (目前 {orders.length} 人)
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((o, idx) => {
          const drinkInfo = config.drinkItems.find(i => i.id === o.drinkId);
          return (
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:shadow-md transition-shadow">
              <div className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-1">{o.userName}</div>
              <div className="space-y-1">
                {o.drinkId && (
                  <div className="flex items-start text-xs text-blue-700">
                     <span className="mt-0.5 mr-1 text-blue-400 opacity-70"><Icons.Coffee /></span>
                     <span>
                      {drinkInfo?.name} 
                      {drinkInfo?.sugarIceConfig && (
                        <span className="text-gray-400 block italic text-[10px]">({drinkInfo.sugarIceConfig})</span>
                      )}
                     </span>
                  </div>
                )}
                {o.snackId && (
                  <div className="flex items-center text-xs text-pink-700">
                    <span className="mr-1 text-pink-400 opacity-70"><Icons.Cake /></span>
                    {config.snackItems.find(i => i.id === o.snackId)?.name}
                  </div>
                )}
                {!o.drinkId && !o.snackId && <div className="text-gray-400 text-xs italic">只有看看不說話</div>}
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
