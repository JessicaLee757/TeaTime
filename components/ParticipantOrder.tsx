import React, { useState } from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onSubmit: (order: any) => void; 
}

const ParticipantOrder: React.FC<Props> = ({ config, orders = [], onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [drinkId, setDrinkId] = useState('');
  const [snackId, setSnackId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // 判斷是否有飲料或點心品項
  const hasDrinks = config?.drinkItems && config.drinkItems.length > 0;
  const hasSnacks = config?.snackItems && config.snackItems.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) return alert('請選擇姓名');
    
    // 檢查是否至少點了一樣
    if (!drinkId && !snackId) return alert('請至少選擇一個品項（飲料或點心）');

    // 如果點了飲料，送出一筆；如果點了點心，送出一筆 (或合併送出)
    // 這裡採用分次送出或合併名稱的邏輯，以下示範最穩定的合併名稱做法：
    const selectedDrink = config.drinkItems.find(i => i.id === drinkId);
    const selectedSnack = config.snackItems.find(i => i.id === snackId);

    // 如果兩者都點，我們會分兩次調用 onSubmit，或者合併
    if (selectedDrink) {
      onSubmit({
        memberName: userName,
        itemName: selectedDrink.name,
        price: selectedDrink.price,
        notes: selectedDrink.sugarIceConfig || ''
      });
    }

    if (selectedSnack) {
      onSubmit({
        memberName: userName,
        itemName: selectedSnack.name,
        price: selectedSnack.price,
        notes: '點心'
      });
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2 text-orange-500"><Icons.Check /></span> 我要跟團
        </h2>

        {submitted ? (
          <div className="bg-green-50 text-green-700 p-10 rounded-2xl text-center">訂購成功！</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 姓名選擇 */}
            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-2">我是誰</label>
              <select
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white"
              >
                <option value="">請選擇你的名字</option>
                {config.departmentMembers.map(m => (
                  <option key={m} value={m}>{m} {orders.some(o => o.userName === m) ? '(已點餐)' : ''}</option>
                ))}
              </select>
            </section>

            {/* 飲料區塊 (藍色) */}
            {hasDrinks && (
              <section className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <span className="mr-2"><Icons.Coffee /></span> 飲料：{config.drinkShopName}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setDrinkId('')} className={`p-3 rounded-xl border ${!drinkId ? 'bg-blue-600 text-white' : 'bg-white'}`}>不喝飲料</button>
                  {config.drinkItems.map(item => (
                    <button key={item.id} type="button" onClick={() => setDrinkId(item.id)} className={`p-3 rounded-xl border text-left ${drinkId === item.id ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs opacity-70">${item.price}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 點心區塊 (粉色) */}
            {hasSnacks && (
              <section className="p-4 bg-pink-50/30 rounded-2xl border border-pink-50">
                <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center">
                  <span className="mr-2"><Icons.Check /></span> 點心：{config.snackShopName}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setSnackId('')} className={`p-3 rounded-xl border ${!snackId ? 'bg-pink-600 text-white' : 'bg-white'}`}>不吃點心</button>
                  {config.snackItems.map(item => (
                    <button key={item.id} type="button" onClick={() => setSnackId(item.id)} className={`p-3 rounded-xl border text-left ${snackId === item.id ? 'bg-pink-600 text-white' : 'bg-white'}`}>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs opacity-70">${item.price}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg">確認送出訂單</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ParticipantOrder;