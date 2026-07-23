'use client'

import { useEffect, useState } from 'react'
import { getOrders, getDishes, updateOrder } from '@/app/actions'
import { socket } from '@/lib/socket-client'

type Dish = { id: number, name: string, price: number }
type OrderItem = { id?: number, qty: number, dish: Dish, dishId?: number }
type Order = {
  id: number, status: string, createdAt: Date,
  items: OrderItem[]
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editCart, setEditCart] = useState<{ dish: Dish, qty: number }[]>([])

  useEffect(() => {
    getOrders().then(setOrders)
    getDishes().then(setDishes)
    
    if (socket) {
      socket.connect()
      socket.on('dish-ready', (orderId: number) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'DONE' } : o))
      })
    }
    
    return () => { 
      if (socket) socket.disconnect() 
    }
  }, [])

  const openEditModal = (order: Order) => {
    if (order.status === 'DONE') {
      alert('დასრულებული შეკვეთის რედაქტირება შეუძლებელია!')
      return
    }
    setEditingOrder(order)
    setEditCart(order.items.map(item => ({ dish: item.dish, qty: item.qty })))
  }

  const updateCartItemQty = (dishId: number, delta: number) => {
    setEditCart(prev => prev.map(item => {
      if (item.dish.id === dishId) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : item
      }
      return item
    }))
  }

  const addDishToEditCart = (dish: Dish) => {
    setEditCart(prev => {
      const exists = prev.find(item => item.dish.id === dish.id)
      if (exists) return prev.map(item => item.dish.id === dish.id ? { ...item, qty: item.qty + 1 } : item)
      return [...prev, { dish, qty: 1 }]
    })
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return
    const cartData = editCart.map(item => ({ dishId: item.dish.id, qty: item.qty }))
    const updated = await updateOrder(editingOrder.id, cartData)
    
    if (updated) {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
      setEditingOrder(null)
      alert('შეკვეთა წარმატებით განახლდა!')
    } else {
      alert('შეცდომა შეკვეთის განახლებისას')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-white mb-6">შეკვეთების ისტორია და რედაქტირება</h1>
      
      <div className="space-y-4">
        {orders.map(order => (
          <div 
            key={order.id} 
            className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-lg text-white">შეკვეთა #{order.id}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  order.status === 'DONE' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {order.status === 'DONE' ? 'მზადაა' : 'მზადდება'}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 mb-3">
                {new Date(order.createdAt).toLocaleString('ka-GE')}
              </p>

              <div className="flex flex-wrap gap-2">
                {order.items.map((item, idx) => (
                  <span 
                    key={idx}
                    className="bg-slate-700 text-slate-200 px-3 py-1 rounded-xl text-sm font-medium border border-slate-600"
                  >
                    {item.qty}x {item.dish.name}
                  </span>
                ))}
              </div>
            </div>

            {order.status === 'PREPARING' && (
              <button 
                onClick={() => openEditModal(order)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm text-sm"
              >
                რედაქტირება ✏️
              </button>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
            <p className="text-slate-400">შეკვეთების ისტორია ცარიელია</p>
          </div>
        )}
      </div>

      {/* რედაქტირების  ფანჯარა */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700 space-y-6">
            <h3 className="text-xl font-bold text-white">
              შეკვეთის #{editingOrder.id} რედაქტირება
            </h3>
            
            {/* მიმდინარე კერძები შეკვეთაში */}
            <div>
              <h4 className="font-semibold text-sm text-slate-300 mb-3">მიმდინარე კერძები შეკვეთაში:</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {editCart.map(item => (
                  <div key={item.dish.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                    <span className="font-medium text-white text-sm">{item.dish.name}</span>
                    <div className="flex gap-2 items-center">
                      <button 
                        onClick={() => updateCartItemQty(item.dish.id, -1)} 
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition flex items-center justify-center cursor-pointer border border-slate-600"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-white w-4 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateCartItemQty(item.dish.id, 1)} 
                        className="w-7 h-7 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition flex items-center justify-center cursor-pointer border border-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* კერძის დამატება */}
            <div>
              <h4 className="font-semibold text-sm text-slate-300 mb-3">კერძის დამატება მენიუდან:</h4>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-700 p-2 rounded-xl bg-slate-900/50">
                {dishes.map(dish => (
                  <button 
                    key={dish.id} 
                    onClick={() => addDishToEditCart(dish)} 
                    className="text-left p-2.5 hover:bg-slate-700 bg-slate-800 border border-slate-700 rounded-lg flex justify-between items-center transition cursor-pointer"
                  >
                    <span className="text-white text-sm font-medium truncate mr-2">{dish.name}</span>
                    <span className="text-amber-400 font-bold text-lg">+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ღილაკები */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-700">
              <button 
                onClick={() => setEditingOrder(null)} 
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer text-sm"
              >
                გაუქმება
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-2.5 rounded-xl font-bold transition cursor-pointer shadow-sm text-sm"
              >
                შენახვა 💾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}