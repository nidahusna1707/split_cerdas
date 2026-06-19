import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const { messages } = await request.json()

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: `Kamu adalah SplitBot, asisten AI untuk aplikasi SplitCerdas — aplikasi split tagihan berbasis prinsip syariah Islam (bebas riba). Kamu membantu pengguna memahami cara pakai aplikasi, menjelaskan konsep pembagian tagihan yang adil, dan menjawab pertanyaan seputar muamalah keuangan syariah. Jawab dengan ramah, singkat, dan dalam Bahasa Indonesia.`
        },
        ...messages
      ],
      max_tokens: 500,
    })

    const reply = completion.choices[0].message.content
    return Response.json({ reply })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}