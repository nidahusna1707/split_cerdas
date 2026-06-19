'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/Navbar'
import { Plus, UserPlus, Receipt, CheckCircle2, Circle, Bot, X, Trash2 } from 'lucide-react'

export default function GrupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id

  const [user, setUser] = useState(null)
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('expenses')

  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [namaAnggota, setNamaAnggota] = useState('')
  const [emailAnggota, setEmailAnggota] = useState('')
  const [rekeningAnggota, setRekeningAnggota] = useState('')
  const [bankAnggota, setBankAnggota] = useState('')

  const [namaPengeluaran, setNamaPengeluaran] = useState('')
const [tanggalPengeluaran, setTanggalPengeluaran] = useState(new Date().toISOString().split('T')[0])
  const [jumlahPengeluaran, setJumlahPengeluaran] = useState('')
  const [dibayarOleh, setDibayarOleh] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      await fetchAll()
    }
    init()
  }, [groupId])

  const fetchAll = async () => {
    const { data: groupData } = await supabase.from('groups').select('*').eq('id', groupId).single()
    setGroup(groupData)

    const { data: membersData } = await supabase.from('members').select('*').eq('group_id', groupId).order('created_at')
    setMembers(membersData || [])

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*, expense_splits(*, members(nama))')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
    setExpenses(expensesData || [])

    calculateDebts(membersData || [], expensesData || [])
    setLoading(false)
  }

  const calculateDebts = (membersData, expensesData) => {
    const balances = {}
    membersData.forEach(m => { balances[m.id] = 0 })

    expensesData.forEach(exp => {
      balances[exp.dibayar_oleh] = (balances[exp.dibayar_oleh] || 0) + Number(exp.jumlah)
      exp.expense_splits?.forEach(split => {
        balances[split.member_id] = (balances[split.member_id] || 0) - Number(split.jumlah)
      })
    })

    const creditors = []
    const debtors = []
    Object.entries(balances).forEach(([memberId, balance]) => {
      if (balance > 0.01) creditors.push({ memberId, amount: balance })
      else if (balance < -0.01) debtors.push({ memberId, amount: -balance })
    })

    const simplified = []
    let i = 0, j = 0
    creditors.sort((a, b) => b.amount - a.amount)
    debtors.sort((a, b) => b.amount - a.amount)

    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount)
      if (amount > 0.01) {
        simplified.push({
          dari: debtors[i].memberId,
          ke: creditors[j].memberId,
          jumlah: amount
        })
      }
      debtors[i].amount -= amount
      creditors[j].amount -= amount
      if (debtors[i].amount < 0.01) i++
      if (creditors[j].amount < 0.01) j++
    }

    setDebts(simplified)
  }

  const getMemberName = (id) => members.find(m => m.id === id)?.nama || '-'

  const handleAddMember = async (e) => {
    e.preventDefault()
    await supabase.from('members').insert({
      group_id: groupId,
      nama: namaAnggota,
      email: emailAnggota,
      no_rekening: rekeningAnggota,
      nama_bank: bankAnggota
    })
    setShowMemberModal(false)
    setNamaAnggota(''); setEmailAnggota(''); setRekeningAnggota(''); setBankAnggota('')
    fetchAll()
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    const jumlah = parseFloat(jumlahPengeluaran)
    const splitAmount = jumlah / selectedMembers.length

    const { data: expense } = await supabase.from('expenses').insert({
      group_id: groupId,
      nama: namaPengeluaran,
      jumlah,
      dibayar_oleh: dibayarOleh,
      tanggal: tanggalPengeluaran
    }).select().single()

    const splits = selectedMembers.map(memberId => ({
      expense_id: expense.id,
      member_id: memberId,
      jumlah: splitAmount
    }))
    await supabase.from('expense_splits').insert(splits)

    setShowExpenseModal(false)
    setNamaPengeluaran(''); setJumlahPengeluaran(''); setDibayarOleh(''); setSelectedMembers([])
    fetchAll()
  }

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Yakin mau hapus pengeluaran ini?')) return
    await supabase.from('expense_splits').delete().eq('expense_id', expenseId)
    await supabase.from('expenses').delete().eq('id', expenseId)
    fetchAll()
  }

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Yakin mau hapus anggota ini? Pengeluaran terkait anggota ini juga bisa terganggu.')) return
    await supabase.from('members').delete().eq('id', memberId)
    fetchAll()
  }

  const handleKirimInvoice = async (memberId) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return

    const itemsForMember = []
    expenses.forEach(exp => {
      const split = exp.expense_splits?.find(s => s.member_id === memberId)
      if (split) {
        itemsForMember.push({ nama: exp.nama, jumlah: Number(split.jumlah) })
      }
    })

    const total = itemsForMember.reduce((sum, item) => sum + item.jumlah, 0)

    if (itemsForMember.length === 0) {
      alert('Anggota ini belum punya tagihan.')
      return
    }

    try {
      const res = await fetch('/api/kirim-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: member.nama,
          email: member.email,
          namaGrup: group.nama,
          items: itemsForMember,
          total,
          rekeningInfo: members.filter(m => m.id !== memberId).map(m => ({ nama: m.nama, bank: m.nama_bank, rekening: m.no_rekening })).filter(r => r.rekening)
        })
      })
      const result = await res.json()
      if (result.success) {
        alert(`Invoice berhasil dikirim ke ${member.email}`)
      } else {
        alert('Gagal: ' + JSON.stringify(result))
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message)
    }
  }

  const toggleMemberSelect = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>

  return (
    <div className="min-h-screen" style={{ background: '#f8fffe' }}>
      <Navbar user={user} />

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4 mt-4">
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a2e' }}>{group?.nama}</h1>
          <p className="text-gray-500 text-sm">{group?.deskripsi}</p>
        </div>

        <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl border border-gray-100">
          {['expenses', 'anggota', 'rekap'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition"
              style={activeTab === tab ? { background: '#2ECC71', color: 'white' } : { color: '#888' }}
            >
              {tab === 'expenses' ? 'Pengeluaran' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'expenses' && (
          <div>
            <button onClick={() => setShowExpenseModal(true)} className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white" style={{ background: '#2ECC71' }}>
              <Plus size={18} /> Tambah Pengeluaran
            </button>

            {expenses.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">Belum ada pengeluaran</div>
            ) : (
              <div className="space-y-3">
                {expenses.map(exp => (
                  <div key={exp.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#fef9e7' }}>
                          <Receipt size={18} color="#F1C40F" />
                        </div>
                       <div>
                          <h3 className="font-semibold" style={{ color: '#1a1a2e' }}>{exp.nama}</h3>
                          <p className="text-xs text-gray-400">Dibayar oleh {getMemberName(exp.dibayar_oleh)}</p>
                          <p className="text-xs text-gray-400">{new Date(exp.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold" style={{ color: '#2ECC71' }}>{formatRupiah(exp.jumlah)}</p>
                        <button onClick={() => handleDeleteExpense(exp.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'anggota' && (
          <div>
            <button onClick={() => setShowMemberModal(true)} className="w-full mb-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white" style={{ background: '#2ECC71' }}>
              <UserPlus size={18} /> Tambah Anggota
            </button>

            {members.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">Belum ada anggota</div>
            ) : (
              <div className="space-y-3">
                {members.map(m => (
                  <div key={m.id} className="card flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: '#2ECC71' }}>
                      {m.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#1a1a2e' }}>{m.nama}</h3>
                      <p className="text-xs text-gray-400">{m.email}</p>
                      {m.no_rekening && <p className="text-xs text-gray-400">{m.nama_bank} - {m.no_rekening}</p>}
                    </div>
                    <button onClick={() => handleKirimInvoice(m.id)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#e8f8f0', color: '#2ECC71' }}>
                      Kirim Invoice
                    </button>
                    <button onClick={() => handleDeleteMember(m.id)} className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition">
                      <Trash2 size={16} />
                    </button>                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rekap' && (
          <div>
            <div className="card mb-4" style={{ background: '#fffbea', border: '1px solid #F1C40F' }}>
              <p className="text-xs text-gray-600">🌿 <strong>Catatan Syariah:</strong> Penyelesaian hutang ini bersifat Qardh (pinjaman kebajikan) tanpa tambahan biaya apapun (bebas riba).</p>
            </div>

            {debts.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">Tidak ada hutang yang perlu diselesaikan 🎉</div>
            ) : (
              <div className="space-y-3">
                {debts.map((debt, idx) => (
                  <div key={idx} className="card flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>
                        {getMemberName(debt.dari)} → {getMemberName(debt.ke)}
                      </p>
                      <p className="text-xs text-gray-400">Qardh (pinjaman kebajikan)</p>
                    </div>
                    <p className="font-bold" style={{ color: '#e74c3c' }}>{formatRupiah(debt.jumlah)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showMemberModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md relative">
            <button onClick={() => setShowMemberModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1a1a2e' }}>Tambah Anggota</h2>
            <form onSubmit={handleAddMember} className="space-y-3">
              <input type="text" className="input-field" placeholder="Nama anggota" value={namaAnggota} onChange={(e) => setNamaAnggota(e.target.value)} required />
              <input type="email" className="input-field" placeholder="Email" value={emailAnggota} onChange={(e) => setEmailAnggota(e.target.value)} required />
              <input type="text" className="input-field" placeholder="No. Rekening (opsional)" value={rekeningAnggota} onChange={(e) => setRekeningAnggota(e.target.value)} />
              <input type="text" className="input-field" placeholder="Nama Bank (opsional)" value={bankAnggota} onChange={(e) => setBankAnggota(e.target.value)} />
              <button type="submit" className="btn-primary">Tambah</button>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="card w-full max-w-md relative my-8">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1a1a2e' }}>Tambah Pengeluaran</h2>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <input type="text" className="input-field" placeholder="Nama pengeluaran" value={namaPengeluaran} onChange={(e) => setNamaPengeluaran(e.target.value)} required />
              <input type="number" className="input-field" placeholder="Jumlah (Rp)" value={jumlahPengeluaran} onChange={(e) => setJumlahPengeluaran(e.target.value)} required />
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">Tanggal</label>
                <input type="date" className="input-field" value={tanggalPengeluaran} onChange={(e) => setTanggalPengeluaran(e.target.value)} required />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">Dibayar oleh</label>
                <select className="input-field" value={dibayarOleh} onChange={(e) => setDibayarOleh(e.target.value)} required>
                  <option value="">Pilih anggota</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-600">Dibagi untuk</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {members.map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 cursor-pointer">
                      <input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={() => toggleMemberSelect(m.id)} />
                      <span className="text-sm">{m.nama}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={selectedMembers.length === 0}>Simpan Pengeluaran</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}