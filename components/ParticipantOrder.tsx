import React, { useState } from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onSubmit: (order: any) => Promise<void>; 
}

const ParticipantOrder: React.FC<Props> = ({ config, orders = [], onSubmit }) => {
  const [userName, setUserName] = useState(config.departmentMembers[0] || '');
  const [drinkId, setDrinkId] = useState('');
  const [snackId, setSnackId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSelection, setLastSelection] = useState<string[]>([]);

  const hasDrinks = config?.drinkItems && config.drinkItems.length > 0;
  const hasSnacks = config?.snackItems && config.snackItems.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) return alert('請選擇姓名');
    
    setIsSubmitting(true);
    const selectedItems = [];
    const names: string[] = [];

    if (drinkId) {
      const drink = config.drinkItems.find(i => i.id === drinkId);
      if (drink) {
        selectedItems.push({ memberName: userName, itemName: drink.name, price: drink.price, notes: drink.sugarIceConfig || '' });
        names.push(drink.name);
      }
    } else {
      selectedItems.push({ memberName: userName, itemName: '不喝飲料', price: 0, notes: '無' });
      names.push('不喝飲料');
    }

    if (snackId) {
      const snack = config.snackItems.find(i => i.id === snackId);
      if (snack) {
        selectedItems.push({ memberName: userName, itemName: snack.name, price: snack.price, notes: '點心' });
        names.push(snack.name);
      }
    } else {
      selectedItems.push({ memberName: userName, itemName: '不吃點心', price: 0, notes: '無' });
      names.push('不吃點心');
    }

    try {
      await Promise.all(selectedItems.map(item => onSubmit(item)));
      setLastSelection(names);
      setSubmitted(true);
    } catch (err) {
      alert('點餐失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xl max-w-2xl mx-auto border border-gray-100">
      {submitted ? (
        <div className="py-12 text-center animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center p-6 bg-green-100 rounded-full mb-6 text-green-600">
            <Icons.Check size={40} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-6">{userName} 點餐成功！</h3>
          <div className="bg-gray-50 p-6 rounded-2xl inline-block text-left border border-gray-100 w-full max-w-xs">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">本次選擇：</p>
            {lastSelection.map(name => (
              <div key={name} className="text-base font-bold text-gray-700 mb-1 flex items-start gap-2">
                <span className="mt-1">✨</span> 
                <span className="break-all">{name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Icons.Users size={20} /></div>
            <h2 className="text-xl font-bold text-gray-800">我要跟團</h2>
          </div>

          <section>
            <label className="block text-sm font-bold text-gray-600 mb-2">名字</label>
            <select
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-orange-500 outline-none text-base"
            >
              {config.departmentMembers.map(m => (
                <option key={m} value={m}>{m} {orders.some(o => (o.userName || o.memberName) === m) ? '(已點餐)' : ''}</option>
              ))}
            </select>
          </section>

          {/* 渲染飲料與點心區塊 */}
          {[
            { id: 'drink', title: '飲料', shop: config.drinkShopName, items: config.drinkItems, current: drinkId, setter: setDrinkId, color: 'blue', icon: <Icons.Coffee size={18} />, noneText: '不喝飲料' },
            { id: 'snack', title: '點心', shop: config.snackShopName, items: config.snackItems, current: snackId, setter: setSnackId, color: 'pink', icon: <Icons.Check size={18} />, noneText: '不吃點心' }
          ].map(section => (
            section.items && section.items.length > 0 && (
              <section key={section.id} className={`p-4 rounded-2xl border ${section.color === 'blue' ? 'bg-blue-50/50 border-blue-100' : 'bg-pink-50/50 border-pink-100'}`}>
                <h3 className={`text-base font-bold mb-3 flex items-center gap-2 ${section.color === 'blue' ? 'text-blue-900' : 'text-pink-900'}`}>
                  {section.icon} {section.title}：{section.shop}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {/* 💡 修正：統一「不喝/不吃」選項的樣式與對齊方式 */}
                  <button 
                    type="button" 
                    onClick={() => section.setter('')} 
                    className={`p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center gap-2 ${!section.current ? (section.color === 'blue' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-pink-600 border-pink-600 text-white shadow-md') : 'bg-white border-white text-gray-700 hover:border-gray-200'}`}
                  >
                    <span className="font-bold text-sm leading-tight flex-1">{section.noneText}</span>
                    <span className={`text-xs flex-shrink-0 ${!section.current ? 'opacity-80' : 'text-gray-400'}`}>$0</span>
                  </button>

                  {/* 品項清單 */}
                  {section.items.map(item => (
                    <button 
                      key={item.id} 
                      type="button" 
                      onClick={() => section.setter(item.id)} 
                      className={`p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center gap-2 ${section.current === item.id ? (section.color === 'blue' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-pink-600 border-pink-600 text-white shadow-md') : 'bg-white border-white text-gray-700 hover:border-gray-200'}`}
                    >
                      <span className="font-bold text-sm leading-tight flex-1 break-words">{item.name}</span>
                      <span className={`text-xs flex-shrink-0 ${section.current === item.id ? 'opacity-80' : 'text-gray-400'}`}>${item.price}</span>
                    </button>
                  ))}
                </div>
              </section>
            )
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all active:scale-[0.98] ${isSubmitting ? 'bg-gray-300' : 'bg-orange-600 text-white'}`}
          >
            {isSubmitting ? '傳送中...' : '確認送出訂單 🚀'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ParticipantOrder;