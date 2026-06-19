'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8fffe 0%, #e8f8f0 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/maskot.png" alt="SplitCerdas" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold" style={{ color: '#2ECC71', fontFamily: 'Fredoka, sans-serif' }}>SplitCerdas</h1>
          <p className="text-gray-500 mt-1">Split tagihan, cara syariah 🌿</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#1a1a2e' }}>Masuk</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="email@kamu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" onClick={() => router.push('/auth/lupa-password')} className="text-sm" style={{ color: '#2ECC71' }}>
                Lupa password?
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Memuat...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-500">
            Belum punya akun?{' '}
            <button onClick={() => router.push('/auth/register')} className="font-semibold" style={{ color: '#2ECC71' }}>
              Daftar
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          🌿 Transaksi sesuai prinsip syariah — bebas riba
        </p>
      </div>
    </div>
  )
}