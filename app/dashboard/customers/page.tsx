'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/sharp-card'
import { Input } from '@/components/ui/sharp-input'
import { Button } from '@/components/ui/sharp-button'
import { Search, Users, Sliders, Calendar, DollarSign, ShoppingBag } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [segments, setSegments] = useState<any[]>([])
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  
  // CSV Import States
  const [showImport, setShowImport] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  useEffect(() => {
    fetchSegments()
    fetchAllCustomers()
  }, [])

  useEffect(() => {
    if (selectedSegmentId) {
      fetchSegmentCustomers(selectedSegmentId)
    } else {
      fetchAllCustomers()
    }
  }, [selectedSegmentId])

  const fetchSegments = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
      const res = await fetch(`/api/segments?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setSegments(data)
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error)
    }
  }

  const fetchAllCustomers = async () => {
    setLoading(true)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
      const res = await fetch(`/api/customers?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSegmentCustomers = async (segmentId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/segments/${segmentId}/customers`)
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to fetch segment customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvText.trim()) return alert('Please paste CSV text first')
    setImporting(true)
    setImportResult(null)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    // Parse CSV lines
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
    const parsedCustomers = []

    for (const line of lines) {
      const parts = line.split(',')
      if (parts.length >= 3) {
        parsedCustomers.push({
          name: parts[0].trim(),
          email: parts[1].trim(),
          phone: parts[2].trim(),
          tagsString: parts[3] ? parts.slice(3).join(',').trim() : ''
        })
      }
    }

    if (parsedCustomers.length === 0) {
      alert('Could not parse any valid rows. Format: Name,Email,Phone,Tags')
      setImporting(false)
      return
    }

    try {
      const res = await fetch('/api/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          customers: parsedCustomers
        })
      })

      const data = await res.json()
      if (res.ok) {
        setImportResult(data)
        setCsvText('')
        if (selectedSegmentId) {
          fetchSegmentCustomers(selectedSegmentId)
        } else {
          fetchAllCustomers()
        }
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to connect to CSV import API')
    } finally {
      setImporting(false)
    }
  }

  // Filter local results by search query
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Customers Directory
          </h2>
          <p className="text-muted-foreground">
            View, search, and segment your shopper database in real-time.
          </p>
        </div>
        <Button onClick={() => setShowImport(!showImport)} variant="outline" className="text-xs">
          {showImport ? 'Close Ingest' : 'Batch Ingest (CSV)'}
        </Button>
      </div>

      {showImport && (
        <Card className="border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-sm">Batch Ingest Customers (CSV Ingestion)</CardTitle>
            <CardDescription className="text-xs">
              Paste customer records in CSV format (one per line). Format: <code>Name, Email, Phone, Tags (optional, comma-separated)</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleCSVImport} className="space-y-4">
              <textarea
                className="w-full px-4 py-2 bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-mono text-xs"
                placeholder="Aarav Sharma, aarav@gmail.com, +919876543210, coffee-lover, VIP&#10;Aditi Patel, aditi@yahoo.com, +919876543211, fashion-enthusiast"
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                required
                disabled={importing}
              />
              <div className="flex items-center justify-between">
                <Button type="submit" disabled={importing || !csvText.trim()} className="text-xs">
                  {importing ? 'Processing Ingestion...' : 'Ingest Customers'}
                </Button>
                {importResult && (
                  <span className="text-xs text-green-500 font-semibold">
                    ✓ {importResult.message}
                  </span>
                )}
              </div>
            </form>
            {importResult?.errors?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-none text-xs text-red-600 dark:text-red-400 text-left font-mono">
                <p className="font-bold mb-1">Import Warnings/Errors:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {importResult.errors.map((err: string, i: number) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Segment Selector Tabs */}
      <div className="space-y-2 text-left">
        <label className="text-sm font-semibold flex items-center gap-1">
          <Sliders className="w-4 h-4 text-primary" />
          Filter by Customer Segment
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSegmentId === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSegmentId('')}
          >
            All Shoppers ({loading && selectedSegmentId === '' ? '...' : selectedSegmentId === '' ? customers.length : 'All'})
          </Button>
          {segments.map((seg) => (
            <Button
              key={seg._id}
              variant={selectedSegmentId === seg._id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSegmentId(seg._id)}
            >
              {seg.name} {selectedSegmentId === seg._id ? `(${customers.length})` : ''}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Table */}
      <Card className="border border-border">
        <CardHeader className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Shoppers Database Records</CardTitle>
            <CardDescription>
              Showing {filteredCustomers.length} customer records retrieved directly from MongoDB
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Querying MongoDB...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No shoppers match your criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted border-b border-border text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Shopper</th>
                    <th className="px-6 py-4">Tags</th>
                    <th className="px-6 py-4">Orders Count</th>
                    <th className="px-6 py-4">Total Spent</th>
                    <th className="px-6 py-4">Last Purchase Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((c) => (
                    <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                        <div className="text-xs text-muted-foreground">{c.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map((t: string) => {
                            const isVip = t === 'VIP'
                            const isInactive = t === 'inactive'
                            return (
                              <span
                                key={t}
                                className={`px-2 py-0.5 text-[10px] font-mono font-medium border uppercase ${
                                  isVip
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                    : isInactive
                                      ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                      : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                                }`}
                              >
                                {t}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                          {c.totalOrders}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                          {c.totalSpent.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(c.lastPurchaseDate).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
