import React, { useState } from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: OrderDetail[];
  // 這裡修正 onSubmit 的參數型別，確保與 App.tsx 一致
  onSubmit: (order: any) => void; 
}

const ParticipantOrder: React.FC<Props> = ({ config, orders = [], onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [drinkId, setDrinkId] = useState('');
  const [snackId, setSnackId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 防呆：確保 config 存在
  const hasDrinks = config?.drinkShopName && config?.drinkItems?.length > 0;
  const hasSnacks = config?.snackShopName && config?.snackItems?.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) {
      alert('請輸入姓名');
      return;
    }
    
    const selectedDrink = config.drinkItems.find(i => i.id === drinkId);
    
    // 這裡傳出去的欄位要對應 App.tsx 裡的 handleOrderSubmit
    onSubmit({
      memberName: userName,
      itemName: selectedDrink ? selectedDrink.name : '未選擇',
      price: selectedDrink ? selectedDrink.price : 0,
      notes: selectedDrink ? selectedDrink.sugarIceConfig : ''
    });

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // 加上「?.」防護，防止 orders 為空時崩潰
  const userPreviousOrder = orders?.find(o => o.userName === userName || (o as any).memberName === userName);

  // 如果資料還沒載入，顯示載入中
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
        <div className="bg-green-50 text-green-700 p-10 rounded-2xl text-center border border-green-200 animate-bounce">
          <Icons.Check />
          <h3 className="text-xl font-bold">點餐成功！</h3>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">我是誰</label>
            <select
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white"
            >
              <option value="">請選擇你的名字</option>
              {config.departmentMembers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </section>

          {hasDrinks && (
            <section className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
              <h3 className="text-lg font-bold text-blue-900 mb-4">
                飲料：{config.drinkShopName}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {config.drinkItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDrinkId(item.id)}
                    className={`px-3 py-3 rounded-xl text-sm border transition-all ${drinkId === item.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    {item.name} (${item.price})
                  </button>
                ))}
              </div>
            </section>
          )}

          <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold">
            確認送出
          </button>
        </form>
      )}
    </div>
  );
};

export default ParticipantOrder;