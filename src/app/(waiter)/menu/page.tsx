'use client';

import { useEffect, useState } from 'react';
import { getDishes, createDish, updateDish, deleteDish } from '@/app/actions';

type Dish = {
  id: number;
  name: string;
  price: number;
};

export default function MenuManagementPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // ახალი კერძის დამატების ლოკალური სტეიტები
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // კერძების ჩატვირთვა
  const loadDishes = async () => {
    const data = await getDishes();
    setDishes(data as Dish[]);
  };

  useEffect(() => {
    loadDishes();
  }, []);

  // ახალი კერძის დამატება
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) {
      return alert('გთხოვთ შეავსოთ კერძის სახელი და ფასი!');
    }

    setLoading(true);
    const res = await createDish(newName, parseFloat(newPrice));
    if (res.success) {
      setNewName('');
      setNewPrice('');
      loadDishes();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  // რედაქტირების დაწყება
  const startEditing = (dish: Dish) => {
    setEditingId(dish.id);
    setEditName(dish.name);
    setEditPrice(dish.price.toString());
  };

  // ცვლილებების შენახვა
  const handleSave = async (id: number) => {
    if (!editName.trim() || !editPrice) {
      return alert('გთხოვთ შეავსოთ ყველა ველი!');
    }

    const res = await updateDish(id, editName, parseFloat(editPrice));
    if (res.success) {
      setEditingId(null);
      loadDishes(); // სიის განახლება
    } else {
      alert(res.error);
    }
  };

  // კერძის წაშლა
  const handleDelete = async (id: number) => {
    if (!confirm('ნამდვილად გსურთ ამ კერძის წაშლა?')) return;

    const res = await deleteDish(id);
    if (res.success) {
      loadDishes();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">მენიუს მართვა (დამატება / კორექტირება / წაშლა)</h1>

      {/* ახალი კერძის დამატების ფორმა */}
      <form onSubmit={handleCreate} className="bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-700 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ახალი კერძის სახელი"
          className="bg-slate-700 border border-slate-600 px-4 py-2 rounded-xl text-sm flex-1 text-white focus:outline-none focus:border-amber-500 placeholder-slate-400"
        />
        <input
          type="number"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
          placeholder="ფასი (₾)"
          step="0.01"
          className="bg-slate-700 border border-slate-600 px-4 py-2 rounded-xl text-sm w-full sm:w-36 text-white focus:outline-none focus:border-amber-500 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'ემატება...' : 'დამატება ➕'}
        </button>
      </form>

      {/* კერძების სია */}
      <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 overflow-hidden">
        <div className="divide-y divide-slate-700">
          {dishes.map((dish) => (
            <div key={dish.id} className="p-4 flex items-center justify-between gap-4">
              
              {editingId === dish.id ? (
                // რედაქტირების რეჟიმი
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg text-sm flex-1 text-white focus:outline-none focus:border-amber-500"
                    placeholder="კერძის სახელი"
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg text-sm w-28 text-white focus:outline-none focus:border-amber-500"
                    placeholder="ფასი"
                    step="0.01"
                  />
                  <button
                    onClick={() => handleSave(dish.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer"
                  >
                    შენახვა ✅
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer"
                  >
                    გაუქმება
                  </button>
                </div>
              ) : (
                // ჩვეულებრივი ჩვენების რეჟიმი
                <>
                  <div>
                    <p className="font-semibold text-white">{dish.name}</p>
                    <p className="text-amber-400 font-bold text-sm">{dish.price.toFixed(2)} ₾</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(dish)}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                      შეცვლა ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                      წაშლა 🗑️
                    </button>
                  </div>
                </>
              )}

            </div>
          ))}

          {dishes.length === 0 && (
            <p className="text-slate-400 text-center py-8">მენიუში კერძები არ მოიძებნება...</p>
          )}
        </div>
      </div>
    </div>
  );
}
