import React, { useState, useEffect } from 'react';

import { Role, SessionConfig, OrderDetail } from './types';

import { Icons as IconComponents } from './constants';

import { supabase } from './supabaseClient';

import HostSetup from './components/HostSetup';

import HostDashboard from './components/HostDashboard';

import ParticipantOrder from './components/ParticipantOrder';

// 修正：請確認 components 資料夾下檔案名稱，若有報錯請手動改為 ./components/ParticipantSummary

import ParticipantsSummary from './components/ParticipantSummary';



const App: React.FC = () => {

const [role, setRole] = useState<Role>(Role.HOST);

const [config, setConfig] = useState<SessionConfig>({

drinkShopName: '',

drinkItems: [],

snackShopName: '',

snackItems: [],

departmentMembers: [],

isActive: false,

});

const [orders, setOrders] = useState<OrderDetail[]>([]);



useEffect(() => {

const fetchOrders = async () => {

const { data, error } = await supabase.from('orders').select('*');

if (data) {

const formatted: any[] = data.map((o: any) => ({

...o,

memberName: o.member_name,

itemName: o.item_name

}));

setOrders(formatted);

}

};

fetchOrders();

}, []);



const handleOrderSubmit = async (newOrder: any) => {

const { error } = await supabase

.from('orders')

.insert([

{

member_name: newOrder.memberName || newOrder.member_name,

item_name: newOrder.itemName || newOrder.item_name,

price: newOrder.price,

notes: newOrder.notes,

},

]);



if (error) alert('失敗: ' + error.message);

else alert('成功！');

};



return (

<div className="min-h-screen bg-gray-50 p-4">

<div className="max-w-4xl mx-auto">

<header className="flex justify-between items-center mb-8">

<h1 className="text-2xl font-bold">下午茶團購統計器</h1>

<select value={role} onChange={(e) => setRole(e.target.value as Role)}>

<option value={Role.HOST}>團購主</option>

<option value={Role.PARTICIPANT}>參加者</option>

</select>

</header>



{role === Role.HOST ? (

<div className="space-y-6">

{!config.isActive ? (

<HostSetup onSave={(newConfig) => setConfig({ ...newConfig, isActive: true })} />

) : (

<>

<HostDashboard orders={orders} config={config} />

<ParticipantsSummary orders={orders} members={config.departmentMembers} />

</>

)}

</div>

) : (

<ParticipantOrder config={config} onSubmit={handleOrderSubmit} />

)}

</div>

</div>

);

};



export default App;