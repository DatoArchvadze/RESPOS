'use client';

import { useEffect, useState } from 'react';
import { getDishes, createNewOrder, logout } from '@/app/actions';
import { socket } from '@/lib/socket-client';
import Link from 'next/link';

type Dish = {
  id: number;
  name: string;
  price: number;
};

type CartItem = {
  dish: Dish;
  qty: number;
};

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (socket) socket.connect();
    getDishes().then((data) => setDishes(data as Dish[]));

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.dish.id === dish.id);
      if (exists) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { dish, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.dish.id === id) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const sendOrder = async () => {
    if (cart.length === 0) return alert('კალათა ცარიელია!');

    setLoading(true);
    const orderData = cart.map((item) => ({
      dishId: item.dish.id,
      qty: item.qty,
    }));

    const newOrder = await createNewOrder(orderData);

    if (newOrder) {
      if (socket) socket.emit('new-order-placed', newOrder);
      setCart([]);
      alert('შეკვეთა წარმატებით გაიგზავნა სამზარეულოში!');
    } else {
      alert('შეცდომა შეკვეთის გაგზავნისას');
    }
    setLoading(false);
  };

  const total = cart.reduce((sum, item) => sum + item.dish.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* ნავიგაციის ბარი */}
      <nav className="bg-slate-800 border-b border-slate-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <div className="text-xl font-bold tracking-wide text-amber-400">RESPOS — მიმტანი</div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-amber-400 transition font-medium">HOME</Link>
          <Link href="/menu" className="hover:text-amber-400 transition font-medium">MENU</Link>
          <Link href="/history" className="hover:text-amber-400 transition font-medium">ORDER HISTORY</Link>
          
          <form action={logout}>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm">
              გასვლა 🚪
            </button>
          </form>
        </div>
      </nav>

      {/* ძირითადი კონტენტი */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* მენიუს ბლოკი */}
        <div className="md:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">მენიუ</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <button
                key={dish.id}
                onClick={() => addToCart(dish)}
                className="p-4 border border-slate-700 rounded-xl text-left hover:border-amber-500 hover:shadow-md transition bg-slate-700/50 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-white">{dish.name}</p>
                </div>
                <p className="text-amber-400 font-bold mt-2">
                  {dish.price.toFixed(2)} ₾
                </p>
              </button>
            ))}
            {dishes.length === 0 && (
              <p className="text-slate-400 col-span-3 text-center py-8">
                კერძები არ არის ჩატვირთული...
              </p>
            )}
          </div>
        </div>

        {/* მიმდინარე შეკვეთის ბლოკი */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col justify-between min-h-[500px]">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">მიმდინარე შეკვეთა</h2>

            {/* კალათის სია */}
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
              {cart.map((item) => (
                <div
                  key={item.dish.id}
                  className="flex justify-between items-center border-b border-slate-700 pb-2"
                >
                  <div>
                    <p className="font-semibold text-sm text-slate-100">{item.dish.name}</p>
                    <p className="text-xs text-slate-400">
                      {(item.dish.price * item.qty).toFixed(2)} ₾
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.dish.id, -1)}
                      className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm text-white w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.dish.id, 1)}
                      className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">
                  კალათა ცარიელია
                </p>
              )}
            </div>
          </div>

          {/* ჯამი და გაგზავნა */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span className="text-slate-300">ჯამი:</span>
              <span className="text-amber-400">{total.toFixed(2)} ₾</span>
            </div>

            <button
              onClick={sendOrder}
              disabled={loading || cart.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 rounded-xl transition duration-200 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {loading ? 'იგზავნება...' : 'შეკვეთის გაგზავნა '}
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}