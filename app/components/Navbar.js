'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogOut, Home } from 'lucide-react'

export default function Navbar({ user }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <img src="/maskot.png" alt="SplitCerdas" className="w-8 h-8 object-contain" />
        <span className="font-bold text-lg" style={{ color: '#2ECC71', fontFamily: 'Fredoka, sans-serif' }}>
          SplitCerdas
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Home size={20} color="#2ECC71" />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <LogOut size={20} color="#e74c3c" />
        </button>
      </div>
    </nav>
  )
}