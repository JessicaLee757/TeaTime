import React, { useState } from 'react';
import { SessionConfig, OrderDetail } from '../types';
import { Icons } from '../constants';

interface Props {
  config: SessionConfig;
  orders: any[];
  onSubmit: (order: any) => Promise<void>; 
}

const ParticipantOrder: React.FC<Props> = ({ config, orders = [], onSubmit }) => {
  const [userName, setUserName] = useState(config.departmentMembers[0] || ''); // 💡 需求 1：直接開始顯示名字
  const [drinkId, setDrinkId] = useState('');
  const [snackId, setSnackId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastSelection, setLastSelection] = useState<string[]>([]); // 💡 需求 3：記錄選擇

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectionNames: string[] = [];
    const selectedItems = [];

    if (drinkId) {
      const drink = config.drinkItems.find(i => i.id === drinkId);
      if (drink) {
        selectedItems.push({ memberName: userName, itemName: drink.name, price: drink.price, notes: drink.sugarIceConfig });
        selectionNames.push(drink.name);
      }
    } else {
      selectedItems.push({ memberName: userName, itemName: '不喝飲料', price: 0, notes: '無' });
      selectionNames.push('不喝飲料');
    }

    if (snackId) {
      const snack = config.snackItems.find(i => i.id === snackId);
      if (snack) {
        selectedItems.push({ memberName: userName, itemName: snack.name, price: snack.price, notes: '點心' });
        selectionNames.push(snack.name);
      }
    } else {
      selectedItems.push({ memberName: userName, itemName: '不吃點心', price: 0, notes: '無' });
      selectionNames.push('不吃點心');
    }

    await Promise.all(selectedItems.map(item => onSubmit(item)));
    setLastSelection(selectionNames);
    setSubmitted(true);
    // 💡 需求 5：移除自動跳轉，繼續停留在成功頁
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl max-w-2xl mx-auto">
      {submitted ? (
        <div className="py-16 text-center animate-in zoom-in">
          <div className="inline-flex items-center justify-center p-6 bg-green-100 rounded-full mb-6 text-green-600"><Icons.Check size={48} /></div>
          {/* 💡 需求 3：顯示名字與品項 */}
          <h3 className="text-3xl font-black text-gray-800 mb-4">{userName} 點餐成功！</h3>
          <div className="bg-gray-50 p-6 rounded-2xl inline-block text-left border border-gray-100">
            <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">本次選擇：</p>
            {lastSelection.map(name => (
              <div key={name} className="text-lg font-bold text-gray-700 flex items-center gap-2">✨ {name}</div>
            ))}
          </div>
          {/* 💡 需求 2, 4：移除心願文字與再點一份按鈕 */}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <label className="block text-sm font-bold text-gray-600 mb-3">我是誰</label>
            <select value={userName} onChange={e => setUserName(e.target.value)} className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl bg-gray-50 appearance-none">
              {/* 💡 需求 1：移除第一個空選項 */}
              {config.departmentMembers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </section>
          {/* ...飲料與點心按鈕部分保持不變... */}
          <button type="submit" className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-xl shadow-lg">確認送出訂單 🚀</button>
        </form>
      )}
    </div>
  );
};

export default ParticipantOrder;