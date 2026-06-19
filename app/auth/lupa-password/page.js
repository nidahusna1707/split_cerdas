'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LupaPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8fffe 0%, #e8f8f0 100%)' }}>
        <div className="card text-center max-w-md w-full">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#2ECC71' }}>Email Terkirim!</h2>
          <p className="text-gray-500 mb-6">Cek inbox email kamu untuk link reset password.</p>
          <button className="btn-primary" onClick={() => router.push('/auth/login')}>Kembali ke Login</button>
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
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-2 text-center" style={{ color: '#1a1a2e' }}>Lupa Password</h2>
          <p className="text-gray-500 text-sm text-center mb-6">Masukkan email kamu dan kami akan kirim link reset password.</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
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

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-500">
            Ingat password?{' '}
            <button onClick={() => router.push('/auth/login')} className="font-semibold" style={{ color: '#2ECC71' }}>Masuk</button>
          </p>
        </div>
      </div>
    </div>
  )
}