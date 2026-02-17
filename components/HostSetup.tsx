import React, { useState } from 'react';
import { SessionConfig, DrinkItem, SnackItem } from '../types';
import { Icons } from '../constants';

interface Props {
  onCreate: (config: SessionConfig) => void;
}

const HostSetup: React.FC<Props> = ({ onCreate }) => {
  // 飲料設定
  const [drinkShopName, setDrinkShopName] = useState('');
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>([]);
  const [newDrink, setNewDrink] = useState({ name: '', price: 0, sugarIce: '' });

  // 點心設定
  const [snackShopName, setSnackShopName] = useState('');
  const [snackItems, setSnackItems] = useState<SnackItem[]>([]);
  const [newSnack, setNewSnack] = useState({ name: '', price: 0 });

  // 成員名單
  const [members, setMembers] = useState('');

  const addDrink = () => {
    if (!newDrink.name || newDrink.price <= 0) return;
    setDrinkItems([...drinkItems, { 
      id: crypto.randomUUID(), 
      name: newDrink.name, 
      price: newDrink.price, 
      sugarIceConfig: newDrink.sugarIce 
    }]);
    setNewDrink({ name: '', price: 0, sugarIce: '' });
  };

  const addSnack = () => {
    if (!newSnack.name || newSnack.price <= 0) return;
    setSnackItems([...snackItems, { 
      id: crypto.randomUUID(), 
      name: newSnack.name, 
      price: newSnack.price 
    }]);
    setNewSnack({ name: '', price: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drinkShopName && !snackShopName) return alert('請至少輸入一家店名');
    
    onCreate({
      drinkShopName,
      drinkItems,
      snackShopName,
      snackItems,
      departmentMembers: members.split(/[,，\n]/).map(m => m.trim()).filter(Boolean),
      isActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. 飲料設定區 */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
        <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center">
          <span className="mr-2"><Icons.Coffee /></span> 1. 飲料店家設定
        </h3>
        <input
          placeholder="飲料店名稱"
          value={drinkShopName}
          onChange={e => setDrinkShopName(e.target.value)}
          className="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 mb-4">
          <input placeholder="品項名稱" value={newDrink.name} onChange={e => setNewDrink({...newDrink, name: e.target.value})} className="flex-1 p-2 border rounded-lg text-sm" />
          <input type="number" placeholder="金額" value={newDrink.price || ''} onChange={e => setNewDrink({...newDrink, price: Number(e.target.value)})} className="w-20 p-2 border rounded-lg text-sm" />
          <button type="button" onClick={addDrink} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">新增</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {drinkItems.map(item => (
            <span key={item.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
              {item.name} (${item.price})
            </span>
          ))}
        </div>
      </section>

      {/* 2. 點心設定區 */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50">
        <h3 className="text-lg font-bold text-pink-600 mb-4 flex items-center">
          <span className="mr-2"><Icons.Check /></span> 2. 點心店家設定
        </h3>
        <input
          placeholder="點心店名稱"
          value={snackShopName}
          onChange={e => setSnackShopName(e.target.value)}
          className="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-pink-500"
        />
        <div className="flex gap-2 mb-4">
          <input placeholder="點心名稱" value={newSnack.name} onChange={e => setNewSnack({...newSnack, name: e.target.value})} className="flex-1 p-2 border rounded-lg text-sm" />
          <input type="number" placeholder="金額" value={newSnack.price || ''} onChange={e => setNewSnack({...newSnack, price: Number(e.target.value)})} className="w-20 p-2 border rounded-lg text-sm" />
          <button type="button" onClick={addSnack} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-bold">新增</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {snackItems.map(item => (
            <span key={item.id} className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs">
              {item.name} (${item.price})
            </span>
          ))}
        </div>
      </section>

      {/* 3. 成員設定 */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2"><Icons.Users /></span> 3. 參與成員 (用逗號或換行分隔)
        </h3>
        <textarea
          placeholder="部門成員"
          value={members}
          onChange={e => setMembers(e.target.value)}
          className="w-full p-3 border rounded-xl h-24 outline-none focus:ring-2 focus:ring-orange-500"
        />
      </section>

      <button
        type="submit"
        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 shadow-lg shadow-orange-200"
      >
        建立本週團購
      </button>
    </form>
  );
};

export default HostSetup;