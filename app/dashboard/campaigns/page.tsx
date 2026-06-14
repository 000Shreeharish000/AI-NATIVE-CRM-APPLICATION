'use client'

import { useState, useEffect, Suspense } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/sharp-card'
import { Button } from '@/components/ui/sharp-button'
import { Input } from '@/components/ui/sharp-input'
import { Plus, Trash2, Send, Sparkles, RefreshCw, BarChart2, MessageSquare, CheckCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function CampaignsPageContent() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [segments, setSegments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('whatsapp')
  const [segmentId, setSegmentId] = useState('')
  const [content, setContent] = useState('')
  
  // AI generation states
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatingContent, setGeneratingContent] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null)
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    fetchCampaigns()
    fetchSegments()
  }, [])

  useEffect(() => {
    const prefill = searchParams.get('prefill')
    if (prefill === 'trend') {
      const segmentName = searchParams.get('segmentName')
      const channel = searchParams.get('channel') || 'whatsapp'
      const prefillTitle = searchParams.get('title') || ''
      const prefillDesc = searchParams.get('desc') || ''
      const prefillPrompt = searchParams.get('prompt') || ''

      setTitle(prefillTitle)
      setDescription(prefillDesc)
      setType(channel)
      setAiPrompt(prefillPrompt)
      setShowForm(true)

      if (segments.length > 0 && segmentName) {
        const matchingSegment = segments.find(s => s.name.toLowerCase() === segmentName.toLowerCase())
        if (matchingSegment) {
          setSegmentId(matchingSegment._id)
        }
      }
    }
  }, [searchParams, segments])

  // Poll active campaigns every 3 seconds to show progress
  useEffect(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active')
    if (activeCampaigns.length === 0) return

    const interval = setInterval(() => {
      fetchCampaignsSilent()
    }, 3000)

    return () => clearInterval(interval)
  }, [campaigns])

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
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignsSilent = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
      const res = await fetch(`/api/campaigns?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data)
      }
    } catch (error) {
      console.error('Failed to fetch campaigns silent:', error)
    }
  }

  const fetchSegments = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
      const res = await fetch(`/api/segments?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setSegments(data)
        if (data.length > 0) {
          setSegmentId(data[0]._id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          description,
          type,
          segmentId: segmentId || undefined,
          content,
          status: 'draft',
        }),
      })

      if (res.ok) {
        setTitle('')
        setDescription('')
        setType('whatsapp')
        setContent('')
        setAiPrompt('')
        setSegmentId(segments[0]?._id || '')
        setShowForm(false)
        await fetchCampaigns()
      }
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!segmentId) return alert('Please select a target segment first')
    setGeneratingContent(true)

    const selectedSegment = segments.find(s => s._id === segmentId)
    const segmentName = selectedSegment ? selectedSegment.name : 'Target Audience'

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          segmentName,
          description,
          additionalPrompt: aiPrompt
        })
      })

      const data = await res.json()
      if (res.ok) {
        setContent(data.content)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
      alert('Failed to connect to AI content generation service')
    } finally {
      setGeneratingContent(false)
    }
  }

  const handleLaunchCampaign = async (id: string, campaignSegmentId: string) => {
    setSendingCampaign(id)
    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: id,
          segmentId: campaignSegmentId
        })
      })

      const data = await res.json()
      if (res.ok) {
        await fetchCampaigns()
        setExpandedCampaignId(id)
      } else {
        alert('Launch error: ' + data.error)
      }
    } catch (error) {
      console.error('Launch campaign failed:', error)
    } finally {
      setSendingCampaign(null)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
        await fetchCampaigns()
      } catch (error) {
        console.error('Failed to delete campaign:', error)
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Campaigns</h2>
          <p className="text-muted-foreground">Launch and track marketing campaigns across multiple channels</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </Button>
      </div>

      {showForm && (
        <Card className="border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Title</label>
                <Input
                  placeholder="e.g., Summer Sale Coffee Promo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description / Business Objective</label>
                <textarea
                  className="w-full px-4 py-2 bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors text-sm"
                  placeholder="e.g. Promote our new Espresso beans with a 15% discount code."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Channel / Type</label>
                  <select
                    className="w-full px-4 py-2 bg-background border border-input text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="rcs">RCS</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience Segment</label>
                  <select
                    className="w-full px-4 py-2 bg-background border border-input text-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                    value={segmentId}
                    onChange={(e) => setSegmentId(e.target.value)}
                    disabled={submitting}
                  >
                    {segments.length === 0 ? (
                      <option value="">No segments available (Seed sandbox data first)</option>
                    ) : (
                      segments.map((seg) => (
                        <option key={seg._id} value={seg._id}>
                          {seg.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* AI Content Assistant Panel */}
              <div className="border border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-950/10 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Xeno AI Message Generation
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Instructions for tone/style (e.g. energetic, include discount code COFFEE15)"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={submitting || generatingContent}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-shrink-0 flex items-center gap-1 text-xs"
                    onClick={handleGenerateContent}
                    disabled={submitting || generatingContent}
                  >
                    {generatingContent ? 'Drafting...' : 'Draft with AI'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message Body Content</label>
                <textarea
                  className="w-full px-4 py-2 bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors font-mono text-xs"
                  placeholder="Paste or write your campaign message body here..."
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Draft'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-muted-foreground">Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No campaigns yet. Click New Campaign to get started!</p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign: any) => {
            const hasMetrics = campaign.metrics && campaign.metrics.sent > 0
            const segment = segments.find(s => s._id === campaign.segmentId)
            const segmentName = segment ? segment.name : 'Unknown Segment'

            const clickRate = hasMetrics && campaign.metrics.opened > 0
              ? ((campaign.metrics.clicked / campaign.metrics.opened) * 100).toFixed(1)
              : '0.0'
            const openRate = hasMetrics && campaign.metrics.delivered > 0
              ? ((campaign.metrics.opened / campaign.metrics.delivered) * 100).toFixed(1)
              : '0.0'
            const conversionRate = hasMetrics && campaign.metrics.clicked > 0
              ? ((campaign.metrics.conversions / campaign.metrics.clicked) * 100).toFixed(1)
              : '0.0'

            const isExpanded = expandedCampaignId === campaign._id

            return (
              <Card key={campaign._id} className="border border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{campaign.title}</h3>
                        <span className="text-xs uppercase px-1.5 py-0.5 border border-muted bg-muted text-muted-foreground font-semibold">
                          {campaign.type}
                        </span>
                        <span
                          className={`text-xs uppercase px-1.5 py-0.5 border font-semibold ${
                            campaign.status === 'active'
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : campaign.status === 'completed'
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                : 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                      
                      {campaign.segmentId && (
                        <div className="text-xs text-muted-foreground font-mono">
                          Target Segment: <span className="text-foreground font-semibold">{segmentName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-500 border-green-600"
                          onClick={() => handleLaunchCampaign(campaign._id, campaign.segmentId)}
                          disabled={sendingCampaign !== null}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sendingCampaign === campaign._id ? 'Launching...' : 'Launch'}</span>
                        </Button>
                      )}

                      {campaign.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={fetchCampaignsSilent}
                          className="flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Refresh Live</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedCampaignId(isExpanded ? null : campaign._id)}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign._id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Campaign Message Body Preview */}
                  <div className="bg-muted p-3 text-xs font-mono border border-border whitespace-pre-line text-left">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Message Content
                    </div>
                    {campaign.content || 'No message content defined.'}
                  </div>

                  {/* Expanded Performance Charts/Metrics */}
                  {(isExpanded || campaign.status === 'active' || campaign.status === 'completed') && hasMetrics && (
                    <div className="pt-4 border-t border-border space-y-4">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Performance Insights</h4>
                      
                      {/* Metric Card Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="border border-border p-3 text-left">
                          <span className="text-[10px] text-muted-foreground uppercase">Deliveries</span>
                          <p className="text-lg font-bold">
                            {campaign.metrics.delivered} / {campaign.metrics.sent}
                          </p>
                          <span className="text-[10px] text-green-500">
                            {((campaign.metrics.delivered / campaign.metrics.sent) * 100 || 0).toFixed(0)}% Rate
                          </span>
                        </div>
                        <div className="border border-border p-3 text-left">
                          <span className="text-[10px] text-muted-foreground uppercase">Open Rate (OR)</span>
                          <p className="text-lg font-bold">{openRate}%</p>
                          <span className="text-[10px] text-muted-foreground">{campaign.metrics.opened} Read</span>
                        </div>
                        <div className="border border-border p-3 text-left">
                          <span className="text-[10px] text-muted-foreground uppercase">CTR</span>
                          <p className="text-lg font-bold">{clickRate}%</p>
                          <span className="text-[10px] text-muted-foreground">{campaign.metrics.clicked} Clicks</span>
                        </div>
                        <div className="border border-border p-3 text-left">
                          <span className="text-[10px] text-muted-foreground uppercase">Conversions (Orders)</span>
                          <p className="text-lg font-bold">{campaign.metrics.conversions}</p>
                          <span className="text-[10px] text-green-500">
                            {conversionRate}% Purchase Rate
                          </span>
                        </div>
                      </div>

                      {/* Revenue & Spend Metrics */}
                      <div className="grid md:grid-cols-3 gap-4 border border-border p-4 bg-muted/30">
                        <div className="text-left">
                          <span className="text-[10px] text-muted-foreground uppercase">Total Spend</span>
                          <p className="text-xl font-bold">${campaign.metrics.spend.toFixed(2)}</p>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-muted-foreground uppercase">Attributed Revenue</span>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            ${campaign.metrics.revenue.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-muted-foreground uppercase">ROI Ratio</span>
                          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {campaign.metrics.spend > 0 
                              ? `${((campaign.metrics.revenue - campaign.metrics.spend) / campaign.metrics.spend * 100).toFixed(0)}%`
                              : '0%'}
                          </p>
                        </div>
                      </div>

                      {/* Funnel Progress Bars */}
                      <div className="space-y-2 text-left">
                        <div className="text-xs font-semibold">Message Funnel Completion</div>
                        
                        {/* Sent Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Sent ({campaign.metrics.sent})</span>
                            <span>100%</span>
                          </div>
                          <div className="w-full h-2 bg-muted">
                            <div className="bg-gray-400 h-2" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        {/* Delivered Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Delivered ({campaign.metrics.delivered})</span>
                            <span>{((campaign.metrics.delivered / campaign.metrics.sent) * 100 || 0).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted">
                            <div 
                              className="bg-neutral-500 h-2 transition-all duration-500" 
                              style={{ width: `${(campaign.metrics.delivered / campaign.metrics.sent) * 100 || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Read/Opened Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Read/Opened ({campaign.metrics.opened})</span>
                            <span>{((campaign.metrics.opened / campaign.metrics.sent) * 100 || 0).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted">
                            <div 
                              className="bg-blue-500 h-2 transition-all duration-500" 
                              style={{ width: `${(campaign.metrics.opened / campaign.metrics.sent) * 100 || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Clicked Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>Clicked ({campaign.metrics.clicked})</span>
                            <span>{((campaign.metrics.clicked / campaign.metrics.sent) * 100 || 0).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted">
                            <div 
                              className="bg-indigo-500 h-2 transition-all duration-500" 
                              style={{ width: `${(campaign.metrics.clicked / campaign.metrics.sent) * 100 || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-muted-foreground">Loading campaigns...</p>}>
      <CampaignsPageContent />
    </Suspense>
  )
}
