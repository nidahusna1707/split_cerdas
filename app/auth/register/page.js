'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama } }
    })

    if (error) {
      setError(error.message)
    } else {
      await supabase.from('profiles').upsert({ id: data.user.id, email, nama })
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8fffe 0%, #e8f8f0 100%)' }}>
        <div className="card text-center max-w-md w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#2ECC71' }}>Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 mb-6">Cek email kamu untuk verifikasi akun, lalu login.</p>
          <button className="btn-primary" onClick={() => router.push('/auth/login')}>Ke Halaman Login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8fffe 0%, #e8f8f0 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/maskot.png" alt="SplitCerdas" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold" style={{ color: '#2ECC71', fontFamily: 'Fredoka, sans-serif' }}>SplitCerdas</h1>
          <p className="text-gray-500 mt-1">Buat akun baru 🌿</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#1a1a2e' }}>Daftar</h2>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">Nama Lengkap</label>
              <input type="text" className="input-field" placeholder="Nama kamu" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">Email</label>
              <input type="email" className="input-field" placeholder="email@kamu.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Min. 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Memuat...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-500">
            Sudah punya akun?{' '}
            <button onClick={() => router.push('/auth/login')} className="font-semibold" style={{ color: '#2ECC71' }}>Masuk</button>
          </p>
        </div>
      </div>
    </div>
  )
}