'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/sharp-card'
import { Button } from '@/components/ui/sharp-button'
import { Input } from '@/components/ui/sharp-input'
import { Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCampaigns()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchCampaigns = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
      const res = await fetch(`/api/campaigns?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          messages: [...messages, userMessage],
          campaignId: selectedCampaign || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
      } else {
        console.error('Failed to get AI response')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold">AI Marketing Assistant</h2>
        <p className="text-muted-foreground">Get AI-powered insights for your campaigns</p>
      </div>

      {/* Campaign Context Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Campaign (Optional)</label>
        <select
          className="w-full px-4 py-2 bg-background border border-input text-foreground focus:outline-none focus:border-primary transition-colors"
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
        >
          <option value="">All Campaigns</option>
          {campaigns.map((campaign: any) => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.title}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 border border-border flex flex-col overflow-hidden">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <p className="text-lg font-semibold">Start a conversation with your AI Assistant</p>
                <p className="text-muted-foreground max-w-md">
                  Ask for campaign ideas, content suggestions, optimization tips, and more.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 border ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted border-border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted border border-border px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-border p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Ask me anything about your marketing campaigns..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
