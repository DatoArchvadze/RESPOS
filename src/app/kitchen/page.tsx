'use client';

import { useEffect, useState } from 'react';
import { getOrders, completeOrder, logout } from '@/app/actions';
import { socket } from '@/lib/socket-client';

type Order = {
  id: number;
  status: string;
  items: { qty: number; dish: { name: string } }[];
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getOrders().then((res) =>
      setOrders((res as Order[]).filter((o) => o.status === 'PREPARING'))
    );

    if (socket) {
      socket.connect();
      socket.on('new-order-placed', (newOrder: Order) => {
        setOrders((prev) => [newOrder, ...prev]);
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const handleDone = async (orderId: number) => {
    await completeOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (socket) socket.emit('dish-ready', orderId);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* ჰედერი */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black tracking-wide">
          🧑‍🍳 Kitchen <span className="text-amber-500">Display</span>
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
        >
          გასვლა
        </button>
      </div>

      {/* შეკვეთების ბადე */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-amber-400">შეკვეთა #{order.id}</span>
                <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                  მზადდება
                </span>
              </div>

              <div className="space-y-2 mb-6">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700/50"
                  >
                    <span className="font-medium text-slate-200">{item.dish.name}</span>
                    <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg text-sm">
                      x{item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleDone(order.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl text-lg font-bold transition shadow-md cursor-pointer"
            >
              მზადაა ✅
            </button>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full text-center py-24 text-slate-500 text-lg">
            აქტიური შეკვეთები არ არის 📭
          </div>
        )}
      </div>
    </div>
  );
}