'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function SplitBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Aku SplitBot 🤖✨ Ada yang bisa aku bantu soal split tagihan syariah?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const kirim = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/splitbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Maaf, ada error. Coba lagi ya!' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Bubble Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
        style={{ background: 'transparent', border: 'none', padding: 0 }}
      >
        <Image src="/maskot.png" alt="SplitBot" width={64} height={64} className="rounded-full" />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ background: '#fff', border: '2px solid #2ECC71', maxHeight: '420px' }}>
          
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#2ECC71' }}>
            <Image src="/maskot.png" alt="SplitBot" width={32} height={32} />
            <div>
              <p className="font-bold text-white text-sm">SplitBot</p>
              <p className="text-white text-xs opacity-80">Asisten Syariah AI</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white font-bold text-lg">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2" style={{ maxHeight: '280px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="px-3 py-2 rounded-xl text-sm max-w-[85%]"
                  style={{
                    background: m.role === 'user' ? '#2ECC71' : '#f0fdf4',
                    color: m.role === 'user' ? '#fff' : '#333',
                  }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm" style={{ background: '#f0fdf4', color: '#888' }}>
                  Mengetik...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t" style={{ borderColor: '#e0e0e0' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && kirim()}
              placeholder="Tanya sesuatu..."
              className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
              style={{ border: '1px solid #2ECC71' }}
            />
            <button onClick={kirim} disabled={loading}
              className="px-3 py-2 rounded-lg text-white text-sm font-bold"
              style={{ background: '#2ECC71' }}>
              Kirim
            </button>
          </div>
        </div>
      )}
    </>
  )
}