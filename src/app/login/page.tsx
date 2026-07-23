'use client';

import { useState } from 'react';
import { login } from '@/app/actions';

export default function LoginPage() {
  const [role, setRole] = useState<'WAITER' | 'KITCHEN'>('WAITER');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!pin) {
      setError('გთხოვთ შეიყვანოთ PIN კოდი');
      return;
    }

    setLoading(true);
    const res = await login(role, pin);
    
    if (res?.error) {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-6 tracking-wide">
          RES<span className="text-amber-500">POS</span>
        </h1>

        {/* როლის არჩევა */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('WAITER')}
            className={`py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
              role === 'WAITER'
                ? 'bg-amber-500 text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            მიმტანი
          </button>
          <button
            type="button"
            onClick={() => setRole('KITCHEN')}
            className={`py-2.5 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
              role === 'KITCHEN'
                ? 'bg-amber-500 text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            სამზარეულო
          </button>
        </div>

        {/* ფორმა */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
              PIN კოდი
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.5em] font-bold border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              required
            />
          </div>

          {/* შეცდომის შეტყობინება */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'მოწმდება...' : 'შესვლა'}
          </button>
        </form>
      </div>
    </div>
  );
}