import React, { useState } from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: OrderDetail[];
  onSubmit: (order: any) => void; 
}

const ParticipantOrder: React.FC<Props> = ({ config, orders = [], onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [itemId, setItemId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 只要 config.drinkItems 有內容就顯示品項
  const hasItems = config?.drinkItems && config?.drinkItems?.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) return alert('請選擇姓名');
    
    const selectedItem = config.drinkItems.find(i => i.id === itemId);
    if (!selectedItem) return alert('請選擇一個品項喔！');

    onSubmit({
      memberName: userName,
      itemName: selectedItem.name,
      price: selectedItem.price,
      notes: (selectedItem as any).sugarIceConfig || ''
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (!config || !config.departmentMembers) {
    return <div className="p-10 text-center text-gray-500">載入中，請稍候...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
          <Icons.Check />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">我要跟團</h2>
      </div>

      {submitted ? (
        <div className="bg-green-50 text-green-700 p-10 rounded-2xl text-center border border-green-200">
          <h3 className="text-xl font-bold">訂購成功！</h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">我是誰</label>
            <select
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white shadow-sm"
            >
              <option value="">請選擇你的名字</option>
              {config.departmentMembers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </section>

          {hasItems && (
            <section className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <span className="mr-2"><Icons.Coffee /></span> 
                {config.drinkShopName || '本週菜單'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {config.drinkItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setItemId(item.id)}
                    className={`px-3 py-3 rounded-xl text-sm border transition-all text-left flex flex-col justify-center ${itemId === item.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-blue-100'}`}
                  >
                    <div className="font-bold">{item.name}</div>
                    <div className="text-[10px] opacity-70">${item.price}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg">
            確認送出訂單
          </button>
        </form>
      )}
    </div>
  );
};

export default ParticipantOrder;
