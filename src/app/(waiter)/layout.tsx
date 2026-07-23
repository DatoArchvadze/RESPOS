import Link from 'next/link'
import { logout } from '@/app/actions'

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-mono">
      <nav className="bg-slate-800 border-b border-slate-700 text-white px-6 py-4 shadow-md flex justify-between items-center shrink-0">
        <div className="text-xl font-bold tracking-wide text-amber-400">RESPOS — მიმტანი</div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-amber-400 transition font-bold">HOME</Link>
          <Link href="/menu" className="hover:text-amber-400 transition font-bold">MENU</Link>
          <Link href="/history" className="hover:text-amber-400 transition font-bold">ORDER HISTORY</Link>
          
          <form action={logout}>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer shadow-sm">
              გასვლა 
            </button>
          </form>
        </div>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}