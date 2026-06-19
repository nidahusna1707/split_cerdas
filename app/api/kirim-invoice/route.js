export async function POST(request) {
  try {
    const { nama, email, namaGrup, items, total } = await request.json()

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.nama}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rp ${item.jumlah.toLocaleString('id-ID')}</td>
      </tr>
    `).join('')

    const html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2ECC71;">SplitCerdas 🌿</h2>
        <p>Halo <strong>${nama}</strong>,</p>
        <p>Berikut tagihan kamu untuk grup <strong>${namaGrup}</strong>:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${itemsHtml}
        </table>

        <p style="font-size: 18px; font-weight: bold; color: #2ECC71;">Total: Rp ${total.toLocaleString('id-ID')}</p>

        <div style="background: #fffbea; border: 1px solid #F1C40F; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 13px; color: #555;">
          🌿 <strong>Catatan Syariah:</strong> Tagihan ini bersifat Qardh (pinjaman kebajikan) tanpa tambahan biaya apapun (bebas riba).
        </div>

        <p style="font-size: 13px; color: #888;">Email ini dikirim otomatis oleh SplitCerdas.</p>
      </div>
    `

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'SplitCerdas', email: 'nidahusna1707@gmail.com' },
        to: [{ email, name: nama }],
        subject: `Tagihan SplitCerdas - ${namaGrup}`,
        htmlContent: html
      })
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ error: data.message, code: data.code, fullError: JSON.stringify(data), status: res.status }, { status: 400 })
    }

    return Response.json({ success: true, data })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}