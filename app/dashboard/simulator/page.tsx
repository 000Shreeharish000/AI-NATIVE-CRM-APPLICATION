'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/sharp-card'
import { Button } from '@/components/ui/sharp-button'
import { 
  Smartphone, User, Check, CheckCheck, ExternalLink, 
  ShoppingCart, RefreshCw, Terminal, Eye, MessageSquare 
} from 'lucide-react'

export default function SimulatorPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [callbackLogs, setCallbackLogs] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [simulating, setSimulating] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages(selectedCustomer._id)
    }
  }, [selectedCustomer])

  // Poll callback logs every 3 seconds for the live console
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    fetchLogs(user.id)
    const interval = setInterval(() => fetchLogs(user.id), 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchCustomers = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
      const res = await fetch(`/api/customers?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
        if (data.length > 0) {
          setSelectedCustomer(data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const fetchMessages = async (customerId: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/simulator/messages?customerId=${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const fetchLogs = async (userId: string) => {
    try {
      const res = await fetch(`/api/simulator/logs?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setCallbackLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const triggerCallback = async (logId: string, status: string, purchaseDetails?: any) => {
    setSimulating(status)
    try {
      const res = await fetch('/api/callbacks/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId,
          status,
          purchaseDetails
        })
      })

      if (res.ok) {
        // Refresh local data
        if (selectedCustomer) {
          await fetchMessages(selectedCustomer._id)
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.id) {
          await fetchLogs(user.id)
        }
      }
    } catch (error) {
      console.error('Callback trigger error:', error)
    } finally {
      setSimulating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
      case 'clicked':
        return <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
      case 'ordered':
        return <ShoppingCart className="w-3.5 h-3.5 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="w-8 h-8 text-primary" />
          Shopper Simulator
        </h2>
        <p className="text-muted-foreground">
          Simulate outcomes asynchronously by interacting with shopper devices. Watch the callback logs update in real-time.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Customers List */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-border h-[calc(100vh-230px)] flex flex-col">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle>Shoppers Database</CardTitle>
              <CardDescription>Select a customer to view their phone simulator</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingCustomers ? (
                <div className="text-center py-8 text-muted-foreground">Loading shoppers...</div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No shoppers found. Go to **Settings** and seed the database first!
                </div>
              ) : (
                customers.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCustomer(c)}
                    className={`w-full text-left p-3 border hover:border-primary/50 transition-colors flex flex-col gap-1 ${
                      selectedCustomer?._id === c._id
                        ? 'bg-muted border-primary'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm">{c.name}</span>
                      <span className="text-xs text-muted-foreground">${c.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{c.phone}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.tags.map((t: string) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 text-[10px] font-medium border border-muted bg-muted text-muted-foreground uppercase"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Phone Simulator & Log Console */}
        <div className="lg:col-span-8 grid md:grid-cols-12 gap-6 h-[calc(100vh-230px)]">
          {/* Phone Frame Simulator */}
          <div className="md:col-span-6 flex flex-col justify-center items-center">
            {selectedCustomer ? (
              <div className="relative w-[320px] h-[580px] bg-black border-8 border-neutral-800 rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
                {/* Speaker & Camera Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-neutral-800 rounded-b-xl z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-neutral-700 rounded-full mb-1.5"></div>
                </div>

                {/* Phone Header */}
                <div className="bg-neutral-900 text-white pt-6 pb-3 px-4 flex items-center gap-2 border-b border-neutral-800">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs uppercase text-primary">
                    {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">{selectedCustomer.name}</div>
                    <div className="text-[10px] text-green-400">Online</div>
                  </div>
                  <div className="text-[10px] opacity-75 font-mono">
                    {messages[0]?.channel?.toUpperCase() || 'WHATSAPP'}
                  </div>
                </div>

                {/* Chat Message Area */}
                <div className="flex-1 bg-neutral-950 p-3 overflow-y-auto space-y-4 flex flex-col justify-end">
                  {loadingMessages ? (
                    <div className="text-center py-8 text-neutral-500 text-xs">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-neutral-600 text-xs my-auto">
                      No campaign messages received yet. Send a campaign from the Campaigns dashboard.
                    </div>
                  ) : (
                    messages.map((msg: any) => {
                      const isWhatsApp = msg.channel === 'whatsapp'
                      const isSms = msg.channel === 'sms'
                      const isEmail = msg.channel === 'email'

                      return (
                        <div key={msg._id} className="space-y-2">
                          <div
                            className={`max-w-[85%] p-3 rounded-xl text-xs space-y-2 shadow-sm text-left ${
                              isWhatsApp
                                ? 'bg-[#056162] text-white border border-[#0b8b8d]/30 ml-auto'
                                : isSms
                                  ? 'bg-blue-600 text-white ml-auto'
                                  : isEmail
                                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 ml-auto'
                                    : 'bg-neutral-900 text-neutral-200 border border-neutral-800 ml-auto'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.messageContent}</p>
                            <div className="flex items-center justify-end gap-1 text-[9px] opacity-70">
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span>{getStatusIcon(msg.status)}</span>
                            </div>
                          </div>

                          {/* Simulation Action Bar per Message */}
                          <div className="bg-neutral-900 border border-neutral-800 p-2 rounded-lg flex flex-col gap-1.5">
                            <div className="text-[9px] text-neutral-400 font-mono text-left">
                              Simulate Shopper Action (Log ID: ...{msg._id.slice(-6)})
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                size="sm"
                                variant={msg.status === 'sent' ? 'default' : 'outline'}
                                disabled={msg.status !== 'sent' || simulating !== null}
                                onClick={() => triggerCallback(msg._id, 'delivered')}
                              >
                                {msg.status !== 'sent' ? 'Delivered ✓' : 'Deliver'}
                              </Button>
                              <Button
                                size="sm"
                                variant={msg.status === 'delivered' ? 'default' : 'outline'}
                                disabled={msg.status !== 'delivered' || simulating !== null}
                                onClick={() => triggerCallback(msg._id, 'read')}
                              >
                                {msg.status === 'read' || msg.status === 'clicked' || msg.status === 'ordered' ? 'Read ✓' : 'Read'}
                              </Button>
                              <Button
                                size="sm"
                                variant={msg.status === 'read' ? 'default' : 'outline'}
                                disabled={msg.status !== 'read' || simulating !== null}
                                onClick={() => triggerCallback(msg._id, 'clicked')}
                              >
                                {msg.status === 'clicked' || msg.status === 'ordered' ? 'Clicked ✓' : 'Click Link'}
                              </Button>
                              <Button
                                size="sm"
                                variant={msg.status === 'clicked' ? 'default' : 'outline'}
                                disabled={msg.status !== 'clicked' || simulating !== null}
                                onClick={() => triggerCallback(msg._id, 'ordered', {
                                  name: 'Premium Espresso Roast (500g)',
                                  category: 'Coffee & Drinks',
                                  price: 18.99
                                })}
                              >
                                {msg.status === 'ordered' ? 'Ordered ✓' : 'Buy Product'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Keyboard Placeholder */}
                <div className="bg-neutral-900 border-t border-neutral-800 p-3 flex items-center justify-between">
                  <div className="w-full bg-neutral-950 border border-neutral-850 px-3 py-1.5 text-[10px] text-neutral-500 text-left rounded-full">
                    Message...
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-8">Select a shopper from the database list</div>
            )}
          </div>

          {/* Webhook Activity Console logs */}
          <div className="md:col-span-6 flex flex-col h-full">
            <Card className="border border-border flex-1 flex flex-col">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-mono flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    Callback Receipts Feed
                  </CardTitle>
                  <CardDescription className="text-xs">Live events processed by the CRM receipt hook</CardDescription>
                </div>
                <RefreshCw 
                  className={`w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-all`}
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem('user') || '{}')
                    if (user.id) fetchLogs(user.id)
                  }}
                />
              </CardHeader>
              <CardContent className="flex-1 bg-neutral-950 p-4 font-mono text-[10px] text-neutral-300 overflow-y-auto space-y-2 select-text">
                {callbackLogs.length === 0 ? (
                  <p className="text-neutral-500 italic">No callback activities logged. Start a campaign or trigger simulated phone actions.</p>
                ) : (
                  callbackLogs.map((log, i) => {
                    const time = new Date(log.updatedAt).toLocaleTimeString()
                    const channel = (log.campaignId?.type || 'whatsapp').toUpperCase()
                    const customerName = log.customerId?.name || 'Unknown'
                    const status = log.status.toUpperCase()

                    let color = 'text-gray-400'
                    if (status === 'DELIVERED') color = 'text-neutral-400'
                    if (status === 'READ') color = 'text-blue-400'
                    if (status === 'CLICKED') color = 'text-yellow-500 font-semibold'
                    if (status === 'ORDERED') color = 'text-green-400 font-bold'
                    if (status === 'FAILED') color = 'text-red-400'

                    return (
                      <div key={i} className="border-b border-neutral-900 pb-1.5">
                        <span className="text-neutral-500">[{time}] </span>
                        <span className="text-primary font-semibold">WEBHOOK_RECEIPT: </span>
                        <span>Log ...{log._id.slice(-6)} updated to </span>
                        <span className={color}>{status}</span>
                        <div>
                          <span className="text-neutral-400">├ Customer: </span>
                          <span>{customerName} </span>
                          <span className="text-neutral-400">({channel})</span>
                        </div>
                        {status === 'ORDERED' && (
                          <div className="text-green-500">
                            <span>└ Attribute: Converted! Added order value to campaign.</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
