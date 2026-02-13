
import React, { useState } from 'react';
import { SessionConfig, OrderDetail, DrinkItem } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: OrderDetail[];
  onSubmit: (order: OrderDetail) => void;
}

const ParticipantOrder: React.FC<Props> = ({ config, orders, onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [drinkId, setDrinkId] = useState('');
  const [snackId, setSnackId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const hasDrinks = config.drinkShopName && config.drinkItems.length > 0;
  const hasSnacks = config.snackShopName && config.snackItems.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) {
      alert('請輸入姓名');
      return;
    }
    
    const madeSelection = (hasDrinks && drinkId) || (hasSnacks && snackId);
    if (!madeSelection) {
      alert('請至少點一樣東西喔！');
      return;
    }

    onSubmit({
      userName,
      drinkId: (hasDrinks && drinkId) ? drinkId : undefined,
      snackId: (hasSnacks && snackId) ? snackId : undefined,
      timestamp: Date.now()
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const userPreviousOrder = orders.find(o => o.userName === userName);

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
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
            <Icons.Check />
          </div>
          <h3 className="text-xl font-bold">訂購成功！</h3>
          <p className="mt-2 text-green-600">你的心願已傳達給團主了。</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">我是誰</label>
            <select
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white shadow-sm"
            >
              <option value="">請選擇你的名字</option>
              {config.departmentMembers.map(m => (
                <option key={m} value={m}>{m} {orders.some(o => o.userName === m) ? '(已點餐)' : ''}</option>
              ))}
            </select>
            {userPreviousOrder && (
              <p className="mt-2 text-xs text-orange-500 font-medium flex items-center">
                <Icons.Alert /> <span className="ml-1">你已經點過餐了，重新送出將會覆蓋舊的訂單。</span>
              </p>
            )}
          </section>

          {/* Drink Selection */}
          {hasDrinks && (
            <section className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-900 flex items-center">
                  <span className="mr-2"><Icons.Coffee /></span> 飲料：{config.drinkShopName}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDrinkId('')}
                  className={`px-3 py-3 rounded-xl text-sm border transition-all ${!drinkId ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-blue-600 border-blue-200 hover:border-blue-400'}`}
                >
                  不喝飲料
                </button>
                {config.drinkItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDrinkId(item.id)}
                    className={`px-3 py-3 rounded-xl text-sm border transition-all text-left flex flex-col justify-center ${drinkId === item.id ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-700 border-blue-100 hover:border-blue-300'}`}
                  >
                    <div className="font-bold">{item.name}</div>
                    {item.sugarIceConfig && (
                      <div className={`text-[10px] mt-1 ${drinkId === item.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {item.sugarIceConfig}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {drinkId && (
                <div className="mt-4 p-3 bg-blue-100/50 rounded-lg text-blue-700 text-xs text-center animate-fadeIn">
                  已選擇：{config.drinkItems.find(i => i.id === drinkId)?.name}
                </div>
              )}
            </section>
          )}

          {/* Snack Selection */}
          {hasSnacks && (
            <section className="p-4 bg-pink-50/30 rounded-2xl border border-pink-50">
              <h3 className="text-lg font-bold text-pink-900 flex items-center mb-4">
                <span className="mr-2"><Icons.Cake /></span> 點心：{config.snackShopName}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSnackId('')}
                  className={`px-3 py-3 rounded-xl text-sm border transition-all ${!snackId ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-100' : 'bg-white text-pink-600 border-pink-200 hover:border-pink-400'}`}
                >
                  不吃點心
                </button>
                {config.snackItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSnackId(item.id)}
                    className={`px-3 py-3 rounded-xl text-sm border transition-all text-left flex flex-col justify-center ${snackId === item.id ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-100' : 'bg-white text-gray-700 border-pink-100 hover:border-pink-300'}`}
                  >
                    <div className="font-bold">{item.name}</div>
                  </button>
                ))}
              </div>
              {snackId && (
                <div className="mt-4 p-3 bg-pink-100/50 rounded-lg text-pink-700 text-xs text-center animate-fadeIn">
                  已選擇：{config.snackItems.find(i => i.id === snackId)?.name}
                </div>
              )}
            </section>
          )}

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-orange-200"
          >
            送出訂單
          </button>
        </form>
      )}
    </div>
  );
};

export default ParticipantOrder;
