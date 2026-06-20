'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'
import { Plus, Users, ChevronRight } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [namaGrup, setNamaGrup] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      fetchGroups(user.id)
    }
    getUser()
  }, [])

  const fetchGroups = async (userId) => {
    const { data } = await supabase
      .from('groups')
      .select('*, members(count)')
      .eq('admin_id', userId)
      .order('created_at', { ascending: false })
    setGroups(data || [])
    setLoading(false)
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    setCreating(true)
    const { data, error } = await supabase.from('groups').insert({
      nama: namaGrup,
      deskripsi,
      admin_id: user.id
    }).select().single()

    if (!error) {
      setShowModal(false)
      setNamaGrup('')
      setDeskripsi('')
      router.push(`/grup/${data.id}`)
    }
    setCreating(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#f8fffe' }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: '#2ECC71', filter: 'blur(60px)' }}></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: '#F1C40F', filter: 'blur(60px)' }}></div>
      <Navbar user={user} />

      <div className="max-w-2xl mx-auto p-4">
        <div className="grid grid-cols-2 gap-3 mb-6 mt-4">
          <div className="card" style={{ background: 'linear-gradient(135deg, #2ECC71 0%, #27ae60 100%)' }}>
            <p className="text-white/80 text-xs font-semibold">Total Grup</p>
            <p className="text-white text-2xl font-bold mt-1">{groups.length}</p>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #F1C40F 0%, #d4ac0d 100%)' }}>
            <p className="text-white/80 text-xs font-semibold">Status</p>
            <p className="text-white text-2xl font-bold mt-1">🌿 Syariah</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 mt-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>Grup Saya</h1>
            <p className="text-gray-500 text-sm">Kelola pengeluaran bersama</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white"
            style={{ background: '#2ECC71' }}
          >
            <Plus size={18} />
            Buat Grup
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : groups.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-bold text-lg mb-2" style={{ color: '#1a1a2e' }}>Belum ada grup</h3>
            <p className="text-gray-500 text-sm mb-6">Buat grup pertama kamu untuk mulai split tagihan</p>
            <button onClick={() => setShowModal(true)} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
              Buat Grup Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/grup/${group.id}`)}
                className="card flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#e8f8f0' }}>
                    <Users size={22} color="#2ECC71" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#1a1a2e' }}>{group.nama}</h3>
                    <p className="text-gray-500 text-sm">{group.deskripsi || 'Tidak ada deskripsi'}</p>
                  </div>
                </div>
                <ChevronRight size={20} color="#ccc" />
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1a1a2e' }}>Buat Grup Baru</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">Nama Grup</label>
                <input type="text" className="input-field" placeholder="Contoh: Liburan Bali 2025" value={namaGrup} onChange={(e) => setNamaGrup(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">Deskripsi (opsional)</label>
                <input type="text" className="input-field" placeholder="Keterangan grup" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary" disabled={creating}>{creating ? 'Membuat...' : 'Buat Grup'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}