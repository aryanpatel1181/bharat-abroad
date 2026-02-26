import { useState } from 'react'

export default function Chatbot() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Namaste! 🙏 I am Bharat AI. Ask me anything about Indian culture, festivals, or events near you!' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const sendMessage = async () => {
        if (!input.trim()) return

        const userMessage = { role: 'user', content: input }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 500,
                    messages: [
                        {
                            role: 'system',
                            content: `You are Bharat AI, a friendly and knowledgeable assistant for Bharat Abroad — a platform that helps the Indian diaspora in the US discover Indian cultural events and festivals. You help users with questions about Indian festivals, traditions, culture, and events across the US. Keep responses concise, warm, and helpful. Use occasional Indian greetings like Namaste. Use relevant emojis.`
                        },
                        ...updatedMessages.map((m) => ({
                            role: m.role,
                            content: m.content,
                        }))
                    ],
                }),
            })

            const data = await response.json()
            console.log('Groq response:', data)

            if (data.error) {
                throw new Error(data.error.message)
            }

            const assistantMessage = {
                role: 'assistant',
                content: data.choices[0].message.content,
            }
            setMessages([...updatedMessages, assistantMessage])
        } catch (err) {
            console.error('Groq API error:', err)
            setMessages([...updatedMessages, {
                role: 'assistant',
                content: `Sorry, I ran into an error: ${err.message}`
            }])
        }

        setLoading(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') sendMessage()
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-orange-500 text-white w-14 h-14 rounded-full shadow-lg text-2xl hover:bg-orange-600 transition z-50"
            >
                {open ? '✕' : '🤖'}
            </button>

            {/* Chat Window */}
            {open && (
                <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-400 px-4 py-3 flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <p className="text-white font-bold text-sm">Bharat AI</p>
                            <p className="text-orange-100 text-xs">Your Indian culture assistant</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-h-80">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-3 py-2 rounded-2xl text-sm max-w-xs ${msg.role === 'user'
                                    ? 'bg-orange-500 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-700 rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl text-sm rounded-bl-none">
                                    Thinking... 🌀
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-100 p-3 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 outline-none focus:border-orange-400 transition"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}