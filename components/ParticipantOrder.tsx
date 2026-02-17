import React, { useState } from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onSubmit: (order: any) => Promise<void>; 
}

const ParticipantOrder: React.FC<Props> = ({ config, orders = [], onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [drinkId, setDrinkId] = useState('');
  const [snackId, setSnackId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasDrinks = config?.drinkItems && config.drinkItems.length > 0;
  const hasSnacks = config?.snackItems && config.snackItems.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) return alert('請選擇姓名');
    if (!drinkId && !snackId) return alert('請至少選擇一個品項喔！');

    setIsSubmitting(true);
    const selectedItems = [];

    if (drinkId) {
      const drink = config.drinkItems.find(i => i.id === drinkId);
      if (drink) selectedItems.push({ memberName: userName, itemName: drink.name, price: drink.price, notes: drink.sugarIceConfig || '' });
    }

    if (snackId) {
      const snack = config.snackItems.find(i => i.id === snackId);
      if (snack) selectedItems.push({ memberName: userName, itemName: snack.name, price: snack.price, notes: '點心' });
    }

    try {
      // 💡 核心優化：同時發送多筆訂單，全部完成後才顯示成功
      await Promise.all(selectedItems.map(item => onSubmit(item)));
      setSubmitted(true);
      // 清空選擇以便下次點餐 (如果需要)
      setDrinkId('');
      setSnackId('');
      // 5秒後自動恢復顯示表單，方便同一台裝置多人點餐
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      alert('點餐發生錯誤，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
      {submitted ? (
        <div className="py-16 text-center animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center p-6 bg-green-100 rounded-full mb-6 text-green-600">
            <Icons.Check size={48} />
          </div>
          <h3 className="text-3xl font-black text-gray-800 mb-2">點餐成功！</h3>
          <p className="text-gray-500">你的心願已傳達給團主囉 ✨</p>
          <button onClick={() => setSubmitted(false)} className="mt-8 text-orange-600 font-bold hover:underline">
            再點一份？
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Icons.Users /></div>
            <h2 className="text-2xl font-bold text-gray-800">我要跟團</h2>
          </div>

          <section>
            <label className="block text-sm font-bold text-gray-600 mb-3">名字</label>
            <select
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:border-orange-500 focus:bg-white outline-none transition-all appearance-none"
            >
              <option value="">點擊選擇你的名字</option>
              {config.departmentMembers.map(m => (
                <option key={m} value={m}>{m} {orders.some(o => o.userName === m) ? '(已點過)' : ''}</option>
              ))}
            </select>
          </section>

          {hasDrinks && (
            <section className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Icons.Coffee /> 飲料：{config.drinkShopName}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setDrinkId('')} className={`p-4 rounded-2xl border-2 transition-all font-bold ${!drinkId ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-100 text-blue-600'}`}>不喝飲料</button>
                {config.drinkItems.map(item => (
                  <button key={item.id} type="button" onClick={() => setDrinkId(item.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${drinkId === item.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-blue-50 text-gray-700 hover:border-blue-200'}`}>
                    <div className="font-bold truncate">{item.name}</div>
                    <div className={`text-xs ${drinkId === item.id ? 'text-blue-100' : 'text-gray-400'}`}>${item.price}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {hasSnacks && (
            <section className="p-5 bg-pink-50/50 rounded-3xl border border-pink-100">
              <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center gap-2">
                <Icons.Check /> 點心：{config.snackShopName}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setSnackId('')} className={`p-4 rounded-2xl border-2 transition-all font-bold ${!snackId ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white border-pink-100 text-pink-600'}`}>不吃點心</button>
                {config.snackItems.map(item => (
                  <button key={item.id} type="button" onClick={() => setSnackId(item.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${snackId === item.id ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-pink-50 text-gray-700 hover:border-pink-200'}`}>
                    <div className="font-bold truncate">{item.name}</div>
                    <div className={`text-xs ${snackId === item.id ? 'text-pink-100' : 'text-gray-400'}`}>${item.price}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 ${isSubmitting ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200'}`}
          >
            {isSubmitting ? '送出中...' : '確認送出訂單 🚀'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ParticipantOrder;