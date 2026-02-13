
import React, { useState } from 'react';
import { SessionConfig, DrinkItem, SnackItem } from '../types';
import { Icons } from '../constants';

interface Props {
  onCreate: (config: SessionConfig) => void;
}

const HostSetup: React.FC<Props> = ({ onCreate }) => {
  const [drinkShop, setDrinkShop] = useState('');
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>([]);
  const [snackShop, setSnackShop] = useState('');
  const [snackItems, setSnackItems] = useState<SnackItem[]>([]);
  const [rawMembers, setRawMembers] = useState('');

  const [newDrinkName, setNewDrinkName] = useState('');
  const [newDrinkPrice, setNewDrinkPrice] = useState('');
  const [newDrinkSugarIce, setNewDrinkSugarIce] = useState('');
  const [newSnackName, setNewSnackName] = useState('');
  const [newSnackPrice, setNewSnackPrice] = useState('');

  const addDrink = () => {
    if (newDrinkName && newDrinkPrice && drinkItems.length < 10) {
      setDrinkItems([...drinkItems, { 
        id: crypto.randomUUID(), 
        name: newDrinkName, 
        price: Number(newDrinkPrice),
        sugarIceConfig: newDrinkSugarIce
      }]);
      setNewDrinkName('');
      setNewDrinkPrice('');
      setNewDrinkSugarIce('');
    }
  };

  const addSnack = () => {
    if (newSnackName && newSnackPrice && snackItems.length < 10) {
      setSnackItems([...snackItems, { id: crypto.randomUUID(), name: newSnackName, price: Number(newSnackPrice) }]);
      setNewSnackName('');
      setNewSnackPrice('');
    }
  };

  const removeDrink = (id: string) => setDrinkItems(drinkItems.filter(i => i.id !== id));
  const removeSnack = (id: string) => setSnackItems(snackItems.filter(i => i.id !== id));

  const handleStart = () => {
    const hasDrinks = drinkShop.trim() !== '' && drinkItems.length > 0;
    const hasSnacks = snackShop.trim() !== '' && snackItems.length > 0;

    if (!hasDrinks && !hasSnacks) {
      alert('請至少完整設定一個類別（填寫店家名稱並新增品項）');
      return;
    }

    const members = rawMembers.split(/[\n,，]+/).map(m => m.trim()).filter(Boolean);
    if (members.length === 0) {
      alert('請輸入參與人員名單');
      return;
    }

    onCreate({
      drinkShopName: hasDrinks ? drinkShop : '',
      drinkItems: hasDrinks ? drinkItems : [],
      snackShopName: hasSnacks ? snackShop : '',
      snackItems: hasSnacks ? snackItems : [],
      departmentMembers: members,
      isActive: true
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3"><Icons.Settings /></span>
          設定本週團購
        </h2>

        {/* Drink Settings */}
        <section className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-2 mb-4">
            <Icons.Coffee />
            <h3 className="text-lg font-semibold text-blue-900">類別一：飲料 (選填)</h3>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">飲料店家名稱</label>
              <input
                type="text"
                value={drinkShop}
                onChange={e => setDrinkShop(e.target.value)}
                placeholder="例如：50嵐"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">品項 (上限 10 個)</label>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-grow min-w-[120px]">
                  <input
                    type="text"
                    value={newDrinkName}
                    onChange={e => setNewDrinkName(e.target.value)}
                    placeholder="品項名稱"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={drinkItems.length >= 10}
                  />
                </div>
                <div className="flex-grow min-w-[120px]">
                  <input
                    type="text"
                    value={newDrinkSugarIce}
                    onChange={e => setNewDrinkSugarIce(e.target.value)}
                    placeholder="甜度冰塊設定"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={drinkItems.length >= 10}
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={newDrinkPrice}
                    onChange={e => setNewDrinkPrice(e.target.value)}
                    placeholder="價錢"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={drinkItems.length >= 10}
                  />
                </div>
                <button
                  onClick={addDrink}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                  disabled={drinkItems.length >= 10 || !newDrinkName || !newDrinkPrice}
                >
                  新增
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {drinkItems.map(item => (
                  <span key={item.id} className="bg-white px-3 py-1.5 rounded-full border border-blue-200 text-sm flex items-center shadow-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-500">{item.sugarIceConfig || '無設定'}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-blue-600">${item.price}</span>
                    <button onClick={() => removeDrink(item.id)} className="ml-2 text-red-400 hover:text-red-600">
                      <Icons.Trash />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Snack Settings */}
        <section className="mb-8 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
          <div className="flex items-center space-x-2 mb-4">
            <Icons.Cake />
            <h3 className="text-lg font-semibold text-pink-900">類別二：點心 (選填)</h3>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">點心店家名稱</label>
              <input
                type="text"
                value={snackShop}
                onChange={e => setSnackShop(e.target.value)}
                placeholder="例如：雞蛋糕"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">品項 (上限 10 個)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSnackName}
                  onChange={e => setNewSnackName(e.target.value)}
                  placeholder="品項名稱"
                  className="flex-grow px-4 py-2 border border-gray-200 rounded-lg outline-none"
                  disabled={snackItems.length >= 10}
                />
                <input
                  type="number"
                  value={newSnackPrice}
                  onChange={e => setNewSnackPrice(e.target.value)}
                  placeholder="價錢"
                  className="w-24 px-4 py-2 border border-gray-200 rounded-lg outline-none"
                  disabled={snackItems.length >= 10}
                />
                <button
                  onClick={addSnack}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 disabled:bg-gray-300 transition-colors"
                  disabled={snackItems.length >= 10 || !newSnackName || !newSnackPrice}
                >
                  新增
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {snackItems.map(item => (
                  <span key={item.id} className="bg-white px-3 py-1.5 rounded-full border border-pink-200 text-sm flex items-center shadow-sm">
                    {item.name} (${item.price})
                    <button onClick={() => removeSnack(item.id)} className="ml-2 text-red-400 hover:text-red-600">
                      <Icons.Trash />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Member Settings */}
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-4 text-gray-800">
            <Icons.Users />
            <h3 className="text-lg font-semibold">參與名單 (部門全員)</h3>
          </div>
          <p className="text-xs text-gray-500 mb-2">請輸入名單，可以用換行或逗號分隔。</p>
          <textarea
            value={rawMembers}
            onChange={e => setRawMembers(e.target.value)}
            rows={5}
            placeholder=""
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </section>

        <button
          onClick={handleStart}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-orange-200"
        >
          開始本週下午茶團購！
        </button>
      </div>
    </div>
  );
};

export default HostSetup;
